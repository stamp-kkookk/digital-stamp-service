-- =============================================================================
-- V6: 이미지 저장 방식 전환 — Base64/DB → 파일 스토리지/URL
-- Phase 2: Store 아이콘 (icon_image_base64 → icon_image_key)
-- Phase 5: Migration 증빙 사진 (image_data → image_key)
--
-- 주의: 기존 Base64 데이터는 VARCHAR(255)로 변환 불가하므로,
--       마이그레이션 전에 기존 데이터를 파일 스토리지로 이전하거나
--       기존 행의 이미지 데이터가 유실될 수 있음.
--       개발 환경은 ddl-auto: create-drop이므로 영향 없음.
-- =============================================================================

-- 1. Store: icon_image_base64 LONGTEXT → icon_image_key VARCHAR(255)
ALTER TABLE store
    DROP COLUMN icon_image_base64,
    ADD COLUMN icon_image_key VARCHAR(255) DEFAULT NULL;

-- 2. StampMigrationRequest: image_data MEDIUMTEXT → image_key VARCHAR(255)
ALTER TABLE stamp_migration_request
    DROP COLUMN image_data,
    ADD COLUMN image_key VARCHAR(255) NOT NULL DEFAULT '';
