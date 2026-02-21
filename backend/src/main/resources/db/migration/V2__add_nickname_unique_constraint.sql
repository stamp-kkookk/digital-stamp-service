-- ============================================================================
-- V2: 닉네임 유니크 제약 추가
-- 로컬(ddl-auto: create-drop)에서는 JPA 어노테이션으로 자동 적용됨.
-- 프로덕션 배포 시 이 스크립트를 수동 실행 (Flyway 미도입 상태).
-- ============================================================================

-- Step 1: 기존 중복 닉네임 정리 (중복된 닉네임에 '_번호' suffix 추가)
UPDATE customer_wallet cw
JOIN (
    SELECT id, nickname,
           ROW_NUMBER() OVER (PARTITION BY nickname ORDER BY id) as rn
    FROM customer_wallet
) ranked ON cw.id = ranked.id
SET cw.nickname = CONCAT(ranked.nickname, '_', ranked.rn)
WHERE ranked.rn > 1;

-- Step 2: 유니크 제약 추가
ALTER TABLE customer_wallet
ADD CONSTRAINT uk_customer_wallet_nickname UNIQUE (nickname);
