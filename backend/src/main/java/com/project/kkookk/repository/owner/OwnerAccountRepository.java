package com.project.kkookk.repository.owner;

import com.project.kkookk.domain.owner.OwnerAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerAccountRepository extends JpaRepository<OwnerAccount, Long> {

    boolean existsByEmail(String email);

    boolean existsByLoginId(String loginId);
}
