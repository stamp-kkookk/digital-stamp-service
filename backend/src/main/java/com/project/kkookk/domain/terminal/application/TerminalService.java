package com.project.kkookk.domain.terminal.application;

import com.project.kkookk.common.dto.PageResponse;
import com.project.kkookk.domain.issuance.domain.IssuanceSession;
import com.project.kkookk.domain.issuance.domain.IssuanceStatus;
import com.project.kkookk.domain.issuance.dto.PendingIssuanceRequestResponse;
import com.project.kkookk.domain.issuance.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.domain.issuance.exception.IssuanceRequestNotPendingException;
import com.project.kkookk.domain.issuance.repository.IssuanceSessionRepository;
import com.project.kkookk.domain.store.entity.Store;
import com.project.kkookk.domain.store.repository.StoreRepository;
import com.project.kkookk.domain.terminal.exception.TerminalAccessDeniedException;
import com.project.kkookk.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TerminalService {

    private final IssuanceSessionRepository issuanceSessionRepository;
    private final StoreRepository storeRepository;

    public PageResponse<PendingIssuanceRequestResponse> getPendingIssuances(Long storeId, User owner, Pageable pageable) {
        validateStoreOwnership(storeId, owner);
        Page<PendingIssuanceRequestResponse> page = issuanceSessionRepository.findPendingRequestsByStoreId(
                storeId, IssuanceStatus.PENDING, LocalDateTime.now(), pageable);
        return PageResponse.from(page);
    }

    @Transactional
    public void approveIssuance(Long storeId, UUID requestId, User owner) {
        validateStoreOwnership(storeId, owner);
        IssuanceSession session = issuanceSessionRepository.findByIdWithLock(requestId)
                .orElseThrow(IssuanceRequestNotFoundException::new);
        
        if (!session.getStore().getId().equals(storeId)) {
            throw new TerminalAccessDeniedException();
        }

        try {
            session.approve();
        } catch (IllegalStateException e) {
            throw new IssuanceRequestNotPendingException();
        }
    }

    @Transactional
    public void rejectIssuance(Long storeId, UUID requestId, User owner) {
        validateStoreOwnership(storeId, owner);
        IssuanceSession session = issuanceSessionRepository.findByIdWithLock(requestId)
                .orElseThrow(IssuanceRequestNotFoundException::new);

        if (!session.getStore().getId().equals(storeId)) {
            throw new TerminalAccessDeniedException();
        }
        
        try {
            session.reject();
        } catch (IllegalStateException e) {
            throw new IssuanceRequestNotPendingException();
        }
    }
    
    private void validateStoreOwnership(Long storeId, User owner) {
        // StoreRepository를 통해 가게 소유주 확인 또는 User Entity에 가게 목록이 있다면 그것을 활용
        boolean isOwner = owner.getStores().stream().anyMatch(store -> store.getId().equals(storeId));
        if (!isOwner) {
            throw new TerminalAccessDeniedException();
        }
    }
}
