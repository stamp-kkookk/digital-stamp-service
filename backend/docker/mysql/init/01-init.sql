-- ============================================
-- KKOOKK Database Initialization Script
-- ============================================
-- This script runs automatically when the MySQL container is first created.
-- Note: MYSQL_USER (kkookkuser) is automatically created by MySQL Docker image
-- with full access to MYSQL_DATABASE (kkookkdb).

-- ============================================
-- Schema Definition
-- ============================================

-- StampCard Table
CREATE TABLE IF NOT EXISTS stamp_cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    goal_stamp_count INT NOT NULL,
    required_stamps INT NULL,
    reward_name VARCHAR(255) NULL,
    reward_quantity INT NULL,
    expire_days INT NULL,
    design_json TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_stamp_cards_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='스탬프 카드 정보';
