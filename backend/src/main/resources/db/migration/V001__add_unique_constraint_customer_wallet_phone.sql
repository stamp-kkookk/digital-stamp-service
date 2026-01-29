-- Add UNIQUE constraint to customer_wallet.phone
-- This prevents duplicate phone number registration at DB level
ALTER TABLE customer_wallet
ADD CONSTRAINT uk_customer_wallet_phone UNIQUE (phone);
