package com.project.kkookk.wallet.service;

import com.project.kkookk.customerstamp.domain.CustomerStampCard;
import com.project.kkookk.customerstamp.repository.CustomerStampCardRepository;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.dto.StampCardInfo;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletAccessService {

    private final CustomerWalletRepository customerWalletRepository;
    private final StoreRepository storeRepository;
    private final CustomerStampCardRepository customerStampCardRepository;

    public WalletAccessResponse getWalletInfo(String phoneNumber, String userName, Long storeId) {
        CustomerWallet customerWallet =
                customerWalletRepository
                        .findByPhoneAndName(phoneNumber, userName)
                        .orElseThrow(() -> new BusinessException(ErrorCode.WALLET_NOT_FOUND));

        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        Optional<CustomerStampCard> customerStampCardOpt =
                customerStampCardRepository.findByCustomerWalletAndStore(customerWallet, store);

        StampCardInfo stampCardInfo = customerStampCardOpt.map(StampCardInfo::of).orElse(null);

        return WalletAccessResponse.of(customerWallet, stampCardInfo);
    }
}
