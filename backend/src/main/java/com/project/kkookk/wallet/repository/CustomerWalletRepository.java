package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.CustomerWallet;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {

    /** 여러 지갑 ID에 대해 ID와 이름을 한 번에 조회 (N+1 방지) */
    @Query("SELECT w FROM CustomerWallet w WHERE w.id IN :ids")
    List<CustomerWallet> findAllByIds(@Param("ids") Set<Long> ids);
}
