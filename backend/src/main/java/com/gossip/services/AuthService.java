package com.gossip.services;

import com.gossip.dto.AuthRequest;
import com.gossip.dto.AuthResponse;
import com.gossip.dto.RegisterRequest;
import com.gossip.entity.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserService userService, JwtService jwtService, 
                     AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        userService.saveUser(user);
        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    public AuthResponse authenticate(AuthRequest request) {
        // Hardcoded admin credentials
        if ("admin".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
            String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                    "admin", "", java.util.Collections.emptyList()),
                0L,
                true
            );
            return new AuthResponse(token);
        }

        try {
            // Authenticate regular user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(), 
                    request.getPassword())
            );

            User user = userService.findByUsername(request.getUsername());

            // Banned user check
            if (user.isBanned()) {
                throw new RuntimeException("Your account has been suspended by the admin.");
            }

            // Generate token with isAdmin = false
            String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                    user.getUsername(), "", java.util.Collections.emptyList()),
                user.getId(),
                false
            );

            return new AuthResponse(token);
            
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username or password");
        }
    }
}