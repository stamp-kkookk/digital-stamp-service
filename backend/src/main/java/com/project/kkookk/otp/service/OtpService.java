package com.project.kkookk.otp.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_MINUTES = 3;
    private static final int RATE_LIMIT_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    private final ConcurrentHashMap<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> rateLimitStore =
            new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    private final JwtUtil jwtUtil;
    private final CustomerWalletRepository customerWalletRepository;

    // TODO: 시연용 - 프로덕션 배포 시 반환값 제거하고 void로 변경 필요
    public String requestOtp(String phone) {
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

        // OTP 발송 로그 (코드 노출 금지)
        log.debug("[OTP] OTP requested for phone={}", maskPhone(phone));

        // TODO: 실제 SMS 발송 서비스 연동 필요
        // smsService.sendOtp(phone, otpCode);

        // TODO: 시연용 - 프로덕션 배포 시 이 반환문 제거
        return otpCode;
    }

    /**
     * OTP 검증 및 StepUp 토큰 발급
     *
     * @param phone 전화번호
     * @param code OTP 코드
     * @return 검증 결과와 StepUp 토큰이 포함된 OtpVerifyResult
     */
    public OtpVerifyResult verifyOtp(String phone, String code) {
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

        // 지갑 조회 및 StepUp 토큰 발급
        Optional<CustomerWallet> walletOptional = customerWalletRepository.findByPhone(phone);
        String stepUpToken = null;
        if (walletOptional.isPresent()) {
            Long walletId = walletOptional.get().getId();
            stepUpToken = jwtUtil.generateStepUpToken(walletId);
        }

        return new OtpVerifyResult(true, stepUpToken);
    }

    /** OTP 검증 결과 */
    public record OtpVerifyResult(boolean verified, String stepUpToken) {}

    private String generateOtpCode() {
        int otp = secureRandom.nextInt(1000000); // 0 ~ 999999
        return String.format("%06d", otp);
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return "****";
        }
        return phone.substring(0, phone.length() - 4) + "****";
    }

    record OtpData(String code, LocalDateTime createdAt, int attempts) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(createdAt.plusMinutes(OTP_TTL_MINUTES));
        }

        boolean isAttemptsExceeded() {
            return attempts >= MAX_ATTEMPTS;
        }
    }
}
