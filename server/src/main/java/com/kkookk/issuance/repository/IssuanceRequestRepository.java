package com.kkookk.issuance.repository;

import com.kkookk.issuance.entity.IssuanceRequest;
import com.kkookk.issuance.entity.IssuanceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssuanceRequestRepository extends JpaRepository<IssuanceRequest, Long> {

    Optional<IssuanceRequest> findByClientRequestId(String clientRequestId);

    List<IssuanceRequest> findByStoreIdAndStatusAndExpiresAtAfterOrderByCreatedAtAsc(
            Long storeId, IssuanceRequestStatus status, LocalDateTime now);

    List<IssuanceRequest> findByStatusAndExpiresAtBefore(
            IssuanceRequestStatus status, LocalDateTime now);
}
