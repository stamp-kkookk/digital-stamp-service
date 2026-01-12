package com.kkookk.customer.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.OtpChallenge;
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

    private final OtpChallengeRepository otpChallengeRepository;

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
}
