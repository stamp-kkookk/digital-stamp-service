package com.project.kkookk.global.security;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "refresh_token",
        indexes = {
            @Index(name = "idx_token_hash", columnList = "token_hash"),
            @Index(name = "idx_user_type", columnList = "token_type, subject_id"),
            @Index(name = "idx_expires_at", columnList = "expires_at")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false, length = 20)
    private TokenType tokenType;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "is_admin")
    private Boolean isAdmin;

    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime expiresAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @Builder
    public RefreshToken(
            String tokenHash,
            TokenType tokenType,
            Long subjectId,
            String email,
            Boolean isAdmin,
            LocalDateTime expiresAt) {
        this.tokenHash = tokenHash;
        this.tokenType = tokenType;
        this.subjectId = subjectId;
        this.email = email;
        this.isAdmin = isAdmin;
        this.expiresAt = expiresAt;
        this.revoked = false;
    }

    public void revoke() {
        this.revoked = true;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }
}
