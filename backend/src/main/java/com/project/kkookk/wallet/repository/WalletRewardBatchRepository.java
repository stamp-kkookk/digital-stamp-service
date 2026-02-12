package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletReward;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class WalletRewardBatchRepository {

    private final JdbcClient jdbcClient;
    private static final int BATCH_SIZE = 50;

    private static final String INSERT_PREFIX =
            "INSERT INTO wallet_reward "
                    + "(wallet_id, stamp_card_id, store_id, status, "
                    + "issued_at, expires_at, created_at, updated_at) VALUES ";

    private static final String VALUE_PLACEHOLDER = "(?, ?, ?, ?, ?, ?, ?, ?)";

    public void batchInsert(List<WalletReward> rewards) {
        if (rewards.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < rewards.size(); i += BATCH_SIZE) {
            List<WalletReward> batch = rewards.subList(i, Math.min(i + BATCH_SIZE, rewards.size()));

            String sql =
                    INSERT_PREFIX
                            + batch.stream()
                                    .map(r -> VALUE_PLACEHOLDER)
                                    .collect(Collectors.joining(", "));

            List<Object> params = new ArrayList<>(batch.size() * 8);
            for (WalletReward reward : batch) {
                params.add(reward.getWalletId());
                params.add(reward.getStampCardId());
                params.add(reward.getStoreId());
                params.add(reward.getStatus().name());
                params.add(reward.getIssuedAt());
                params.add(reward.getExpiresAt());
                params.add(now);
                params.add(now);
            }

            jdbcClient.sql(sql).params(params).update();
        }
    }
}
