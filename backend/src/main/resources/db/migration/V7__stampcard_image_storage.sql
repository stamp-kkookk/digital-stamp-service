-- StampCard IMAGE 타입: Base64 → 파일 스토리지 전환
-- 이미지를 designJson에서 분리하여 파일 스토리지 키로 관리
ALTER TABLE stamp_cards
    ADD COLUMN background_image_key VARCHAR(255) DEFAULT NULL,
    ADD COLUMN stamp_image_key VARCHAR(255) DEFAULT NULL;
