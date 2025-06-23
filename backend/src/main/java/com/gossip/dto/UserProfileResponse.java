package com.gossip.dto;

public class UserProfileResponse {
    private Long userId;
    private String profileName;
    private String bio;
    private String profilePic;

    public UserProfileResponse() {}

    public UserProfileResponse(Long userId, String profileName, String bio, String profilePic) {
        this.userId = userId;
        this.profileName = profileName;
        this.bio = bio;
        this.profilePic = profilePic;
    }

    // Getters and setters

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }
}
