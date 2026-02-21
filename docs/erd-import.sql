-- KKOOKK ERD (OAuth 전용 전환 후)
-- erdcloud.com > Import > MySQL DDL

CREATE TABLE `owner_account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE,
  `password_hash` VARCHAR(255),
  `name` VARCHAR(100),
  `nickname` VARCHAR(50),
  `phone_number` VARCHAR(30),
  `admin` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `customer_wallet` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(50) NOT NULL,
  `nickname` VARCHAR(50) NOT NULL UNIQUE,
  `status` VARCHAR(20) NOT NULL COMMENT 'ACTIVE | BLOCKED',
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `oauth_account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(20) NOT NULL COMMENT 'GOOGLE | KAKAO | NAVER',
  `provider_id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `name` VARCHAR(100),
  `owner_account_id` BIGINT COMMENT 'FK → owner_account (nullable)',
  `customer_wallet_id` BIGINT COMMENT 'FK → customer_wallet (nullable)',
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_provider_id` (`provider`, `provider_id`),
  FOREIGN KEY (`owner_account_id`) REFERENCES `owner_account`(`id`),
  FOREIGN KEY (`customer_wallet_id`) REFERENCES `customer_wallet`(`id`)
);

CREATE TABLE `refresh_token` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `token_type` VARCHAR(20) NOT NULL COMMENT 'OWNER | CUSTOMER',
  `subject_id` BIGINT NOT NULL COMMENT 'owner_account.id or customer_wallet.id',
  `email` VARCHAR(255),
  `is_admin` TINYINT(1),
  `expires_at` DATETIME(6) NOT NULL,
  `revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_user_type` (`token_type`, `subject_id`),
  KEY `idx_expires_at` (`expires_at`)
);

CREATE TABLE `store` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255),
  `phone` VARCHAR(50),
  `place_ref` VARCHAR(100) UNIQUE,
  `icon_image_base64` LONGTEXT,
  `description` VARCHAR(500),
  `status` VARCHAR(20) NOT NULL COMMENT 'DRAFT | LIVE | SUSPENDED | DELETED',
  `owner_account_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_account_id`) REFERENCES `owner_account`(`id`)
);

CREATE TABLE `store_audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `action` VARCHAR(30) NOT NULL COMMENT 'CREATED | STATUS_CHANGED | UPDATED | DELETED',
  `previous_status` VARCHAR(20),
  `new_status` VARCHAR(20),
  `performed_by` BIGINT COMMENT 'owner_account.id',
  `performed_by_type` VARCHAR(20) NOT NULL COMMENT 'OWNER | ADMIN | SYSTEM',
  `detail` TEXT,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sal_store` (`store_id`),
  KEY `idx_sal_created` (`created_at`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`)
);

CREATE TABLE `stamp_cards` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL COMMENT 'DRAFT | ACTIVE | ARCHIVED',
  `goal_stamp_count` INT NOT NULL,
  `required_stamps` INT,
  `reward_name` VARCHAR(255),
  `reward_quantity` INT,
  `expire_days` INT,
  `design_type` VARCHAR(20) NOT NULL COMMENT 'COLOR | IMAGE | PUZZLE',
  `design_json` MEDIUMTEXT,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`)
);

CREATE TABLE `wallet_stamp_card` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_wallet_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  `stamp_card_id` BIGINT NOT NULL,
  `stamp_count` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL COMMENT 'ACTIVE | COMPLETED',
  `last_stamped_at` DATETIME(6),
  `completed_at` DATETIME(6),
  `version` BIGINT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customer_wallet_id`) REFERENCES `customer_wallet`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`),
  FOREIGN KEY (`stamp_card_id`) REFERENCES `stamp_cards`(`id`)
);

CREATE TABLE `wallet_reward` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `wallet_id` BIGINT NOT NULL,
  `stamp_card_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL COMMENT 'AVAILABLE | REDEEMED | EXPIRED',
  `issued_at` DATETIME(6) NOT NULL,
  `expires_at` DATETIME(6),
  `redeemed_at` DATETIME(6),
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`wallet_id`) REFERENCES `customer_wallet`(`id`),
  FOREIGN KEY (`stamp_card_id`) REFERENCES `stamp_cards`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`)
);

CREATE TABLE `issuance_request` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `wallet_id` BIGINT NOT NULL,
  `wallet_stamp_card_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL COMMENT 'PENDING | APPROVED | REJECTED | EXPIRED',
  `idempotency_key` VARCHAR(100),
  `expires_at` DATETIME(6) NOT NULL,
  `approved_at` DATETIME(6),
  `rewards_issued` INT,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_issuance_wallet_idempotency` (`wallet_id`, `idempotency_key`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`),
  FOREIGN KEY (`wallet_id`) REFERENCES `customer_wallet`(`id`),
  FOREIGN KEY (`wallet_stamp_card_id`) REFERENCES `wallet_stamp_card`(`id`)
);

CREATE TABLE `stamp_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `stamp_card_id` BIGINT NOT NULL,
  `wallet_stamp_card_id` BIGINT,
  `type` VARCHAR(30) NOT NULL COMMENT 'ISSUED | MIGRATED | MANUAL_ADJUST',
  `delta` INT NOT NULL,
  `reason` VARCHAR(255),
  `occurred_at` DATETIME(6) NOT NULL,
  `issuance_request_id` BIGINT,
  `stamp_migration_request_id` BIGINT,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`),
  FOREIGN KEY (`stamp_card_id`) REFERENCES `stamp_cards`(`id`),
  FOREIGN KEY (`wallet_stamp_card_id`) REFERENCES `wallet_stamp_card`(`id`),
  FOREIGN KEY (`issuance_request_id`) REFERENCES `issuance_request`(`id`)
);

CREATE TABLE `stamp_migration_request` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_wallet_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  `image_data` MEDIUMTEXT NOT NULL,
  `claimed_stamp_count` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL COMMENT 'SUBMITTED | APPROVED | REJECTED | CANCELED',
  `approved_stamp_count` INT,
  `reject_reason` VARCHAR(255),
  `requested_at` DATETIME(6) NOT NULL,
  `processed_at` DATETIME(6),
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customer_wallet_id`) REFERENCES `customer_wallet`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`)
);

CREATE TABLE `redeem_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `wallet_reward_id` BIGINT NOT NULL,
  `wallet_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  `result` VARCHAR(20) NOT NULL,
  `occurred_at` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`wallet_reward_id`) REFERENCES `wallet_reward`(`id`),
  FOREIGN KEY (`wallet_id`) REFERENCES `customer_wallet`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `store`(`id`)
);
