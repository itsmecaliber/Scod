
package com.gossip.controller;

import com.gossip.dto.UserProfileRequest;
import com.gossip.dto.UserProfileResponse;
import com.gossip.services.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    /** Create or update profile */
    @PostMapping(value = "/create-or-update", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createOrUpdateProfile(
            @RequestPart("profileName") String profileName,
            @RequestPart("bio") String bio,
            @RequestPart(value = "profilePic", required = false) MultipartFile profilePic,
            HttpServletRequest httpRequest) {

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7).trim();

        try {
            UserProfileRequest request = new UserProfileRequest();
            request.setProfileName(profileName);
            request.setBio(bio);
            request.setProfilePic(profilePic); // ✅ pass file to service

            UserProfileResponse responseDto = userProfileService.createOrUpdateProfile(request, token);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create or update profile: " + e.getMessage());
        }
    }


    /** Retrieve the profile of the authenticated user */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7).trim();

        try {
            UserProfileResponse responseDto =
                    userProfileService.getProfileByToken(token);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to fetch profile: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfileById(@PathVariable Long userId) {
        UserProfileResponse response = userProfileService.getProfileByUserId(userId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    /** Search users by profile name */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsersByProfileName(@RequestParam("query") String query) {
        try {
            List<UserProfileResponse> result = userProfileService.searchUsersByProfileName(query);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred during search: " + e.getMessage());
        }
    }
}