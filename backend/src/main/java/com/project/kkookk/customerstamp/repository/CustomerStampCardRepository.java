package com.project.kkookk.customerstamp.repository;

import com.project.kkookk.customerstamp.domain.CustomerStampCard;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.wallet.domain.CustomerWallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerStampCardRepository extends JpaRepository<CustomerStampCard, Long> {
    Optional<CustomerStampCard> findByCustomerWalletAndStore(
            CustomerWallet customerWallet, Store store);
}
