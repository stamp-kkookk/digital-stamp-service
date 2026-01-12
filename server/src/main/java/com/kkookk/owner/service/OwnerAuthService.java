package com.kkookk.owner.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.common.util.JwtUtil;
import com.kkookk.owner.dto.AuthResponse;
import com.kkookk.owner.dto.LoginRequest;
import com.kkookk.owner.dto.RegisterRequest;
import com.kkookk.owner.entity.OwnerAccount;
import com.kkookk.owner.repository.OwnerAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OwnerAuthService {

    private final OwnerAccountRepository ownerAccountRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (ownerAccountRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(
                    "A001",
                    "이미 사용 중인 이메일입니다.",
                    HttpStatus.CONFLICT
            );
        }

        // Create new owner account
        OwnerAccount owner = OwnerAccount.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        owner = ownerAccountRepository.save(owner);

        // Generate JWT token
        String accessToken = jwtUtil.generateToken(owner.getId(), owner.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .ownerId(owner.getId())
                .email(owner.getEmail())
                .name(owner.getName())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Find owner by email
        OwnerAccount owner = ownerAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(
                        "A002",
                        "이메일 또는 비밀번호가 올바르지 않습니다.",
                        HttpStatus.UNAUTHORIZED
                ));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), owner.getPasswordHash())) {
            throw new BusinessException(
                    "A002",
                    "이메일 또는 비밀번호가 올바르지 않습니다.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // Generate JWT token
        String accessToken = jwtUtil.generateToken(owner.getId(), owner.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .ownerId(owner.getId())
                .email(owner.getEmail())
                .name(owner.getName())
                .build();
    }
}
