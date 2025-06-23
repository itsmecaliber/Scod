package com.gossip.services;

import com.gossip.dto.JobApplicationDTO;
import com.gossip.dto.JobPostRequestDTO;
import com.gossip.dto.JobPostResponseDTO;
import com.gossip.entity.Applicant;
import com.gossip.entity.JobPost;
import com.gossip.entity.User;
import com.gossip.repository.JobPostRepository;
import com.gossip.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    public JobPostService(JobPostRepository jobPostRepository, UserRepository userRepository) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }

    public void createJobPost(JobPostRequestDTO request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        JobPost jobPost = new JobPost();
        jobPost.setOrgName(request.getOrgName());
        jobPost.setOrgDetails(request.getOrgDetails());
        jobPost.setOwnerName(request.getOwnerName());
        jobPost.setPhone(request.getPhone());
        jobPost.setGame(request.getGame());
        jobPost.setPlayersNeeded(request.getPlayersNeeded());
        jobPost.setPerks(request.getPerks());
        jobPost.setPostedBy(user);
        jobPost.setPostedAt(LocalDateTime.now());

        jobPostRepository.save(jobPost);
    }

    public void updateJobPost(Long jobId, JobPostRequestDTO updatedJob, String username) throws IllegalAccessException {
        JobPost existingJob = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job post not found with id: " + jobId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        if (!existingJob.getPostedBy().getId().equals(user.getId())) {
            throw new IllegalAccessException("You do not have permission to update this job post.");
        }

        existingJob.setOrgName(updatedJob.getOrgName());
        existingJob.setOrgDetails(updatedJob.getOrgDetails());
        existingJob.setOwnerName(updatedJob.getOwnerName());
        existingJob.setPhone(updatedJob.getPhone());
        existingJob.setGame(updatedJob.getGame());
        existingJob.setPlayersNeeded(updatedJob.getPlayersNeeded());
        existingJob.setPerks(updatedJob.getPerks());

        jobPostRepository.save(existingJob);
    }

    public List<JobPostResponseDTO> getAllJobPosts() {
        List<JobPost> jobs = jobPostRepository.findAll();
        return jobs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<JobPostResponseDTO> getJobsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        List<JobPost> jobs = jobPostRepository.findByPostedBy(user);
        return jobs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public void deleteJobPost(Long jobId, String username) throws IllegalAccessException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job post not found with id: " + jobId));

        if (!job.getPostedBy().getId().equals(user.getId())) {
            throw new IllegalAccessException("You do not have permission to delete this job post.");
        }

        jobPostRepository.deleteById(jobId);
    }

    public void applyForJob(JobApplicationDTO applicationDTO) {
        JobPost job = jobPostRepository.findById(applicationDTO.getJobPostId())
                .orElseThrow(() -> new RuntimeException("Job post not found with id: " + applicationDTO.getJobPostId()));

        Applicant applicant = new Applicant(applicationDTO.getProfileName(), applicationDTO.getWhatsappNumber());
        job.addApplicant(applicant);
        jobPostRepository.save(job);
    }

    public List<Applicant> getApplicantsByJobPostId(Long jobPostId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return jobPost.getApplicants();
    }

    // ✅ Private method to convert entity to DTO
    private JobPostResponseDTO convertToDTO(JobPost job) {
        JobPostResponseDTO dto = new JobPostResponseDTO();
        dto.setId(job.getId());
        dto.setOrgName(job.getOrgName());
        dto.setOrgDetails(job.getOrgDetails());
        dto.setOwnerName(job.getOwnerName());
        dto.setPhone(job.getPhone());
        dto.setGame(job.getGame());
        dto.setPlayersNeeded(job.getPlayersNeeded());
        dto.setPerks(job.getPerks());
        dto.setPostedByUsername(job.getPostedBy().getUsername());
        dto.setPostedAt(job.getPostedAt());
        return dto;
    }
}
