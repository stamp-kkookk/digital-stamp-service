package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.CustomerWallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {

    Optional<CustomerWallet> findByPhoneAndName(String phone, String name);
}
