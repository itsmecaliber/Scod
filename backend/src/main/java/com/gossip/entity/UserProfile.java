package com.gossip.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "user_profile")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserProfile {

    @Id
    private Long id; // Shared PK with User

    @Column(name = "profile_name", nullable = false)
    private String profileName;

    @Column(name = "bio", nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_pic")
    private String profilePic;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    public UserProfile() {}

    public UserProfile(User user, String profileName, String bio, String profilePic) {
        this.user = user;
        this.profileName = profileName;
        this.bio = bio;
        this.profilePic = profilePic;
    }

    // Getters and setters

    public Long getId() { return id; }

    public String getProfileName() { return profileName; }
    public void setProfileName(String profileName) { this.profileName = profileName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Optionally, override toString(), but **exclude** user to prevent recursion
}
