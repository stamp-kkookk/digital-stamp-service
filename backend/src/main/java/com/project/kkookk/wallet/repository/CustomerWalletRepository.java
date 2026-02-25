package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.CustomerWallet;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {

    Optional<CustomerWallet> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByNickname(String nickname);

    Optional<CustomerWallet> findByPhoneAndName(String phone, String name);

    /** 비관적 락으로 조회 (동시성 제어) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM CustomerWallet w WHERE w.id = :id")
    Optional<CustomerWallet> findByIdWithLock(@Param("id") Long id);

    /** 여러 지갑 ID에 대해 ID와 이름을 한 번에 조회 (N+1 방지) */
    @Query("SELECT w FROM CustomerWallet w WHERE w.id IN :ids")
    List<CustomerWallet> findAllByIds(@Param("ids") Set<Long> ids);
}
