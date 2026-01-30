package com.project.kkookk.otp.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_MINUTES = 3;
    private static final int RATE_LIMIT_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    private final ConcurrentHashMap<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> rateLimitStore =
            new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * OTP 요청 처리
     *
     * @param phone 전화번호
     */
    public void requestOtp(String phone) {
        // Rate limit 체크
        LocalDateTime lastRequestTime = rateLimitStore.get(phone);
        if (lastRequestTime != null
                && LocalDateTime.now().isBefore(lastRequestTime.plusSeconds(RATE_LIMIT_SECONDS))) {
            throw new BusinessException(ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
        }

        // OTP 생성 (6자리 랜덤 숫자)
        String otpCode = generateOtpCode();

        // In-memory 저장
        OtpData otpData = new OtpData(otpCode, LocalDateTime.now(), 0);
        otpStore.put(phone, otpData);
        rateLimitStore.put(phone, LocalDateTime.now());

        // 콘솔 출력 (DEV/PROD)
        log.info("[OTP] phone={}, code={}", phone, otpCode);
        System.out.println(String.format("[OTP] phone=%s, code=%s", phone, otpCode));
    }

    /**
     * OTP 검증 처리
     *
     * @param phone 전화번호
     * @param code OTP 코드
     * @return 검증 성공 여부
     */
    public boolean verifyOtp(String phone, String code) {
        // OTP 조회
        OtpData otpData = otpStore.get(phone);
        if (otpData == null) {
            throw new BusinessException(ErrorCode.OTP_INVALID);
        }

        // TTL 확인
        if (otpData.isExpired()) {
            otpStore.remove(phone);
            throw new BusinessException(ErrorCode.OTP_EXPIRED);
        }

        // 시도 횟수 확인
        if (otpData.isAttemptsExceeded()) {
            otpStore.remove(phone);
            throw new BusinessException(ErrorCode.OTP_ATTEMPTS_EXCEEDED);
        }

        // 코드 일치 확인
        if (!otpData.code().equals(code)) {
            // 시도 횟수 증가
            OtpData updatedData =
                    new OtpData(otpData.code(), otpData.createdAt(), otpData.attempts() + 1);
            otpStore.put(phone, updatedData);

            // 3회 실패 시
            if (updatedData.isAttemptsExceeded()) {
                otpStore.remove(phone);
                throw new BusinessException(ErrorCode.OTP_ATTEMPTS_EXCEEDED);
            }

            throw new BusinessException(ErrorCode.OTP_INVALID);
        }

        // 검증 성공: OTP 삭제
        otpStore.remove(phone);
        return true;
    }

    /**
     * 6자리 OTP 코드 생성
     *
     * @return 6자리 숫자 문자열
     */
    private String generateOtpCode() {
        int otp = secureRandom.nextInt(1000000); // 0 ~ 999999
        return String.format("%06d", otp);
    }

    /**
     * OTP 데이터 내부 저장 객체
     *
     * @param code OTP 코드
     * @param createdAt 생성 시각
     * @param attempts 시도 횟수
     */
    record OtpData(String code, LocalDateTime createdAt, int attempts) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(createdAt.plusMinutes(OTP_TTL_MINUTES));
        }

        boolean isAttemptsExceeded() {
            return attempts >= MAX_ATTEMPTS;
        }
    }
}
