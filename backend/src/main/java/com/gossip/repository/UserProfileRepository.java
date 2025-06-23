package com.gossip.repository;

import com.gossip.entity.UserProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    // Fetch UserProfile with associated User entity by username
    @EntityGraph(attributePaths = "user")
    Optional<UserProfile> findWithUserByUserUsername(String username);

    // Fetch UserProfile by the associated User's id
    Optional<UserProfile> findByUserId(Long userId);

    // 🔍 New: Search users by profile name (partial match, case-insensitive)
    List<UserProfile> findByProfileNameContainingIgnoreCase(String query);
}
