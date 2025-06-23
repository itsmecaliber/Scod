package com.gossip.repository;

import com.gossip.entity.Like;
import com.gossip.entity.Post;
import com.gossip.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    int countByPost(Post post);
}
