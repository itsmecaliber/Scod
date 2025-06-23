package com.gossip.services;

import com.gossip.dto.UserFollowInfoDTO;
import com.gossip.dto.UserFollowListDTO;
import com.gossip.entity.User;
import com.gossip.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    // ✅ Follow another user
    public void followUser(Long followerId, Long followedId) {
        System.out.println("Attempting to follow user:");
        System.out.println("Follower ID: " + followerId + ", Followed ID: " + followedId);

        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followedOpt = userRepository.findById(followedId);

        if (followerOpt.isPresent() && followedOpt.isPresent()) {
            User follower = followerOpt.get();
            User followed = followedOpt.get();

            // ❌ Admins cannot follow or be followed
            if (follower.isAdmin() || followed.isAdmin()) {
                throw new IllegalStateException("Admins cannot follow or be followed.");
            }

            System.out.println("Before follow - Following count: " + follower.getFollowing().size());
            follower.follow(followed);
            userRepository.save(follower);
            userRepository.save(followed);
            System.out.println("Follow successful. After follow - Following count: " + follower.getFollowing().size());
        } else {
            System.out.println("Follow failed: one or both users not found.");
        }
    }

    // ✅ Unfollow a user
    public void unfollowUser(Long followerId, Long followedId) {
        System.out.println("Attempting to unfollow user:");
        System.out.println("Follower ID: " + followerId + ", Followed ID: " + followedId);

        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followedOpt = userRepository.findById(followedId);

        if (followerOpt.isPresent() && followedOpt.isPresent()) {
            User follower = followerOpt.get();
            User followed = followedOpt.get();

            // ❌ Admins cannot follow or be followed
            if (follower.isAdmin() || followed.isAdmin()) {
                throw new IllegalStateException("Admins cannot follow or be followed.");
            }

            System.out.println("Before unfollow - Following count: " + follower.getFollowing().size());
            follower.unfollow(followed);
            userRepository.save(follower);
            userRepository.save(followed);
            System.out.println("Unfollow successful. After unfollow - Following count: " + follower.getFollowing().size());
        } else {
            System.out.println("Unfollow failed: one or both users not found.");
        }
    }

    // ✅ Fetch follower and following count
    public UserFollowInfoDTO getUserFollowInfo(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int followersCount = user.getFollowers().size();
            int followingCount = user.getFollowing().size();
            System.out.println("Fetching follow info for userId: " + userId + " | Followers: " + followersCount + " | Following: " + followingCount);
            return new UserFollowInfoDTO(user.getId(), user.getUsername(), followersCount, followingCount);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public UserFollowListDTO getUserFollowList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<String> followers = user.getFollowers().stream()
                .map(User::getUsername)
                .toList();

        List<String> following = user.getFollowing().stream()
                .map(User::getUsername)
                .toList();

        return new UserFollowListDTO(user.getId(), user.getUsername(), followers, following);
    }

    // ✅ Fetch top N users with highest followers
    public List<UserFollowInfoDTO> getTopUsersByFollowers(int limit) {
        return userRepository.findTopUsersByFollowers(PageRequest.of(0, limit));
    }

    public User findByUsername(String username) {
        System.out.println("Looking up user by username: " + username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    // ✅ Total users count for admin dashboard
    public long getTotalUsers() {
        return userRepository.count();
    }
}
