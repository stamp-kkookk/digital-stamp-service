package com.project.kkookk.owner.service;

import com.project.kkookk.common.limit.application.FailureLimitService;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.owner.controller.dto.OwnerLoginRequest;
import com.project.kkookk.owner.controller.dto.OwnerLoginResponse;
import com.project.kkookk.owner.controller.dto.OwnerSignupRequest;
import com.project.kkookk.owner.controller.dto.OwnerSignupResponse;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerAuthService {

    private final OwnerAccountRepository ownerAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FailureLimitService failureLimitService;

    @Transactional
    public OwnerSignupResponse signup(OwnerSignupRequest request) {
        validateEmailNotDuplicated(request.email());

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email(request.email())
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .name(request.name())
                        .phoneNumber(request.phoneNumber())
                        .build();

        OwnerAccount savedOwnerAccount = ownerAccountRepository.save(ownerAccount);

        return OwnerSignupResponse.from(savedOwnerAccount);
    }

    public OwnerLoginResponse login(OwnerLoginRequest request) {
        failureLimitService.checkBlocked(request.email());

        try {
            OwnerAccount ownerAccount =
                    ownerAccountRepository
                            .findByEmail(request.email())
                            .orElseThrow(() -> new BusinessException(ErrorCode.OWNER_LOGIN_FAILED));

            if (!passwordEncoder.matches(request.password(), ownerAccount.getPasswordHash())) {
                throw new BusinessException(ErrorCode.OWNER_LOGIN_FAILED);
            }

            failureLimitService.recordSuccess(request.email());

            String accessToken =
                    jwtUtil.generateAccessToken(ownerAccount.getId(), ownerAccount.getEmail());

            return OwnerLoginResponse.of(accessToken, ownerAccount);
        } catch (BusinessException e) {
            failureLimitService.recordFailure(request.email());
            throw e;
        }
    }

    private void validateEmailNotDuplicated(String email) {
        if (ownerAccountRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.OWNER_EMAIL_DUPLICATED);
        }
    }
}
