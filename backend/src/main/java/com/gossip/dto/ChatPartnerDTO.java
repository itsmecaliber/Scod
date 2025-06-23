package com.gossip.dto;

import java.time.LocalDateTime;

public class ChatPartnerDTO {
    private Long userId;
    private String username;
    private String profileName;
    private String lastMessage;
    private LocalDateTime lastMessageTime;

    // No-args constructor (required for JSON deserialization, etc.)
    public ChatPartnerDTO() {}

    // Full constructor
    public ChatPartnerDTO(Long userId, String username, String profileName, String lastMessage, LocalDateTime lastMessageTime) {
        this.userId = userId;
        this.username = username;
        this.profileName = profileName;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
    }

    // Constructor without username (if not needed or resolved separately)
    public ChatPartnerDTO(Long userId, String profileName, String lastMessage, LocalDateTime lastMessageTime) {
        this.userId = userId;
        this.profileName = profileName;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getProfileName() {
        return profileName;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
 // Constructor with 3 parameters (userId, profileName, lastMessage)
    public ChatPartnerDTO(Long userId, String profileName, String lastMessage) {
        this.userId = userId;
        this.profileName = profileName;
        this.lastMessage = lastMessage;
        this.lastMessageTime = null;  // You can default this or add later via setter
    }


    @Override
    public String toString() {
        return "ChatPartnerDTO{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", profileName='" + profileName + '\'' +
                ", lastMessage='" + lastMessage + '\'' +
                ", lastMessageTime=" + lastMessageTime +
                '}';
    }
}
