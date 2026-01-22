package com.project.kkookk.repository.owner;

import com.project.kkookk.domain.owner.OwnerAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerAccountRepository extends JpaRepository<OwnerAccount, Long> {

    boolean existsByEmail(String email);

    boolean existsByLoginId(String loginId);

    Optional<OwnerAccount> findByEmail(String email);

    Optional<OwnerAccount> findByLoginId(String loginId);
}
