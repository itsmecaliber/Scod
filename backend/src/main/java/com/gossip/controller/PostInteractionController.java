package com.gossip.controller;

import com.gossip.dto.CommentDTO;
import com.gossip.dto.LikeDTO;
import com.gossip.services.CommentService;
import com.gossip.services.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interact")
@CrossOrigin(origins = "*")
public class PostInteractionController {

    private final LikeService likeService;
    private final CommentService commentService;

    public PostInteractionController(LikeService likeService, CommentService commentService) {
        this.likeService = likeService;
        this.commentService = commentService;
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7).trim();
    }

    @PostMapping("/like/{postId}")
    public ResponseEntity<LikeDTO> toggleLike(@PathVariable Long postId, HttpServletRequest request) {
        String token = extractToken(request);
        return ResponseEntity.ok(likeService.toggleLike(postId, token));
    }

    @GetMapping("/likes/{postId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }

    @GetMapping("/liked/{postId}")
    public ResponseEntity<Boolean> isLikedByUser(@PathVariable Long postId, HttpServletRequest request) {
        String token = extractToken(request);
        return ResponseEntity.ok(likeService.hasUserLiked(postId, token));
    }

    // ✅ Updated: now accepts content as JSON body
    @PostMapping("/comment/{postId}")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long postId,
                                                 @RequestBody Map<String, String> body,
                                                 HttpServletRequest request) {
        String token = extractToken(request);
        String content = body.get("content");
        return ResponseEntity.ok(commentService.addComment(postId, content, token));
    }

    @GetMapping("/comment/{postId}")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }
}
