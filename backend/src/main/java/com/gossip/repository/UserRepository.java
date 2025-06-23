package com.gossip.repository;

import com.gossip.dto.UserFollowInfoDTO;
import com.gossip.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

  // Fetch User with associated UserProfile (used in UserProfileService fallback)
  @EntityGraph(attributePaths = "userProfile")
  Optional<User> findWithProfileByUsername(String username);

  // Add this method for PostService fallback
  Optional<User> findByUsername(String username);

  // ✅ Top N users with most followers
  @Query("SELECT new com.gossip.dto.UserFollowInfoDTO(u.id, u.username, SIZE(u.followers), SIZE(u.following)) " +
          "FROM User u ORDER BY SIZE(u.followers) DESC")
  List<UserFollowInfoDTO> findTopUsersByFollowers(Pageable pageable);
}
