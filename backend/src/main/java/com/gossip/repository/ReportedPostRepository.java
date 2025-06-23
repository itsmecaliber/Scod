package com.gossip.repository;

import com.gossip.entity.ReportedPost;
import com.gossip.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportedPostRepository extends JpaRepository<ReportedPost, Long> {
    void deleteAllByPost(Post post);

    long countByResolvedFalse();  // Add this line
}
