package com.project.kkookk.global.config;

import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.oauth.config.CustomOAuth2AuthorizationRequestResolver;
import com.project.kkookk.oauth.config.HttpCookieOAuth2AuthorizationRequestRepository;
import com.project.kkookk.oauth.config.OAuth2LoginFailureHandler;
import com.project.kkookk.oauth.config.OAuth2LoginSuccessHandler;
import com.project.kkookk.oauth.service.CustomOAuth2UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private final HttpCookieOAuth2AuthorizationRequestRepository
            cookieAuthorizationRequestRepository;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oauth2LoginFailureHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers("/api/auth/refresh")
                                        .permitAll()
                                        .requestMatchers("/api/public/**")
                                        .permitAll()
                                        .requestMatchers("/api/customer/wallet/stamp-cards")
                                        .permitAll()
                                        .requestMatchers("/api/customer/**")
                                        .hasRole("CUSTOMER")
                                        .requestMatchers("/api/admin/**")
                                        .hasRole("ADMIN")
                                        .requestMatchers("/api/owner/**")
                                        .hasRole("OWNER")
                                        .requestMatchers("/actuator/**")
                                        .permitAll()
                                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .oauth2Login(
                        oauth2 ->
                                oauth2.authorizationEndpoint(
                                                endpoint ->
                                                        endpoint.baseUri(
                                                                        "/api/public/oauth2/authorization")
                                                                .authorizationRequestResolver(
                                                                        authorizationRequestResolver)
                                                                .authorizationRequestRepository(
                                                                        cookieAuthorizationRequestRepository))
                                        .redirectionEndpoint(
                                                redirect ->
                                                        redirect.baseUri(
                                                                "/api/public/oauth2/callback/*"))
                                        .userInfoEndpoint(
                                                userInfo ->
                                                        userInfo.userService(
                                                                customOAuth2UserService))
                                        .successHandler(oauth2LoginSuccessHandler)
                                        .failureHandler(oauth2LoginFailureHandler))
                .exceptionHandling(
                        ex ->
                                ex.authenticationEntryPoint(
                                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(
                        jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // TODO: 프로덕션 배포 전 CORS 제한 설정 필요
    //  - AllowedOrigins: 실제 프론트엔드 도메인만 허용
    //  - AllowedMethods: 필요한 메서드만 허용 (GET, POST, PUT, PATCH, DELETE)
    //  - AllowedHeaders: 필요한 헤더만 허용 (Content-Type, Authorization, Accept)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 모든 Origin 허용 (개발용)
        configuration.setAllowedOriginPatterns(List.of("*"));

        // 모든 HTTP 메서드 허용
        configuration.setAllowedMethods(List.of("*"));

        // 모든 헤더 허용
        configuration.setAllowedHeaders(List.of("*"));

        // Credentials 허용
        configuration.setAllowCredentials(true);

        // Preflight 요청 캐시 시간 (1시간)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
