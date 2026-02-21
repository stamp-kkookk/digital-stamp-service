package com.project.kkookk.wallet.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.wallet.service.CustomerWalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(
        controllers = WalletController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import(TestSecurityConfig.class)
class WalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private WebApplicationContext context;

    @MockitoBean private CustomerWalletService customerWalletService;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Nested
    @DisplayName("checkNickname")
    class CheckNicknameTest {

        @Test
        @DisplayName("사용 가능한 닉네임 확인")
        void checkNickname_Available() throws Exception {
            given(customerWalletService.checkNicknameAvailable("newNick")).willReturn(true);

            mockMvc.perform(get("/api/public/wallet/check-nickname").param("nickname", "newNick"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(true));
        }

        @Test
        @DisplayName("이미 사용 중인 닉네임 확인")
        void checkNickname_NotAvailable() throws Exception {
            given(customerWalletService.checkNicknameAvailable("existNick")).willReturn(false);

            mockMvc.perform(get("/api/public/wallet/check-nickname").param("nickname", "existNick"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(false));
        }
    }

    @Nested
    @DisplayName("checkPhone")
    class CheckPhoneTest {

        @Test
        @DisplayName("사용 가능한 전화번호 확인")
        void checkPhone_Available() throws Exception {
            given(customerWalletService.checkPhoneAvailable("01012345678")).willReturn(true);

            mockMvc.perform(get("/api/public/wallet/check-phone").param("phone", "01012345678"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(true));
        }

        @Test
        @DisplayName("이미 등록된 전화번호 확인")
        void checkPhone_NotAvailable() throws Exception {
            given(customerWalletService.checkPhoneAvailable("01099998888")).willReturn(false);

            mockMvc.perform(get("/api/public/wallet/check-phone").param("phone", "01099998888"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(false));
        }
    }
}
