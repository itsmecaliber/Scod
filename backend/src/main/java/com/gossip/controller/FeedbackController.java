package com.gossip.controller;

import com.gossip.dto.FeedbackRequestDTO;
import com.gossip.dto.FeedbackResponseDTO;
import com.gossip.entity.User;
import com.gossip.repository.UserRepository;
import com.gossip.services.FeedbackService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepository) {
        this.feedbackService = feedbackService;
        this.userRepository = userRepository;
    }

    // Endpoint to submit feedback with message and star rating
    @PostMapping
    public ResponseEntity<String> submitFeedback(
            @RequestBody FeedbackRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Get the authenticated user
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Pass DTO and User to the service layer
        feedbackService.submitFeedback(dto, user);

        return ResponseEntity.ok("Feedback submitted successfully");
    }

    // Admin endpoint to retrieve all feedback with star ratings
    @GetMapping("/admin")
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
