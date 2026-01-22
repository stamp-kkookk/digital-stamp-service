-- ============================================
-- KKOOKK Database Initialization Script
-- ============================================
-- This script runs automatically when the MySQL container is first created.
-- It creates the database and grants necessary permissions to the application user.
-- ============================================
-- Schema Definition
-- ============================================

-- Owner Account Table
CREATE TABLE IF NOT EXISTS owner_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    login_id VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone_number VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_login_id (login_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
