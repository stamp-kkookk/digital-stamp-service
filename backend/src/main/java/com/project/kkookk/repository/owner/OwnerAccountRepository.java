package com.project.kkookk.repository.owner;

import com.project.kkookk.domain.owner.OwnerAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerAccountRepository extends JpaRepository<OwnerAccount, Long> {
    Optional<OwnerAccount> findByEmail(String email);
}
