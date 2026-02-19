-- Remove terminal-related data and schema
DELETE FROM refresh_token WHERE token_type = 'TERMINAL';
ALTER TABLE refresh_token DROP COLUMN store_id;
