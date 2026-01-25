package com.project.kkookk.domain.auth.application;

import com.project.kkookk.domain.auth.dto.OwnerLoginRequest;
import com.project.kkookk.domain.auth.dto.OwnerLoginResponse;
import com.project.kkookk.domain.auth.dto.StoreBasicInfo;
import com.project.kkookk.domain.user.entity.User;
import com.project.kkookk.domain.user.repository.UserRepository;
import com.project.kkookk.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public OwnerLoginResponse login(OwnerLoginRequest request) {
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        
        String accessToken = jwtTokenProvider.createAccessToken(user.getLoginId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getLoginId());
        
        // Add store list information
        List<StoreBasicInfo> storeInfos = user.getStores().stream()
                .map(store -> new StoreBasicInfo(store.getId(), store.getName()))
                .toList();

        return new OwnerLoginResponse(accessToken, refreshToken, storeInfos);
    }
}
