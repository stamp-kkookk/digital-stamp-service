package com.project.kkookk.wallet.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.config.SecurityConfig;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.exception.GlobalExceptionHandler;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.wallet.controller.config.WalletTestSecurityConfig;
import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.dto.StampCardInfo;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.service.WalletAccessService;
import com.project.kkookk.wallet.service.WalletService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = WalletController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, WalletTestSecurityConfig.class})
class WalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private WalletService walletService;

    @MockitoBean private WalletAccessService walletAccessService;

    @Test
    @DisplayName("지갑 생성 성공 - 200 OK")
    @WithMockUser
    void registerWallet_Success() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        WalletRegisterResponse response =
                new WalletRegisterResponse(
                        1L,
                        "010-1234-5678",
                        "홍길동",
                        "길동이",
                        CustomerWalletStatus.ACTIVE,
                        LocalDateTime.of(2026, 1, 28, 10, 30, 0),
                        "test.jwt.token");

        given(walletService.registerWallet(any(WalletRegisterRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.walletId").value(1))
                .andExpect(jsonPath("$.phone").value("010-1234-5678"))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.nickname").value("길동이"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.createdAt").value("2026-01-28T10:30:00"))
                .andExpect(jsonPath("$.accessToken").value("test.jwt.token"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 형식 오류 (400)")
    @WithMockUser
    void registerWallet_Fail_InvalidPhoneFormat() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "1234567890", // 잘못된 형식
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 필수 필드 누락 (400)")
    @WithMockUser
    void registerWallet_Fail_RequiredFieldMissing() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "", // 전화번호 누락
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - OTP 검증 실패 (400)")
    @WithMockUser
    void registerWallet_Fail_OtpVerificationFailed() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "999999",
                        "홍길동",
                        "길동이");

        given(walletService.registerWallet(any(WalletRegisterRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_VERIFICATION_FAILED));

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("WALLET_002"))
                .andExpect(jsonPath("$.message").value("OTP 검증에 실패했습니다."));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 중복 (409)")
    @WithMockUser
    void registerWallet_Fail_PhoneDuplicated() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        given(walletService.registerWallet(any(WalletRegisterRequest.class)))
                .willThrow(new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED));

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("WALLET_001"))
                .andExpect(jsonPath("$.message").value("이미 등록된 전화번호입니다."));
    }

    @Test
    @DisplayName("지갑 생성 실패 - OTP 코드 형식 오류 (400)")
    @WithMockUser
    void registerWallet_Fail_InvalidOtpCodeFormat() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "12345", // 6자리가 아님
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 이름 길이 초과 (400)")
    @WithMockUser
    void registerWallet_Fail_NameTooLong() throws Exception {
        // given
        String longName = "a".repeat(51); // 50자 초과
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        longName,
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 길이 초과 (400)")
    @WithMockUser
    void registerWallet_Fail_NicknameTooLong() throws Exception {
        // given
        String longNickname = "a".repeat(51); // 50자 초과
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        longNickname);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 정보 조회 성공 - 스탬프 카드 있음 (200)")
    @WithMockUser
    void getWalletAccessInfo_Success_WithStampCard() throws Exception {
        // given
        StampCardInfo stampCardInfo =
                new StampCardInfo(1L, 1L, "테스트 매장", 5, 10, "아메리카노", false);
        WalletAccessResponse response =
                new WalletAccessResponse(1L, "홍길동", "01012345678", stampCardInfo);

        given(walletAccessService.getWalletInfo(anyString(), anyString(), anyLong()))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01012345678")
                                .param("userName", "홍길동")
                                .param("storeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.userName").value("홍길동"))
                .andExpect(jsonPath("$.phoneNumber").value("01012345678"))
                .andExpect(jsonPath("$.stampCardInfo.stampCardId").value(1))
                .andExpect(jsonPath("$.stampCardInfo.storeId").value(1))
                .andExpect(jsonPath("$.stampCardInfo.storeName").value("테스트 매장"))
                .andExpect(jsonPath("$.stampCardInfo.currentStamps").value(5))
                .andExpect(jsonPath("$.stampCardInfo.totalStampsToReward").value(10))
                .andExpect(jsonPath("$.stampCardInfo.rewardName").value("아메리카노"))
                .andExpect(jsonPath("$.stampCardInfo.isRewarded").value(false));
    }

    @Test
    @DisplayName("지갑 정보 조회 성공 - 스탬프 카드 없음 (200)")
    @WithMockUser
    void getWalletAccessInfo_Success_WithoutStampCard() throws Exception {
        // given
        WalletAccessResponse response = new WalletAccessResponse(1L, "홍길동", "01012345678", null);

        given(walletAccessService.getWalletInfo(anyString(), anyString(), anyLong()))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01012345678")
                                .param("userName", "홍길동")
                                .param("storeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.userName").value("홍길동"))
                .andExpect(jsonPath("$.phoneNumber").value("01012345678"))
                .andExpect(jsonPath("$.stampCardInfo").doesNotExist());
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 전화번호 형식 오류 (400)")
    @WithMockUser
    void getWalletAccessInfo_Fail_InvalidPhoneFormat() throws Exception {
        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "1234567890")
                                .param("userName", "홍길동")
                                .param("storeId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 필수 파라미터 누락 (400)")
    @WithMockUser
    void getWalletAccessInfo_Fail_MissingRequiredParameter() throws Exception {
        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01012345678")
                                .param("storeId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 지갑을 찾을 수 없음 (404)")
    @WithMockUser
    void getWalletAccessInfo_Fail_WalletNotFound() throws Exception {
        // given
        given(walletAccessService.getWalletInfo(anyString(), anyString(), anyLong()))
                .willThrow(new BusinessException(ErrorCode.WALLET_NOT_FOUND));

        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01099999999")
                                .param("userName", "김철수")
                                .param("storeId", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("WALLET_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("지갑 정보를 찾을 수 없습니다"));
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 매장을 찾을 수 없음 (404)")
    @WithMockUser
    void getWalletAccessInfo_Fail_StoreNotFound() throws Exception {
        // given
        given(walletAccessService.getWalletInfo(anyString(), anyString(), anyLong()))
                .willThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01012345678")
                                .param("userName", "홍길동")
                                .param("storeId", "999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STORE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("매장을 찾을 수 없습니다"));
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 이름 길이 부족 (400)")
    @WithMockUser
    void getWalletAccessInfo_Fail_NameTooShort() throws Exception {
        // when & then
        mockMvc.perform(
                        get("/api/public/wallet/access")
                                .param("phoneNumber", "01012345678")
                                .param("userName", "a")
                                .param("storeId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }
}
