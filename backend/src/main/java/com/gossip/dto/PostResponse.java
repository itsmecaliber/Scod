package com.gossip.dto;

import java.time.Instant;

public class PostResponse {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String imageUrl;
    private Instant createdAt;
    private String mediaPath;
    private String mediaType;
    private String profileName;  // ✅ New

    public PostResponse() {}

    // Constructor without media info (backward compatibility)
    public PostResponse(Long id,
                        Long userId,
                        String title,
                        String content,
                        String imageUrl,
                        Instant createdAt) {
        this(id, userId, title, content, imageUrl, createdAt, null, null, null);
    }

    // Constructor with media info but without profileName
    public PostResponse(Long id,
                        Long userId,
                        String title,
                        String content,
                        String imageUrl,
                        Instant createdAt,
                        String mediaPath,
                        String mediaType) {
        this(id, userId, title, content, imageUrl, createdAt, mediaPath, mediaType, null);
    }

    // ✅ Full constructor including profileName
    public PostResponse(Long id,
                        Long userId,
                        String title,
                        String content,
                        String imageUrl,
                        Instant createdAt,
                        String mediaPath,
                        String mediaType,
                        String profileName) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.mediaPath = mediaPath;
        this.mediaType = mediaType;
        this.profileName = profileName;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getMediaPath() {
        return mediaPath;
    }

    public String getMediaType() {
        return mediaType;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }
}
