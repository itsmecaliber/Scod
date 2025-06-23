package com.gossip.services;

import com.gossip.dto.LikeDTO;
import com.gossip.entity.Like;
import com.gossip.entity.Post;
import com.gossip.entity.User;
import com.gossip.repository.LikeRepository;
import com.gossip.repository.PostRepository;
import com.gossip.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Optional;

@Service
public class LikeService {

    private final LikeRepository likeRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public LikeService(LikeRepository likeRepo, PostRepository postRepo, UserRepository userRepo, JwtUtil jwtUtil) {
        this.likeRepo = likeRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    public LikeDTO toggleLike(Long postId, String token) {
        String username = jwtUtil.extractUsername(token);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Optional<Like> existing = likeRepo.findByUserAndPost(user, post);

        if (existing.isPresent()) {
            likeRepo.delete(existing.get());
            return new LikeDTO(postId, user.getId(), false);
        } else {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            likeRepo.save(like);
            return new LikeDTO(postId, user.getId(), true);
        }
    }

    public Long countLikes(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return (long) likeRepo.countByPost(post);
    }

    public boolean hasUserLiked(Long postId, String token) {
        String username = jwtUtil.extractUsername(token);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        return likeRepo.findByUserAndPost(user, post).isPresent();
    }
}
