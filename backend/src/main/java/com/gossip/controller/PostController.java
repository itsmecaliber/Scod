package com.gossip.controller;

import com.gossip.dto.PostRequest;
import com.gossip.dto.PostResponse;
import com.gossip.services.PostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /** ✅ Updated: Create a post with media from frontend form */
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("media") MultipartFile media,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            PostResponse postResponse = postService.createPostWithMedia(title, description, media, token);
            return ResponseEntity.ok(postResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create post: " + e.getMessage());
        }
    }
    //feed
    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        List<PostResponse> feed = postService.getLatestPosts();
        return ResponseEntity.ok(feed);
    }


    /** (Optional) Keep old JSON-based post creation if needed */
    @PostMapping(value = "/create-json", consumes = {"application/json"})
    public ResponseEntity<?> createPostJson(
            @RequestBody PostRequest request,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            PostResponse postResponse = postService.createPost(request, token);
            return ResponseEntity.ok(postResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create post: " + e.getMessage());
        }
    }

    /** Get all posts by logged-in user */
    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            List<PostResponse> posts = postService.getPostsByUser(token);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to fetch posts: " + e.getMessage());
        }
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @RequestBody PostRequest request,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        try {
            PostResponse updatedPost = postService.updatePost(postId, request, token);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long postId,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        try {
            postService.deletePost(postId, token);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete post: " + e.getMessage());
        }
    }


    // GET posts by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUserId(@PathVariable Long userId) {
        List<PostResponse> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring(7).trim();
    }


    //get post by postid
    // 🔍 Get a single post for detailed view
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long postId) {
        try {
            PostResponse post = postService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

}
