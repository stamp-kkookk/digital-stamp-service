package com.kkookk.customer.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.OtpChallenge;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.OtpChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private static final String DEV_OTP_CODE = "123456";
    private static final int OTP_EXPIRATION_MINUTES = 3;
    private static final int STEP_UP_VALIDITY_MINUTES = 10;

    private final OtpChallengeRepository otpChallengeRepository;
    private final CustomerSessionRepository sessionRepository;

    @Transactional
    public String sendOtp(String phoneNumber) {
        // DEV 모드: 고정된 OTP 코드 사용
        String otpCode = DEV_OTP_CODE;

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        OtpChallenge challenge = OtpChallenge.builder()
                .phoneNumber(phoneNumber)
                .otpCode(otpCode)
                .expiresAt(expiresAt)
                .verified(false)
                .build();

        otpChallengeRepository.save(challenge);

        log.info("[DEV MODE] OTP sent to {}: {}", phoneNumber, otpCode);

        return otpCode; // DEV 모드에서는 코드 반환
    }

    @Transactional
    public void verifyOtp(String phoneNumber, String otpCode) {
        OtpChallenge challenge = otpChallengeRepository
                .findTopByPhoneNumberAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        phoneNumber, LocalDateTime.now())
                .orElseThrow(() -> new BusinessException(
                        "OTP001",
                        "유효한 인증번호가 없습니다. 다시 요청해주세요.",
                        HttpStatus.BAD_REQUEST
                ));

        if (!challenge.getOtpCode().equals(otpCode)) {
            throw new BusinessException(
                    "OTP002",
                    "인증번호가 일치하지 않습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        challenge.setVerified(true);
        otpChallengeRepository.save(challenge);

        log.info("OTP verified successfully for {}", phoneNumber);
    }

    @Transactional(readOnly = true)
    public boolean isOtpVerified(String phoneNumber) {
        return otpChallengeRepository
                .findTopByPhoneNumberAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        phoneNumber, LocalDateTime.now())
                .map(OtpChallenge::isVerified)
                .orElse(false);
    }

    @Transactional
    public void verifyOtpForStepUp(String sessionToken, String otpCode) {
        // 세션 조회
        CustomerSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "유효하지 않은 세션입니다.",
                        HttpStatus.UNAUTHORIZED
                ));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "S002",
                    "세션이 만료되었습니다. 다시 로그인해주세요.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        String phoneNumber = session.getWallet().getPhoneNumber();

        // OTP 검증
        verifyOtp(phoneNumber, otpCode);

        // Step-up 세션 업데이트
        session.setOtpVerifiedUntil(LocalDateTime.now().plusMinutes(STEP_UP_VALIDITY_MINUTES));
        sessionRepository.save(session);

        log.info("OTP step-up verified for wallet: {}", session.getWallet().getId());
    }
}
