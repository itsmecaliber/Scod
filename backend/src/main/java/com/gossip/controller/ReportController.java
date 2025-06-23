package com.gossip.controller;

import com.gossip.dto.ReportRequestDTO;
import com.gossip.dto.ReportResponseDTO;
import com.gossip.entity.Post;
import com.gossip.entity.User;
import com.gossip.repository.PostRepository;
import com.gossip.repository.ReportedPostRepository;
import com.gossip.repository.UserRepository;
import com.gossip.services.ReportService;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportedPostRepository reportedPostRepository;

    public ReportController(ReportService reportService,
                            UserRepository userRepository,
                            PostRepository postRepository,
                            ReportedPostRepository reportedPostRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportedPostRepository = reportedPostRepository;
    }

    @PostMapping("/report")
    public ResponseEntity<String> reportContent(@RequestBody ReportRequestDTO dto) {
        reportService.submitReport(dto);
        return ResponseEntity.ok("Report submitted successfully");
    }

    @GetMapping("/admin/reports/posts")
    public ResponseEntity<List<ReportResponseDTO>> getAllReportedPosts() {
        List<ReportResponseDTO> reports = reportService.getAllReportedPosts().stream().map(post -> {
            ReportResponseDTO dto = new ReportResponseDTO();
            dto.setReportId(post.getId());
            dto.setReporterUsername(post.getReporter().getUsername());
            dto.setReportedPostId(post.getPost().getId());
            dto.setReason(post.getReason());
            dto.setReportedAt(post.getReportedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/admin/reports/users")
    public ResponseEntity<List<ReportResponseDTO>> getAllReportedUsers() {
        List<ReportResponseDTO> reports = reportService.getAllReportedUsers().stream().map(user -> {
            ReportResponseDTO dto = new ReportResponseDTO();
            dto.setReportId(user.getId());
            dto.setReporterUsername(user.getReporter().getUsername());
            dto.setReportedUsername(
                    user.getReportedUser() != null ? user.getReportedUser().getUsername() : null
            );

            // ✅ Safely set reported user ID and status
            dto.setReportedUserId(
                    user.getReportedUser() != null ? user.getReportedUser().getId() : null
            );
            dto.setStatus(
                    user.getReportedUser() != null && user.getReportedUser().isBanned()
                            ? "banned"
                            : "active"
            );

            dto.setReason(user.getReason());
            dto.setReportedAt(user.getReportedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }



    @DeleteMapping("/admin/reports/posts/{postId}")
    @Transactional
    public ResponseEntity<String> deleteReportedPost(@PathVariable Long postId) {
        System.out.println("DEBUG: Attempting to delete reported post with ID: " + postId);

        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            System.out.println("DEBUG: Post not found.");
            return ResponseEntity.status(404).body("Post not found");
        }

        Post post = postOptional.get();
        System.out.println("DEBUG: Post found. Deleting from ReportedPost table...");

        try {
            reportedPostRepository.deleteAllByPost(post);
            System.out.println("DEBUG: Successfully deleted report entry from ReportedPost table.");
        } catch (Exception e) {
            System.out.println("ERROR: Failed to delete from ReportedPost table: " + e.getMessage());
        }

        try {
            postRepository.deleteById(postId);
            System.out.println("DEBUG: Successfully deleted post from Post table.");
        } catch (Exception e) {
            System.out.println("ERROR: Failed to delete post from Post table: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to delete post");
        }

        return ResponseEntity.ok("Post deleted successfully");
    }

    @PutMapping("/admin/reports/users/{userId}/ban")
    public ResponseEntity<String> banUser(@PathVariable Long userId) {
        System.out.println("Banning user: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(true);
        userRepository.save(user);
        return ResponseEntity.ok("User banned successfully");
    }

    @PutMapping("/admin/reports/users/{userId}/unban")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        System.out.println("Unbanning user: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
        return ResponseEntity.ok("User unbanned successfully");
    }
}
