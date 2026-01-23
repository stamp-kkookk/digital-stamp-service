package com.project.kkookk.global.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @InjectMocks private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Mock private JwtUtil jwtUtil;

    @Mock private FilterChain filterChain;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("유효한 JWT 토큰으로 인증 성공")
    void doFilterInternal_Success_ValidToken() throws ServletException, IOException {
        // given
        String token = "valid.jwt.token";
        String bearerToken = "Bearer " + token;
        Long ownerId = 1L;
        String email = "owner@example.com";

        Claims claims =
                Jwts.claims()
                        .subject(String.valueOf(ownerId))
                        .add("email", email)
                        .build();

        request.addHeader("Authorization", bearerToken);

        given(jwtUtil.validateToken(token)).willReturn(true);
        given(jwtUtil.parseToken(token)).willReturn(claims);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isInstanceOf(OwnerPrincipal.class);

        OwnerPrincipal principal =
                (OwnerPrincipal)
                        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertThat(principal.getOwnerId()).isEqualTo(ownerId);
        assertThat(principal.getEmail()).isEqualTo(email);
        assertThat(principal.getAuthorities()).hasSize(1);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Authorization 헤더 없이 요청 - 인증 실패")
    void doFilterInternal_Fail_NoAuthorizationHeader() throws ServletException, IOException {
        // given
        // Authorization 헤더 없음

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Bearer 접두사 없는 잘못된 형식 - 인증 실패")
    void doFilterInternal_Fail_InvalidBearerFormat() throws ServletException, IOException {
        // given
        String token = "invalid.jwt.token";
        request.addHeader("Authorization", token); // Bearer 접두사 없음

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("무효한 JWT 토큰 - 인증 실패")
    void doFilterInternal_Fail_InvalidToken() throws ServletException, IOException {
        // given
        String token = "invalid.jwt.token";
        String bearerToken = "Bearer " + token;

        request.addHeader("Authorization", bearerToken);

        given(jwtUtil.validateToken(token)).willReturn(false);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtil, never()).parseToken(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("빈 Authorization 헤더 - 인증 실패")
    void doFilterInternal_Fail_EmptyAuthorizationHeader() throws ServletException, IOException {
        // given
        request.addHeader("Authorization", "");

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Bearer만 있고 토큰 없음 - 인증 실패")
    void doFilterInternal_Fail_BearerOnlyNoToken() throws ServletException, IOException {
        // given
        request.addHeader("Authorization", "Bearer ");

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("토큰 파싱 중 예외 발생 - 인증 실패하지만 요청은 계속 진행")
    void doFilterInternal_Exception_ContinueFilterChain() throws ServletException, IOException {
        // given
        String token = "malformed.jwt.token";
        String bearerToken = "Bearer " + token;

        request.addHeader("Authorization", bearerToken);

        given(jwtUtil.validateToken(token)).willReturn(true);
        given(jwtUtil.parseToken(token)).willThrow(new RuntimeException("Token parse error"));

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
