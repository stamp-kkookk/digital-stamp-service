package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.CustomerWallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {

    boolean existsByPhone(String phone);
}
