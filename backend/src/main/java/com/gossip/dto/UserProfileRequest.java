package com.gossip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public class UserProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String profileName;

    @NotBlank
    @Size(max = 255)
    private String bio;

    private MultipartFile profilePic;

    // Constructors
    public UserProfileRequest() {}

    public UserProfileRequest(String profileName, String bio, MultipartFile profilePic) {
        this.profileName = profileName;
        this.bio = bio;
        this.profilePic = profilePic;
    }

    // Getters & Setters
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

    public MultipartFile getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(MultipartFile profilePic) {
        this.profilePic = profilePic;
    }
}
