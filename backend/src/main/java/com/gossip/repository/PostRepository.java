package com.gossip.repository;

import com.gossip.entity.Post;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // find all posts by a given user
    List<Post> findAllByUserId(Long userId);
    @EntityGraph(attributePaths = {"user", "user.userProfile"})
    List<Post> findTop15ByOrderByCreatedAtDesc();

}


