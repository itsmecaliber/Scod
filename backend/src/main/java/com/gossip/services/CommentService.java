package com.gossip.services;

import com.gossip.dto.CommentDTO;
import com.gossip.entity.Comment;
import com.gossip.entity.Post;
import com.gossip.entity.User;
import com.gossip.repository.CommentRepository;
import com.gossip.repository.PostRepository;
import com.gossip.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public CommentService(CommentRepository commentRepo, PostRepository postRepo, UserRepository userRepo, JwtUtil jwtUtil) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    public CommentDTO addComment(Long postId, String content, String token) {
        String username = jwtUtil.extractUsername(token);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content);

        Comment saved = commentRepo.save(comment);

        return new CommentDTO(
                saved.getId(),
                postId,
                user.getId(),
                user.getUsername(),
                content,
                saved.getCreatedAt()
        );
    }

    public List<CommentDTO> getCommentsForPost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        return commentRepo.findByPost(post).stream()
                .map(c -> new CommentDTO(
                        c.getId(),
                        postId,
                        c.getUser().getId(),
                        c.getUser().getUsername(),
                        c.getContent(),
                        c.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
