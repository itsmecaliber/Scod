package com.gossip.dto;

public class LikeDTO {
    private Long postId;
    private Long userId;
    private boolean liked;

    public LikeDTO() {}

    public LikeDTO(Long postId, Long userId, boolean liked) {
        this.postId = postId;
        this.userId = userId;
        this.liked = liked;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isLiked() {
        return liked;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }
}
