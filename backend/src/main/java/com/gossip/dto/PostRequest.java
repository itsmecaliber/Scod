package com.gossip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    @Size(max = 255)
    private String imageUrl;

    public PostRequest() {}
    public PostRequest(String title, String content, String imageUrl) {
        this.title    = title;
        this.content  = content;
        this.imageUrl = imageUrl;
    }

    // **Make sure these getters exist exactly as below**
    public String getTitle() {
        return title;
    }
    public String getContent() {
        return content;
    }
    public String getImageUrl() {
        return imageUrl;
    }

    // (you can add setters if you need)
}
