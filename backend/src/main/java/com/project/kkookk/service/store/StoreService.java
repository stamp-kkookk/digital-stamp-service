package com.project.kkookk.service.store;

import com.project.kkookk.controller.store.dto.StoreCreateRequest;
import com.project.kkookk.controller.store.dto.StoreResponse;
import com.project.kkookk.controller.store.dto.StoreUpdateRequest;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 매장 서비스.
 */
@Service
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(final StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    /**
     * 매장 생성.
     *
     * @param ownerId 점주 ID
     * @param request 매장 생성 요청
     * @return 생성된 매장 응답
     */
    @Transactional
    public StoreResponse createStore(final Long ownerId, final StoreCreateRequest request) {
        final Store store = new Store(
                request.name(),
                request.address(),
                request.phone(),
                request.status(),
                ownerId
        );

        final Store savedStore = storeRepository.save(store);
        return StoreResponse.from(savedStore);
    }

    /**
     * 매장 목록 조회 (점주의 모든 매장).
     *
     * @param ownerId 점주 ID
     * @return 매장 목록
     */
    public List<StoreResponse> getStores(final Long ownerId) {
        return storeRepository.findByOwnerAccountId(ownerId).stream()
                .map(StoreResponse::from)
                .toList();
    }

    /**
     * 매장 단건 조회.
     *
     * @param ownerId 점주 ID
     * @param storeId 매장 ID
     * @return 매장 응답
     */
    public StoreResponse getStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        return StoreResponse.from(store);
    }

    /**
     * 매장 수정.
     *
     * @param ownerId 점주 ID
     * @param storeId 매장 ID
     * @param request 매장 수정 요청
     * @return 수정된 매장 응답
     */
    @Transactional
    public StoreResponse updateStore(
            final Long ownerId,
            final Long storeId,
            final StoreUpdateRequest request
    ) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        store.update(request.name(), request.address(), request.phone(), request.status());
        return StoreResponse.from(store);
    }

    /**
     * 매장 삭제 (Hard Delete).
     *
     * @param ownerId 점주 ID
     * @param storeId 매장 ID
     */
    @Transactional
    public void deleteStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        storeRepository.delete(store);
    }

    /**
     * 매장 ID와 점주 ID로 매장 조회 (권한 검증).
     *
     * @param storeId 매장 ID
     * @param ownerId 점주 ID
     * @return 매장
     * @throws BusinessException 매장을 찾을 수 없거나 접근 권한이 없는 경우
     */
    private Store findStoreByIdAndOwnerId(final Long storeId, final Long ownerId) {
        return storeRepository.findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
