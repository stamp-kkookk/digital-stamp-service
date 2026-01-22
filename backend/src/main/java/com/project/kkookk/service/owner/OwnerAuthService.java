package com.project.kkookk.service.owner;

import com.project.kkookk.controller.owner.dto.OwnerSignupRequest;
import com.project.kkookk.controller.owner.dto.OwnerSignupResponse;
import com.project.kkookk.domain.owner.OwnerAccount;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.repository.owner.OwnerAccountRepository;
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

    @Transactional
    public OwnerSignupResponse signup(OwnerSignupRequest request) {
        validateEmailNotDuplicated(request.email());
        validateLoginIdNotDuplicated(request.loginId());

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email(request.email())
                        .loginId(request.loginId())
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .name(request.name())
                        .phoneNumber(request.phoneNumber())
                        .build();

        OwnerAccount savedOwnerAccount = ownerAccountRepository.save(ownerAccount);

        return OwnerSignupResponse.from(savedOwnerAccount);
    }

    private void validateEmailNotDuplicated(String email) {
        if (ownerAccountRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.OWNER_EMAIL_DUPLICATED);
        }
    }

    private void validateLoginIdNotDuplicated(String loginId) {
        if (loginId != null && ownerAccountRepository.existsByLoginId(loginId)) {
            throw new BusinessException(ErrorCode.OWNER_LOGIN_ID_DUPLICATED);
        }
    }
}
