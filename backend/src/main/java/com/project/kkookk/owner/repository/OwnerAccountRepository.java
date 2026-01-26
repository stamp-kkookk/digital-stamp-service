package com.project.kkookk.owner.repository;

import com.project.kkookk.owner.domain.OwnerAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerAccountRepository extends JpaRepository<OwnerAccount, Long> {

    boolean existsByEmail(String email);

    Optional<OwnerAccount> findByEmail(String email);
}
