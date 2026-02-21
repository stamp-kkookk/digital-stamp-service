-- OAuth Account 테이블 생성
CREATE TABLE oauth_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(100),
    owner_account_id BIGINT,
    customer_wallet_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_provider_provider_id (provider, provider_id),
    INDEX idx_owner_account_id (owner_account_id),
    INDEX idx_customer_wallet_id (customer_wallet_id),
    FOREIGN KEY (owner_account_id) REFERENCES owner_account(id),
    FOREIGN KEY (customer_wallet_id) REFERENCES customer_wallet(id)
) ENGINE=InnoDB;

-- OwnerAccount: email, password_hash nullable + nickname 추가
ALTER TABLE owner_account MODIFY COLUMN email VARCHAR(255) NULL;
ALTER TABLE owner_account MODIFY COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE owner_account ADD COLUMN nickname VARCHAR(50) AFTER name;
