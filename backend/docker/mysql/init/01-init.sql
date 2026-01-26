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

-- Owner Account Table
CREATE TABLE IF NOT EXISTS owner_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone_number VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store Table
CREATE TABLE IF NOT EXISTS store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    owner_account_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_owner_account_id (owner_account_id),
    FOREIGN KEY (owner_account_id) REFERENCES owner_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

