package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletStampCard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletStampCardRepository extends JpaRepository<WalletStampCard, Long> {

    /**
     * 고객 지갑의 모든 스탬프카드 조회
     */
    List<WalletStampCard> findByCustomerWalletId(Long customerWalletId);

    /**
     * 고객 지갑 + 스탬프카드 ID로 조회
     */
    Optional<WalletStampCard> findByIdAndCustomerWalletId(Long id, Long customerWalletId);

    /**
     * 매장별 고객 지갑 스탬프카드 조회
     */
    Optional<WalletStampCard> findByCustomerWalletIdAndStoreId(Long customerWalletId, Long storeId);
}
