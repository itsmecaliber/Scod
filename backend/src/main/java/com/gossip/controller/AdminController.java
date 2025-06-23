package com.gossip.controller;

import com.gossip.services.UserService;
import com.gossip.services.PostService;
import com.gossip.services.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin") // Updated base path to match frontend call
public class AdminController {

    private final UserService userService;
    private final PostService postService;
    private final ReportService reportService;

    public AdminController(UserService userService, PostService postService, ReportService reportService) {
        this.userService = userService;
        this.postService = postService;
        this.reportService = reportService;
    }

    @GetMapping("/stats") // Updated endpoint to /stats
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.getTotalUsers());
        stats.put("totalPosts", postService.getTotalPostCount());
        stats.put("pendingReports", reportService.getPendingReportCount());
        return stats;
    }
}
