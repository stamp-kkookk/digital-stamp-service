package com.project.kkookk.common.limit.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.project.kkookk.common.limit.config.FailureLimitProperties;
import com.project.kkookk.common.limit.exception.BlockedException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;

class FailureLimitServiceTest {

    private FailureLimitService failureLimitService;
    private CacheManager cacheManager;
    private FailureLimitProperties properties;
    private Cache failureCache;

    @BeforeEach
    void setUp() {
        // Properties 설정
        properties = new FailureLimitProperties();
        properties.setMaxAttempts(3);
        properties.setCooldownPeriod(Duration.ofSeconds(1));

        // CacheManager 설정
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager("failureCache");
        caffeineCacheManager.setCaffeine(
            Caffeine.newBuilder()
                .expireAfterWrite(properties.getCooldownPeriod().toMillis(), TimeUnit.MILLISECONDS)
                .maximumSize(10000)
        );
        cacheManager = caffeineCacheManager;

        // Service 생성
        failureLimitService = new FailureLimitService(cacheManager, properties);

        // Cache 초기화
        failureCache = cacheManager.getCache("failureCache");
        failureCache.clear();
    }

    @Test
    @DisplayName("정상: 성공적인 요청은 카운터에 영향을 주지 않는다.")
    void recordSuccess_shouldNotIncrementCounter() {
        // given
        String identifier = "user@example.com";

        // when
        failureLimitService.recordSuccess(identifier);
        int remainingAttempts = failureLimitService.getRemainingAttempts(identifier);

        // then
        assertThat(remainingAttempts).isEqualTo(properties.getMaxAttempts());
        assertThat(failureCache.get(identifier)).isNull();
    }

    @Test
    @DisplayName("정상: 실패 기록 후 성공 시 카운터가 초기화된다.")
    void recordSuccess_shouldResetCounter_afterFailure() {
        // given
        String identifier = "user@example.com";
        failureLimitService.recordFailure(identifier);

        // when
        failureLimitService.recordSuccess(identifier);
        int remainingAttempts = failureLimitService.getRemainingAttempts(identifier);

        // then
        assertThat(remainingAttempts).isEqualTo(properties.getMaxAttempts());
        assertThat(failureCache.get(identifier)).isNull();
    }

    @Test
    @DisplayName("실패 누적: 실패 횟수가 누적되고 남은 시도 횟수가 줄어든다.")
    void recordFailure_shouldIncrementCounter() {
        // given
        String identifier = "user@example.com";

        // when
        failureLimitService.recordFailure(identifier);
        int remainingAttempts = failureLimitService.getRemainingAttempts(identifier);

        // then
        assertThat(remainingAttempts).isEqualTo(properties.getMaxAttempts() - 1);

        // when
        failureLimitService.recordFailure(identifier);
        remainingAttempts = failureLimitService.getRemainingAttempts(identifier);

        // then
        assertThat(remainingAttempts).isEqualTo(properties.getMaxAttempts() - 2);
    }

    @Test
    @DisplayName("차단: 실패 횟수가 임계값에 도달하면 계정이 차단된다.")
    void recordFailure_shouldBlock_whenMaxAttemptsReached() {
        // given
        String identifier = "user@example.com";
        for (int i = 0; i < properties.getMaxAttempts(); i++) {
            failureLimitService.recordFailure(identifier);
        }

        // when & then
        assertThatThrownBy(() -> failureLimitService.checkBlocked(identifier))
            .isInstanceOf(BlockedException.class)
            .satisfies(e -> {
                BlockedException be = (BlockedException) e;
                assertThat(be.getFailureCount()).isEqualTo(properties.getMaxAttempts());
                assertThat(be.getBlockedDuration().toSeconds()).isBetween(0L, 1L);
            });
    }

    @Test
    @DisplayName("차단 중 요청: 차단 상태에서는 요청이 즉시 거부된다.")
    void checkBlocked_shouldThrowException_whenBlocked() {
        // given
        String identifier = "user@example.com";
        // Block the user
        for (int i = 0; i < properties.getMaxAttempts(); i++) {
            failureLimitService.recordFailure(identifier);
        }

        // when & then
        assertThatThrownBy(() -> failureLimitService.checkBlocked(identifier))
            .isInstanceOf(BlockedException.class);
    }

    @Test
    @DisplayName("쿨다운 해제: 차단 기간이 지나면 자동으로 해제된다.")
    void checkBlocked_shouldPass_afterCooldown() throws InterruptedException {
        // given
        String identifier = "user@example.com";
        // Block the user
        for (int i = 0; i < properties.getMaxAttempts(); i++) {
            failureLimitService.recordFailure(identifier);
        }

        // when
        // Wait for cooldown to expire
        Thread.sleep(properties.getCooldownPeriod().toMillis() + 100);

        // then
        // The cache entry has expired, so a new record will be created on failure.
        // checkBlocked should pass as the old record is gone.
        failureLimitService.checkBlocked(identifier);

        // After cooldown, the next failure should just be counted as the first one.
        failureLimitService.recordFailure(identifier);
        int remaining = failureLimitService.getRemainingAttempts(identifier);
        assertThat(remaining).isEqualTo(properties.getMaxAttempts() - 1);
    }

    @Test
    @DisplayName("조회: 남은 시도 횟수를 정확히 반환한다.")
    void getRemainingAttempts_shouldReturnCorrectCount() {
        // given
        String identifier = "user@example.com";
        assertThat(failureLimitService.getRemainingAttempts(identifier)).isEqualTo(properties.getMaxAttempts());

        // when
        failureLimitService.recordFailure(identifier);

        // then
        assertThat(failureLimitService.getRemainingAttempts(identifier)).isEqualTo(properties.getMaxAttempts() - 1);
    }

    @Test
    @DisplayName("조회: 차단된 경우 남은 차단 시간을 반환한다.")
    void getBlockedDuration_shouldReturnDuration_whenBlocked() {
        // given
        String identifier = "user@example.com";
        for (int i = 0; i < properties.getMaxAttempts(); i++) {
            failureLimitService.recordFailure(identifier);
        }

        // when
        var durationOpt = failureLimitService.getBlockedDuration(identifier);

        // then
        assertThat(durationOpt).isPresent();
        assertThat(durationOpt.get().toSeconds()).isBetween(0L, 1L);
    }

    @Test
    @DisplayName("조회: 차단되지 않은 경우 빈 Optional을 반환한다.")
    void getBlockedDuration_shouldReturnEmpty_whenNotBlocked() {
        // given
        String identifier = "user@example.com";
        failureLimitService.recordFailure(identifier);

        // when
        var durationOpt = failureLimitService.getBlockedDuration(identifier);

        // then
        assertThat(durationOpt).isEmpty();
    }
}
