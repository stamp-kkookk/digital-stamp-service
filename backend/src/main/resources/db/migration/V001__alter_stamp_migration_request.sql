-- Sprint 3: Migration Request Schema Changes
-- 1. Change image_url (VARCHAR) to image_data (MEDIUMTEXT) for Base64 storage
-- 2. Add claimed_stamp_count column for customer's claimed stamp count
-- 3. Add composite indexes for query optimization

-- Step 1: Add new columns
ALTER TABLE stamp_migration_request
    ADD COLUMN image_data MEDIUMTEXT NULL COMMENT 'Base64 인코딩된 이미지 데이터' AFTER store_id,
    ADD COLUMN claimed_stamp_count INT NULL COMMENT '고객이 주장하는 스탬프 개수' AFTER image_data;

-- Step 2: Migrate existing data (if any)
-- UPDATE stamp_migration_request SET image_data = image_url WHERE image_url IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE stamp_migration_request
    DROP COLUMN image_url;

-- Step 4: Make new columns NOT NULL
ALTER TABLE stamp_migration_request
    MODIFY COLUMN image_data MEDIUMTEXT NOT NULL COMMENT 'Base64 인코딩된 이미지 데이터',
    MODIFY COLUMN claimed_stamp_count INT NOT NULL COMMENT '고객이 주장하는 스탬프 개수';

-- Step 5: Add composite indexes for query optimization
CREATE INDEX idx_customer_wallet_id_status ON stamp_migration_request(customer_wallet_id, status);
CREATE INDEX idx_store_id_status ON stamp_migration_request(store_id, status);
