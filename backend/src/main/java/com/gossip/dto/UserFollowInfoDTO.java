// src/main/java/com/gossip/dto/UserFollowInfoDTO.java
package com.gossip.dto;

public class UserFollowInfoDTO {
    private Long userId;
    private String username;
    private int followersCount;
    private int followingCount;

    // No-argument constructor (important for JSON serialization)
    public UserFollowInfoDTO() {
    }

    public UserFollowInfoDTO(Long userId, String username, int followersCount, int followingCount) {
        this.userId = userId;
        this.username = username;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public int getFollowersCount() {
        return followersCount;
    }
    public void setFollowersCount(int followersCount) {
        this.followersCount = followersCount;
    }

    public int getFollowingCount() {
        return followingCount;
    }
    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }
}
