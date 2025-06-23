package com.gossip.repository;

import com.gossip.entity.ReportedUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportedUserRepository extends JpaRepository<ReportedUser, Long> {
    long countByResolvedFalse();  // Add this method
}
