package com.kkookk.owner.repository;

import com.kkookk.owner.entity.OwnerAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerAccountRepository extends JpaRepository<OwnerAccount, Long> {

    Optional<OwnerAccount> findByEmail(String email);

    boolean existsByEmail(String email);
}
