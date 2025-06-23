package com.gossip.repository;

import com.gossip.entity.JobPost;
import com.gossip.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    // ✅ Fetch jobs posted by a specific user
    List<JobPost> findByPostedBy(User user);

    // ✅ Check if a job exists by ID and user (used to authorize delete)
    boolean existsByIdAndPostedBy(Long id, User postedBy);

    // ✅ Optional: fetch job by ID and user for stricter access control
    Optional<JobPost> findByIdAndPostedBy(Long id, User postedBy);
}
