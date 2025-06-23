package com.gossip.repository;

import com.gossip.dto.ChatPartnerDTO;
import com.gossip.entity.Message;
import com.gossip.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversationBetweenUsers(Long userId1, Long userId2);

    List<Message> findByReceiverAndSeenIsFalse(User receiver);

    List<Message> findBySenderAndReceiverAndSeenFalse(User sender, User receiver);

    // ✅ Fixed Query: Properly fetch latest message per unique chat partner
    @Query("""
    	    SELECT new com.gossip.dto.ChatPartnerDTO(
    	        u.id,
    	        u.username,
    	        p.profileName,
    	        m.content,
    	        m.timestamp
    	    )
    	    FROM Message m
    	    JOIN User u ON (u.id = CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END)
    	    JOIN UserProfile p ON p.user.id = u.id
    	    WHERE m.id IN (
    	        SELECT MAX(m2.id)
    	        FROM Message m2
    	        WHERE m2.sender.id = :userId OR m2.receiver.id = :userId
    	        GROUP BY CASE 
    	            WHEN m2.sender.id = :userId THEN m2.receiver.id
    	            ELSE m2.sender.id
    	        END
    	    )
    	    ORDER BY m.timestamp DESC
    	""")
    	List<ChatPartnerDTO> findChatPartnersWithLatestMessage(@Param("userId") Long userId);


}
