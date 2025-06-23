package com.gossip.controller;

import com.gossip.dto.ChatMessage;
import com.gossip.dto.ChatMessageResponse;
import com.gossip.dto.ChatPartnerDTO;
import com.gossip.entity.Message;
import com.gossip.entity.User;
import com.gossip.services.JwtService;
import com.gossip.services.MessageService;
import com.gossip.services.UserProfileService;
import com.gossip.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserProfileService userProfileService;

    // Send a message (POST)
    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestBody ChatMessage chatMessage) {
        Message saved = messageService.saveMessage(chatMessage);
        ChatMessageResponse response = new ChatMessageResponse(saved);
        return ResponseEntity.ok(response);
    }

    // Get conversation between two users
    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessageResponse>> getConversation(
            @RequestParam Long userId1,
            @RequestParam Long userId2
    ) {
        List<Message> messages = messageService.getConversation(userId1, userId2);
        List<ChatMessageResponse> responses = messages.stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get unseen messages for a user
    @GetMapping("/unseen/{receiverId}")
    public ResponseEntity<List<ChatMessageResponse>> getUnseenMessages(@PathVariable Long receiverId) {
        List<Message> messages = messageService.getUnseenMessages(receiverId);
        List<ChatMessageResponse> responses = messages.stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Mark messages as seen from sender to receiver
    @PutMapping("/mark-seen")
    public ResponseEntity<String> markMessagesAsSeen(
            @RequestParam Long senderId,
            @RequestParam Long receiverId
    ) {
        messageService.markMessagesAsSeen(senderId, receiverId);
        return ResponseEntity.ok("Messages marked as seen.");
    }

    // ✅ Get list of chat partners with latest message and their profile name
    @GetMapping("/chat-partners")
    public ResponseEntity<List<ChatPartnerDTO>> getChatPartners(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            return ResponseEntity.badRequest().build();
        }

        String username = jwtService.extractUsername(token);
        if (username == null) {
            return ResponseEntity.status(401).build();
        }

        User currentUser = userService.findByUsername(username);
        Long userId = currentUser.getId();

        List<ChatPartnerDTO> rawPartners = messageService.getChatPartners(userId);

        // Enrich with profileName from UserProfileService
        List<ChatPartnerDTO> enrichedPartners = rawPartners.stream()
                .map(partner -> {
                    String profileName = userProfileService.getProfileByUserId(partner.getUserId()).getProfileName();
                    return new ChatPartnerDTO(partner.getUserId(), profileName, partner.getLastMessage());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(enrichedPartners);
    }

    // Helper to extract token from Authorization header
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
