package com.gossip.services;

import com.gossip.dto.FeedbackRequestDTO;
import com.gossip.dto.FeedbackResponseDTO;
import com.gossip.entity.Feedback;
import com.gossip.entity.User;
import com.gossip.repository.FeedbackRepository;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    // Store feedback with stars
    public void submitFeedback(FeedbackRequestDTO dto, User user) {
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setMessage(dto.getMessage());
        feedback.setStars(dto.getStars()); // set stars from DTO
        feedback.setSubmittedAt(new Date());

        feedbackRepository.save(feedback);
    }

    // Fetch feedback with stars
    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAll().stream().map(feedback -> {
            FeedbackResponseDTO dto = new FeedbackResponseDTO();
            dto.setId(feedback.getId());
            dto.setUsername(feedback.getUser().getUsername());
            dto.setMessage(feedback.getMessage());
            dto.setSubmittedAt(feedback.getSubmittedAt());
            dto.setStars(feedback.getStars()); // add stars to response
            return dto;
        }).collect(Collectors.toList());
    }
}
