package com.gossip.services;

import com.gossip.dto.ReportRequestDTO;
import com.gossip.dto.ReportResponseDTO;
import com.gossip.entity.Post;
import com.gossip.entity.ReportedPost;
import com.gossip.entity.ReportedUser;
import com.gossip.entity.User;
import com.gossip.repository.PostRepository;
import com.gossip.repository.ReportedPostRepository;
import com.gossip.repository.ReportedUserRepository;
import com.gossip.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReportService {

    private final ReportedPostRepository reportedPostRepository;
    private final ReportedUserRepository reportedUserRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public ReportService(ReportedPostRepository reportedPostRepository,
                         ReportedUserRepository reportedUserRepository,
                         PostRepository postRepository,
                         UserRepository userRepository) {
        this.reportedPostRepository = reportedPostRepository;
        this.reportedUserRepository = reportedUserRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public ReportResponseDTO submitReport(ReportRequestDTO dto) {
        User reporter = userRepository.findById(dto.getReporterId())
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        ReportResponseDTO response = new ReportResponseDTO();
        response.setReporterUsername(reporter.getUsername());
        response.setReason(dto.getReason());
        response.setReportedAt(new Date());

        if (dto.getReportedPostId() != null) {
            Post post = postRepository.findById(dto.getReportedPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            ReportedPost report = new ReportedPost();
            report.setReporter(reporter);
            report.setPost(post);
            report.setReason(dto.getReason());
            report.setReportedAt(response.getReportedAt());
            report.setResolved(false); // set default as unresolved

            ReportedPost saved = reportedPostRepository.save(report);
            response.setReportId(saved.getId());
            response.setReportedPostId(post.getId());
            response.setReportedUsername(post.getUser().getUsername());
            response.setResolved(saved.isResolved());

        } else if (dto.getReportedUserId() != null) {
            User reported = userRepository.findById(dto.getReportedUserId())
                    .orElseThrow(() -> new RuntimeException("Reported user not found"));

            ReportedUser report = new ReportedUser();
            report.setReporter(reporter);
            report.setReportedUser(reported);
            report.setReason(dto.getReason());
            report.setReportedAt(response.getReportedAt());
            report.setResolved(false); // set default as unresolved

            ReportedUser saved = reportedUserRepository.save(report);
            response.setReportId(saved.getId());
            response.setReportedUsername(reported.getUsername());
            response.setReportedUserId(reported.getId());
            response.setStatus(reported.isBanned() ? "banned" : "active");
            response.setResolved(saved.isResolved());

        } else {
            throw new RuntimeException("Either reportedPostId or reportedUserId must be provided.");
        }

        return response;
    }

    public List<ReportedPost> getAllReportedPosts() {
        return reportedPostRepository.findAll();
    }

    public List<ReportedUser> getAllReportedUsers() {
        return reportedUserRepository.findAll();
    }

    public long getPendingReportCount() {
        long unresolvedPosts = reportedPostRepository.countByResolvedFalse();
        long unresolvedUsers = reportedUserRepository.countByResolvedFalse();
        return unresolvedPosts + unresolvedUsers;
    }
}
