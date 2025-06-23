package com.gossip.services;

import com.gossip.dto.UserProfileRequest;
import com.gossip.dto.UserProfileResponse;
import com.gossip.entity.User;
import com.gossip.entity.UserProfile;
import com.gossip.repository.UserProfileRepository;
import com.gossip.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/profile_pics";

    public UserProfileService(UserProfileRepository userProfileRepository,
                              UserRepository userRepository,
                              JwtUtil jwtUtil) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserProfileResponse createOrUpdateProfile(UserProfileRequest dto, String token) {
        Long userId;
        try {
            userId = jwtUtil.extractUserId(token);
            System.out.println("[createOrUpdateProfile] Extracted userId from token: " + userId);
        } catch (IllegalArgumentException ex) {
            System.out.println("[createOrUpdateProfile] userId claim missing, falling back to username");
            String username = jwtUtil.extractUsername(token);
            User fallback = userRepository.findWithProfileByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            userId = fallback.getId();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findById(userId).orElse(null);

        String profilePicPath = null;
        MultipartFile profilePicFile = dto.getProfilePic();
        if (profilePicFile != null && !profilePicFile.isEmpty()) {
            try {
                if (profile != null && profile.getProfilePic() != null) {
                    String oldPath = profile.getProfilePic().replaceFirst("^/+", "");
                    File oldFile = new File(oldPath);
                    if (oldFile.exists() && oldFile.isFile()) {
                        oldFile.delete();
                    }
                }

                Files.createDirectories(Paths.get(UPLOAD_DIR));
                String fileName = UUID.randomUUID() + "_" + profilePicFile.getOriginalFilename();
                File dest = new File(UPLOAD_DIR + File.separator + fileName);
                profilePicFile.transferTo(dest);
                profilePicPath = "/uploads/profile_pics/" + fileName;
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store profile picture");
            }
        }

        if (profile != null) {
            profile.setProfileName(dto.getProfileName());
            profile.setBio(dto.getBio());
            if (profilePicPath != null) {
                profile.setProfilePic(profilePicPath);
            }
        } else {
            profile = new UserProfile();
            profile.setProfileName(dto.getProfileName());
            profile.setBio(dto.getBio());
            profile.setProfilePic(profilePicPath);
            profile.setUser(user);
            user.setUserProfile(profile);
        }

        UserProfile saved = userProfileRepository.saveAndFlush(profile);
        return new UserProfileResponse(
                saved.getUser().getId(),
                saved.getProfileName(),
                saved.getBio(),
                saved.getProfilePic()
        );
    }

    public UserProfileResponse getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            profile.setProfileName("");
            profile.setBio("");
            user.setUserProfile(profile);
            userProfileRepository.save(profile);
        }

        return new UserProfileResponse(
                user.getId(),
                profile.getProfileName(),
                profile.getBio(),
                profile.getProfilePic()
        );
    }

    public UserProfileResponse getProfileByToken(String token) {
        Long userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (IllegalArgumentException ex) {
            String username = jwtUtil.extractUsername(token);
            User fallback = userRepository.findWithProfileByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            userId = fallback.getId();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            profile.setProfileName("");
            profile.setBio("");
            user.setUserProfile(profile);
            userProfileRepository.save(profile);
        }

        return new UserProfileResponse(
                user.getId(),
                profile.getProfileName(),
                profile.getBio(),
                profile.getProfilePic()
        );
    }

    public List<UserProfileResponse> searchUsersByProfileName(String query) {
        List<UserProfile> users = userProfileRepository.findByProfileNameContainingIgnoreCase(query);
        return users.stream()
                .map(profile -> new UserProfileResponse(
                        profile.getUser().getId(),
                        profile.getProfileName(),
                        profile.getBio(),
                        profile.getProfilePic()
                ))
                .collect(Collectors.toList());
    }
}
