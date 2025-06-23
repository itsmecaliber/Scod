package com.gossip.services;

import com.gossip.dto.PostRequest;
import com.gossip.dto.PostResponse;
import com.gossip.entity.Post;
import com.gossip.entity.User;
import com.gossip.repository.PostRepository;
import com.gossip.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    private static final String UPLOAD_DIR = "uploads";

    public PostService(PostRepository postRepo, UserRepository userRepo, JwtUtil jwtUtil) {
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public PostResponse createPost(PostRequest dto, String token) {
        Long userId = getUserIdFromToken(token);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = new Post(user, dto.getTitle(), dto.getContent(), dto.getImageUrl());
        post.setMediaPath(null);
        post.setMediaType(null);

        user.addPost(post);
        Post saved = postRepo.save(post);

        String profileName = user.getUserProfile() != null ? user.getUserProfile().getProfileName() : null;

        return new PostResponse(
                saved.getId(),
                userId,
                saved.getTitle(),
                saved.getContent(),
                saved.getImageUrl(),
                saved.getCreatedAt(),
                saved.getMediaPath(),
                saved.getMediaType(),
                profileName
        );
    }

    @Transactional
    public PostResponse createPostWithMedia(String title, String content, MultipartFile media, String token) {
        Long userId = getUserIdFromToken(token);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String mediaPath = null;
        String mediaType = null;
        if (media != null && !media.isEmpty()) {
            try {
                mediaPath = saveMediaToDisk(media);
                mediaType = media.getContentType();
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save media file");
            }
        }

        Post post = new Post();
        post.setUser(user);
        post.setTitle(title);
        post.setContent(content);
        post.setImageUrl(null);
        post.setMediaPath(mediaPath);
        post.setMediaType(mediaType);

        user.addPost(post);
        Post saved = postRepo.save(post);

        String profileName = user.getUserProfile() != null ? user.getUserProfile().getProfileName() : null;

        return new PostResponse(
                saved.getId(),
                userId,
                saved.getTitle(),
                saved.getContent(),
                saved.getImageUrl(),
                saved.getCreatedAt(),
                saved.getMediaPath(),
                saved.getMediaType(),
                profileName
        );
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest dto, String token) {
        Long userId = getUserIdFromToken(token);

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to edit this post");
        }

        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());

        Post updated = postRepo.save(post);

        String profileName = post.getUser().getUserProfile() != null
                ? post.getUser().getUserProfile().getProfileName()
                : null;

        return new PostResponse(
                updated.getId(),
                userId,
                updated.getTitle(),
                updated.getContent(),
                updated.getImageUrl(),
                updated.getCreatedAt(),
                updated.getMediaPath(),
                updated.getMediaType(),
                profileName
        );
    }

    @Transactional
    public void deletePost(Long postId, String token) {
        Long userId = getUserIdFromToken(token);

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to delete this post");
        }

        postRepo.delete(post);
    }

    public List<PostResponse> getPostsByUser(String token) {
        Long userId = getUserIdFromToken(token);
        List<Post> posts = postRepo.findAllByUserId(userId);

        return posts.stream()
                .map(post -> {
                    String profileName = post.getUser().getUserProfile() != null
                            ? post.getUser().getUserProfile().getProfileName()
                            : null;

                    return new PostResponse(
                            post.getId(),
                            userId,
                            post.getTitle(),
                            post.getContent(),
                            post.getImageUrl(),
                            post.getCreatedAt(),
                            post.getMediaPath(),
                            post.getMediaType(),
                            profileName
                    );
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getPostsByUserId(Long userId) {
        List<Post> posts = postRepo.findAllByUserId(userId);

        return posts.stream()
                .map(post -> {
                    String profileName = post.getUser().getUserProfile() != null
                            ? post.getUser().getUserProfile().getProfileName()
                            : null;

                    return new PostResponse(
                            post.getId(),
                            post.getUser().getId(),
                            post.getTitle(),
                            post.getContent(),
                            post.getImageUrl(),
                            post.getCreatedAt(),
                            post.getMediaPath(),
                            post.getMediaType(),
                            profileName
                    );
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getLatestPosts() {
        List<Post> posts = postRepo.findTop15ByOrderByCreatedAtDesc();

        return posts.stream()
                .map(post -> {
                    User user = post.getUser();
                    String profileName = user.getUserProfile() != null
                            ? user.getUserProfile().getProfileName()
                            : null;

                    return new PostResponse(
                            post.getId(),
                            user.getId(),
                            post.getTitle(),
                            post.getContent(),
                            post.getImageUrl(),
                            post.getCreatedAt(),
                            post.getMediaPath(),
                            post.getMediaType(),
                            profileName
                    );
                })
                .collect(Collectors.toList());
    }

    private Long getUserIdFromToken(String token) {
        try {
            return jwtUtil.extractUserId(token);
        } catch (IllegalArgumentException ex) {
            String username = jwtUtil.extractUsername(token);
            User fallbackUser = userRepo.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            return fallbackUser.getId();
        }
    }

    private String saveMediaToDisk(MultipartFile file) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : "";

        String uniqueName = UUID.randomUUID().toString() + ext;
        Path filePath = Paths.get(UPLOAD_DIR, uniqueName);
        Files.write(filePath, file.getBytes());

        return filePath.toString().replace("\\", "/");
    }

    public PostResponse getPostById(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        User user = post.getUser();
        String profileName = user.getUserProfile() != null
                ? user.getUserProfile().getProfileName()
                : null;

        return new PostResponse(
                post.getId(),
                user.getId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                post.getCreatedAt(),
                post.getMediaPath(),
                post.getMediaType(),
                profileName
        );
    }
    public long getTotalPostCount() {
        return postRepo.count();
    }



}
