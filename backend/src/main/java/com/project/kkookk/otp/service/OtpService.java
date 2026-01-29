package com.project.kkookk.otp.service;

import static com.project.kkookk.global.config.CacheConfig.OTP_RATE_LIMIT_CACHE;
import static com.project.kkookk.global.config.CacheConfig.OTP_SESSION_CACHE;

import com.project.kkookk.common.limit.application.FailureLimitService;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.otp.config.OtpProperties;
import com.project.kkookk.otp.controller.dto.OtpRequestRequest;
import com.project.kkookk.otp.controller.dto.OtpRequestResponse;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.domain.OtpSessionData;
import com.project.kkookk.otp.domain.OtpSessionStatus;
import com.project.kkookk.otp.service.sms.SmsProvider;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CacheManager cacheManager;
    private final SmsProvider smsProvider;
    private final OtpProperties otpProperties;
    private final FailureLimitService failureLimitService;

    /**
     * OTP 요청 처리
     *
     * @param request 전화번호 정보
     * @return OTP 요청 응답 (verificationId, expiresAt, otpCode)
     */
    public OtpRequestResponse requestOtp(OtpRequestRequest request) {
        String phone = request.phone();

        // 1. Rate limit 체크
        checkRateLimit(phone);

        // 2. 기존 세션 삭제 (한 전화번호당 1개의 활성 OTP만 유지)
        deleteExistingSession(phone);

        // 3. OTP 코드 생성
        String otpCode = generateOtpCode();

        // 4. OTP 세션 저장
        String verificationId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(otpProperties.getExpirationSeconds());

        OtpSessionData sessionData =
                OtpSessionData.builder()
                        .phone(phone)
                        .otpCode(otpCode)
                        .verificationId(verificationId)
                        .status(OtpSessionStatus.PENDING)
                        .expiresAt(expiresAt)
                        .createdAt(now)
                        .build();

        saveOtpSession(phone, verificationId, sessionData);

        // 5. SMS 발송
        try {
            smsProvider.sendOtp(phone, otpCode);
        } catch (Exception e) {
            log.error("OTP SMS 발송 실패: phone={}, error={}", phone, e.getMessage(), e);
            throw new BusinessException(ErrorCode.OTP_SEND_FAILED);
        }

        // 6. Rate limit 증가
        incrementRateLimit(phone);

        // 7. 응답 생성 (개발 환경에서만 otpCode 포함)
        String responseOtpCode = isDevelopmentMode() ? otpCode : null;
        return OtpRequestResponse.of(verificationId, expiresAt, responseOtpCode);
    }

    /**
     * OTP 검증 처리
     *
     * @param request 전화번호, verificationId, OTP 코드
     * @return OTP 검증 응답 (verified, phone)
     */
    public OtpVerifyResponse verifyOtp(OtpVerifyRequest request) {
        String phone = request.phone();
        String verificationId = request.verificationId();

        // 0. 차단 여부 확인
        failureLimitService.checkBlocked(phone);

        // 1. 세션 조회 (verificationId로 전화번호 찾기)
        OtpSessionData sessionData = findSessionByVerificationId(verificationId);

        // 2. 전화번호 일치 확인
        if (!sessionData.getPhone().equals(phone)) {
            log.warn("OTP 검증 실패 - 전화번호 불일치: expected={}, actual={}", sessionData.getPhone(), phone);
            failureLimitService.recordFailure(phone);
            throw new BusinessException(ErrorCode.OTP_INVALID);
        }

        // 3. 세션 상태 검증
        if (sessionData.isExpired()) {
            log.warn("OTP 만료: phone={}, verificationId={}", phone, verificationId);
            // 만료는 실패로 간주하지 않음.
            throw new BusinessException(ErrorCode.OTP_EXPIRED);
        }

        // 4. OTP 코드 검증
        String otpCode = request.otpCode();
        if (!sessionData.getOtpCode().equals(otpCode)) {
            // 실패 시 시도 횟수 증가
            failureLimitService.recordFailure(phone);

            log.warn("OTP 코드 불일치: phone={}", phone);
            throw new BusinessException(ErrorCode.OTP_INVALID);
        }

        // 5. 검증 성공 - VERIFIED 상태로 전환
        sessionData.verify();
        updateSession(phone, sessionData);
        failureLimitService.recordSuccess(phone);

        log.info("OTP 검증 성공: phone={}, verificationId={}", phone, verificationId);
        return OtpVerifyResponse.of(true, phone);
    }

    /** verificationId로 세션 조회 */
    private OtpSessionData findSessionByVerificationId(String verificationId) {
        Cache sessionCache = getCache(OTP_SESSION_CACHE);

        // verificationId로 전화번호 조회
        String verifyKey = buildVerifyKey(verificationId);
        String phone = sessionCache.get(verifyKey, String.class);

        if (phone == null) {
            log.warn("OTP 세션을 찾을 수 없음: verificationId={}", verificationId);
            throw new BusinessException(ErrorCode.OTP_NOT_FOUND);
        }

        // 전화번호로 세션 데이터 조회
        String sessionKey = buildSessionKey(phone);
        OtpSessionData sessionData = sessionCache.get(sessionKey, OtpSessionData.class);

        if (sessionData == null) {
            log.warn("OTP 세션 데이터 없음: phone={}, verificationId={}", phone, verificationId);
            throw new BusinessException(ErrorCode.OTP_NOT_FOUND);
        }

        return sessionData;
    }

    /** 세션 업데이트 (시도 횟수 증가 또는 상태 변경) */
    private void updateSession(String phone, OtpSessionData sessionData) {
        Cache sessionCache = getCache(OTP_SESSION_CACHE);
        String sessionKey = buildSessionKey(phone);
        sessionCache.put(sessionKey, sessionData);
    }

    /** Rate limit 체크 (1분 내 3회 제한) */
    private void checkRateLimit(String phone) {
        Cache rateLimitCache = getCache(OTP_RATE_LIMIT_CACHE);
        String rateLimitKey = buildRateLimitKey(phone);

        Integer count = rateLimitCache.get(rateLimitKey, Integer.class);
        if (count != null && count >= otpProperties.getRateLimit().getMaxRequests()) {
            log.warn("OTP rate limit 초과: phone={}, count={}", phone, count);
            throw new BusinessException(ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
        }
    }

    /** 기존 세션 삭제 */
    private void deleteExistingSession(String phone) {
        Cache sessionCache = getCache(OTP_SESSION_CACHE);
        String sessionKey = buildSessionKey(phone);
        sessionCache.evict(sessionKey);
    }

    /** OTP 코드 생성 (개발: 고정, 운영: SecureRandom) */
    private String generateOtpCode() {
        if (isDevelopmentMode()) {
            return otpProperties.getDev().getFixedCode();
        }
        // 100000 ~ 999999 (6자리 숫자)
        int code = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(code);
    }

    /** OTP 세션 저장 (전화번호 + verificationId 키) */
    private void saveOtpSession(String phone, String verificationId, OtpSessionData sessionData) {
        Cache sessionCache = getCache(OTP_SESSION_CACHE);

        // 전화번호로 조회 가능하도록 저장
        String sessionKey = buildSessionKey(phone);
        sessionCache.put(sessionKey, sessionData);

        // verificationId로 조회 가능하도록 전화번호 저장
        String verifyKey = buildVerifyKey(verificationId);
        sessionCache.put(verifyKey, phone);
    }

    /** Rate limit 증가 */
    private void incrementRateLimit(String phone) {
        Cache rateLimitCache = getCache(OTP_RATE_LIMIT_CACHE);
        String rateLimitKey = buildRateLimitKey(phone);

        Integer count = rateLimitCache.get(rateLimitKey, Integer.class);
        rateLimitCache.put(rateLimitKey, count == null ? 1 : count + 1);
    }

    /** 개발 모드 확인 */
    private boolean isDevelopmentMode() {
        return otpProperties.getDev().getFixedCode() != null
                && !otpProperties.getDev().getFixedCode().isEmpty();
    }

    /** 캐시 조회 */
    private Cache getCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            throw new IllegalStateException("캐시를 찾을 수 없습니다: " + cacheName);
        }
        return cache;
    }

    /** 캐시 키 생성 */
    private String buildSessionKey(String phone) {
        return "otp:session:" + phone;
    }

    private String buildVerifyKey(String verificationId) {
        return "otp:verify:" + verificationId;
    }

    private String buildRateLimitKey(String phone) {
        return "otp:rate:" + phone;
    }
}
