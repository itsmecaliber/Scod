package com.gossip.controller;

import com.gossip.dto.UserFollowInfoDTO;
import com.gossip.dto.UserFollowListDTO;
import com.gossip.services.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ Follow user
    @PostMapping("/{followerId}/follow/{followedId}")
    public ResponseEntity<String> followUser(@PathVariable Long followerId, @PathVariable Long followedId) {
        userService.followUser(followerId, followedId);
        return ResponseEntity.ok("User " + followerId + " followed user " + followedId);
    }

    // ✅ Unfollow user
    @PostMapping("/{followerId}/unfollow/{followedId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long followerId, @PathVariable Long followedId) {
        userService.unfollowUser(followerId, followedId);
        return ResponseEntity.ok("User " + followerId + " unfollowed user " + followedId);
    }

    // ✅ Get follower and following count
    @GetMapping("/{userId}/follow-info")
    public ResponseEntity<UserFollowInfoDTO> getUserFollowInfo(@PathVariable Long userId) {
        UserFollowInfoDTO followInfo = userService.getUserFollowInfo(userId);
        return ResponseEntity.ok(followInfo);
    }

    // ✅ Get list of followers and following
    @GetMapping("/{userId}/follow-list")
    public ResponseEntity<UserFollowListDTO> getFollowList(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserFollowList(userId));
    }

    // ✅ NEW: Get top N users by number of followers
    @GetMapping("/top-followed")
    public ResponseEntity<List<UserFollowInfoDTO>> getTopFollowedUsers(
            @RequestParam(defaultValue = "5") int limit) {
        List<UserFollowInfoDTO> topUsers = userService.getTopUsersByFollowers(limit);
        return ResponseEntity.ok(topUsers);
    }
}
