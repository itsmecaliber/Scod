package com.gossip.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private static final String SECRET_KEY = "h3yP@ssw0rd!Th1s1s@SecureJWTKey9876";

    /** Strip "Bearer " if present, then trim whitespace */
    private String sanitizeToken(String token) {
        if (token == null) {
            throw new IllegalArgumentException("Token is null");
        }
        token = token.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        return token;
    }

    /** Extract username (subject) from token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extract userId claim (as Long), numeric approach */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj == null) {
            throw new IllegalArgumentException("Missing userId claim");
        }
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        } else if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        } else if (userIdObj instanceof String) {
            return Long.parseLong((String) userIdObj);
        } else {
            throw new IllegalArgumentException("userId claim is of unexpected type");
        }
    }

    /** Extract expiration date */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** Generic claim extractor (handles sanitization and parsing) */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(sanitizeToken(token));
        return claimsResolver.apply(claims);
    }

    /** Parse all claims, handling signature, expiry, malformed tokens */
    private Claims extractAllClaims(String rawToken) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(rawToken)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT expired: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            logger.warn("JWT signature error: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.warn("JWT malformed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("JWT unknown error: {}", e.getMessage());
            throw e;
        }
    }

    /** Check if token has expired */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate token by username and expiry only.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String raw = sanitizeToken(token);
            String username = extractUsername(raw);
            boolean matchesUser = username.equals(userDetails.getUsername());
            boolean notExpired  = !isTokenExpired(raw);
            return matchesUser && notExpired;
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Optionally validate token by username, userId, and expiry.
     */
    public boolean validateToken(String token, UserDetails userDetails, Long expectedUserId) {
        try {
            String raw = sanitizeToken(token);
            boolean basicValid = validateToken(raw, userDetails);
            if (!basicValid) return false;
            Long tokenUserId = extractUserId(raw);
            return expectedUserId.equals(tokenUserId);
        } catch (Exception e) {
            logger.warn("Token validation with userId failed: {}", e.getMessage());
            return false;
        }
    }
}
