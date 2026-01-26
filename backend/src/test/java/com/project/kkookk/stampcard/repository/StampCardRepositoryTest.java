package com.project.kkookk.stampcard.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@DataJpaTest
class StampCardRepositoryTest {

    @Autowired private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("스탬프 카드 저장 및 조회")
    void saveAndFindById() {
        // given
        StampCard stampCard =
                StampCard.builder()
                        .storeId(1L)
                        .title("커피 스탬프 카드")
                        .goalStampCount(10)
                        .requiredStamps(10)
                        .rewardName("아메리카노 1잔 무료")
                        .rewardQuantity(1)
                        .expireDays(30)
                        .designJson("{\"theme\": \"coffee\"}")
                        .build();

        // when
        StampCard saved = stampCardRepository.save(stampCard);
        Optional<StampCard> found = stampCardRepository.findById(saved.getId());

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("커피 스탬프 카드");
        assertThat(found.get().getStatus()).isEqualTo(StampCardStatus.DRAFT);
        assertThat(found.get().getGoalStampCount()).isEqualTo(10);
    }

    @Test
    @DisplayName("ID와 매장 ID로 스탬프 카드 조회")
    void findByIdAndStoreId() {
        // given
        Long storeId = 1L;
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        StampCard saved = stampCardRepository.save(stampCard);

        // when
        Optional<StampCard> found = stampCardRepository.findByIdAndStoreId(saved.getId(), storeId);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getStoreId()).isEqualTo(storeId);
    }

    @Test
    @DisplayName("ID와 매장 ID로 스탬프 카드 조회 실패 - 다른 매장")
    void findByIdAndStoreId_Fail_DifferentStore() {
        // given
        Long storeId = 1L;
        Long otherStoreId = 2L;
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        StampCard saved = stampCardRepository.save(stampCard);

        // when
        Optional<StampCard> found =
                stampCardRepository.findByIdAndStoreId(saved.getId(), otherStoreId);

        // then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("매장 ID로 스탬프 카드 목록 조회")
    void findByStoreId() {
        // given
        Long storeId = 1L;
        StampCard card1 =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();
        StampCard card2 =
                StampCard.builder().storeId(storeId).title("디저트 스탬프 카드").goalStampCount(5).build();

        stampCardRepository.save(card1);
        stampCardRepository.save(card2);

        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<StampCard> result = stampCardRepository.findByStoreId(storeId, pageable);

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent())
                .extracting(StampCard::getTitle)
                .containsExactlyInAnyOrder("커피 스탬프 카드", "디저트 스탬프 카드");
    }

    @Test
    @DisplayName("매장 ID와 상태로 스탬프 카드 목록 조회")
    void findByStoreIdAndStatus() {
        // given
        Long storeId = 1L;
        StampCard draftCard =
                StampCard.builder().storeId(storeId).title("초안 카드").goalStampCount(10).build();

        StampCard activeCard =
                StampCard.builder().storeId(storeId).title("활성 카드").goalStampCount(10).build();
        activeCard.updateStatus(StampCardStatus.ACTIVE);

        stampCardRepository.save(draftCard);
        stampCardRepository.save(activeCard);

        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<StampCard> draftResults =
                stampCardRepository.findByStoreIdAndStatus(
                        storeId, StampCardStatus.DRAFT, pageable);
        Page<StampCard> activeResults =
                stampCardRepository.findByStoreIdAndStatus(
                        storeId, StampCardStatus.ACTIVE, pageable);

        // then
        assertThat(draftResults.getContent()).hasSize(1);
        assertThat(draftResults.getContent().get(0).getTitle()).isEqualTo("초안 카드");

        assertThat(activeResults.getContent()).hasSize(1);
        assertThat(activeResults.getContent().get(0).getTitle()).isEqualTo("활성 카드");
    }

    @Test
    @DisplayName("매장 ID와 상태로 스탬프 카드 존재 여부 확인")
    void existsByStoreIdAndStatus() {
        // given
        Long storeId = 1L;
        StampCard activeCard =
                StampCard.builder().storeId(storeId).title("활성 카드").goalStampCount(10).build();
        activeCard.updateStatus(StampCardStatus.ACTIVE);

        stampCardRepository.save(activeCard);

        // when
        boolean hasActive =
                stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);
        boolean hasPaused =
                stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.PAUSED);

        // then
        assertThat(hasActive).isTrue();
        assertThat(hasPaused).isFalse();
    }

    @Test
    @DisplayName("스탬프 카드 상태 업데이트")
    void updateStampCardStatus() {
        // given
        StampCard stampCard =
                StampCard.builder().storeId(1L).title("커피 스탬프 카드").goalStampCount(10).build();

        StampCard saved = stampCardRepository.save(stampCard);

        // when
        saved.updateStatus(StampCardStatus.ACTIVE);
        stampCardRepository.flush();

        // then
        Optional<StampCard> updated = stampCardRepository.findById(saved.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(StampCardStatus.ACTIVE);
    }

    @Test
    @DisplayName("스탬프 카드 정보 업데이트")
    void updateStampCardInfo() {
        // given
        StampCard stampCard =
                StampCard.builder()
                        .storeId(1L)
                        .title("원본 카드")
                        .goalStampCount(10)
                        .rewardName("원본 리워드")
                        .build();

        StampCard saved = stampCardRepository.save(stampCard);

        // when
        saved.update("수정된 카드", 15, 15, "수정된 리워드", 2, 60, "{\"theme\": \"new\"}");
        stampCardRepository.flush();

        // then
        Optional<StampCard> updated = stampCardRepository.findById(saved.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getTitle()).isEqualTo("수정된 카드");
        assertThat(updated.get().getGoalStampCount()).isEqualTo(15);
        assertThat(updated.get().getRewardName()).isEqualTo("수정된 리워드");
    }

    @Test
    @DisplayName("스탬프 카드 삭제")
    void deleteStampCard() {
        // given
        StampCard stampCard =
                StampCard.builder().storeId(1L).title("커피 스탬프 카드").goalStampCount(10).build();

        StampCard saved = stampCardRepository.save(stampCard);
        Long savedId = saved.getId();

        // when
        stampCardRepository.delete(saved);
        stampCardRepository.flush();

        // then
        Optional<StampCard> found = stampCardRepository.findById(savedId);
        assertThat(found).isEmpty();
    }
}
