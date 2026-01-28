package com.project.kkookk.wallet.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.service.OtpService;
import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final CustomerWalletRepository customerWalletRepository;
    private final OtpService otpService;

    /**
     * 지갑 최초 생성 (OTP 검증 후 처리)
     *
     * @param request 지갑 등록 요청 (전화번호, OTP 정보, 이름, 닉네임)
     * @return 생성된 지갑 정보
     */
    @Transactional
    public WalletRegisterResponse registerWallet(WalletRegisterRequest request) {
        // 1. OTP 검증
        OtpVerifyRequest otpVerifyRequest =
                new OtpVerifyRequest(
                        request.phone(), request.verificationId(), request.otpCode());
        OtpVerifyResponse otpVerifyResponse = otpService.verifyOtp(otpVerifyRequest);

        if (!otpVerifyResponse.verified()) {
            log.warn("OTP 검증 실패: phone={}, verificationId={}", request.phone(), request.verificationId());
            throw new BusinessException(ErrorCode.OTP_VERIFICATION_FAILED);
        }

        // 2. 전화번호 중복 체크
        if (customerWalletRepository.existsByPhone(request.phone())) {
            log.warn("지갑 등록 실패 - 전화번호 중복: phone={}", request.phone());
            throw new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED);
        }

        // 3. 지갑 생성 및 저장
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(request.phone())
                        .name(request.name())
                        .nickname(request.nickname())
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();

        CustomerWallet savedWallet = customerWalletRepository.save(wallet);
        log.info("지갑 생성 완료: walletId={}, phone={}", savedWallet.getId(), savedWallet.getPhone());

        return WalletRegisterResponse.from(savedWallet);
    }
}
