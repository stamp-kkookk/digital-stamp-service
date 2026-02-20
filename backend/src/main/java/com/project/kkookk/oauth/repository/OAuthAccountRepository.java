package com.project.kkookk.oauth.repository;

import com.project.kkookk.oauth.domain.OAuthAccount;
import com.project.kkookk.oauth.domain.OAuthProvider;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {

    Optional<OAuthAccount> findByProviderAndProviderId(OAuthProvider provider, String providerId);
}
