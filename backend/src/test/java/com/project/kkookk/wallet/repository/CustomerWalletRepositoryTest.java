package com.project.kkookk.wallet.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@DataJpaTest
@EnableJpaAuditing
class CustomerWalletRepositoryTest {

    @Autowired private CustomerWalletRepository customerWalletRepository;

    @Test
    @DisplayName("전화번호로 지갑 조회 성공")
    void findByPhone_Success() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-1234-5678").name("홍길동").nickname("길동이").build();
        customerWalletRepository.save(wallet);

        // when
        Optional<CustomerWallet> found = customerWalletRepository.findByPhone("010-1234-5678");

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getPhone()).isEqualTo("010-1234-5678");
        assertThat(found.get().getName()).isEqualTo("홍길동");
        assertThat(found.get().getNickname()).isEqualTo("길동이");
        assertThat(found.get().getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
    }

    @Test
    @DisplayName("전화번호로 지갑 조회 실패 - 존재하지 않음")
    void findByPhone_NotFound() {
        // when
        Optional<CustomerWallet> found = customerWalletRepository.findByPhone("010-9999-9999");

        // then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("전화번호 존재 여부 확인 - 존재함")
    void existsByPhone_True() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-1234-5678").name("홍길동").nickname("길동이").build();
        customerWalletRepository.save(wallet);

        // when
        boolean exists = customerWalletRepository.existsByPhone("010-1234-5678");

        // then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("전화번호 존재 여부 확인 - 존재하지 않음")
    void existsByPhone_False() {
        // when
        boolean exists = customerWalletRepository.existsByPhone("010-9999-9999");

        // then
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("지갑 저장 시 기본 상태는 ACTIVE")
    void save_DefaultStatus_Active() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-5555-6666").name("김철수").nickname("철수").build();

        // when
        CustomerWallet saved = customerWalletRepository.save(wallet);

        // then
        assertThat(saved.getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
        assertThat(saved.isActive()).isTrue();
        assertThat(saved.isBlocked()).isFalse();
    }

    @Test
    @DisplayName("지갑 저장 시 createdAt, updatedAt 자동 설정")
    void save_AutoTimestamps() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-7777-8888").name("이영희").nickname("영희").build();

        // when
        CustomerWallet saved = customerWalletRepository.save(wallet);

        // then
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("지갑 상태 변경 - ACTIVE to BLOCKED")
    void changeStatus_ActiveToBlocked() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-1111-2222").name("박민수").nickname("민수").build();
        CustomerWallet saved = customerWalletRepository.save(wallet);

        // when
        saved.block();
        customerWalletRepository.save(saved);

        // then
        Optional<CustomerWallet> found = customerWalletRepository.findByPhone("010-1111-2222");
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(CustomerWalletStatus.BLOCKED);
        assertThat(found.get().isBlocked()).isTrue();
        assertThat(found.get().isActive()).isFalse();
    }

    @Test
    @DisplayName("지갑 상태 변경 - BLOCKED to ACTIVE")
    void changeStatus_BlockedToActive() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-3333-4444").name("최유진").nickname("유진").build();
        CustomerWallet saved = customerWalletRepository.save(wallet);
        saved.block();
        customerWalletRepository.save(saved);

        // when
        saved.activate();
        customerWalletRepository.save(saved);

        // then
        Optional<CustomerWallet> found = customerWalletRepository.findByPhone("010-3333-4444");
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
        assertThat(found.get().isActive()).isTrue();
        assertThat(found.get().isBlocked()).isFalse();
    }
}
