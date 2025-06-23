package com.gossip.controller;

import com.gossip.dto.JobApplicationDTO;
import com.gossip.dto.JobPostRequestDTO;
import com.gossip.dto.JobPostResponseDTO;
import com.gossip.entity.Applicant;
import com.gossip.services.JobPostService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    private final JobPostService jobPostService;

    public JobPostController(JobPostService jobPostService) {
        this.jobPostService = jobPostService;
    }

    @PostMapping
    public ResponseEntity<?> createJobPost(@RequestBody JobPostRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();
        jobPostService.createJobPost(request, username);
        return ResponseEntity.ok("Job post created successfully.");
    }

    // ✅ Updated to return JobPostResponseDTO
    @GetMapping
    public ResponseEntity<List<JobPostResponseDTO>> getAllJobPosts() {
        List<JobPostResponseDTO> jobs = jobPostService.getAllJobPosts();
        return ResponseEntity.ok(jobs);
    }

    // ✅ Updated to return JobPostResponseDTO for authenticated user's posts
    @GetMapping("/my")
    public ResponseEntity<?> getMyJobPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();
        List<JobPostResponseDTO> myJobs = jobPostService.getJobsByUsername(username);
        return ResponseEntity.ok(myJobs);
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<?> updateJobPost(
            @PathVariable Long jobId,
            @RequestBody JobPostRequestDTO updatedJobRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();

        try {
            jobPostService.updateJobPost(jobId, updatedJobRequest, username);
            return ResponseEntity.ok("Job post updated successfully.");
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(403).body("Forbidden: You do not have permission to edit this job post.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> deleteJobPost(@PathVariable Long jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();

        try {
            jobPostService.deleteJobPost(jobId, username);
            return ResponseEntity.ok("Job post deleted successfully.");
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(403).body("Forbidden: You do not have permission to delete this job post.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(@RequestBody JobApplicationDTO applicationDTO) {
        try {
            jobPostService.applyForJob(applicationDTO);
            return ResponseEntity.ok("Applied successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/jobs/{id}/applicants")
    public ResponseEntity<?> getApplicantsForJob(@PathVariable Long id) {
        try {
            List<Applicant> applicants = jobPostService.getApplicantsByJobPostId(id);
            return ResponseEntity.ok(applicants);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
