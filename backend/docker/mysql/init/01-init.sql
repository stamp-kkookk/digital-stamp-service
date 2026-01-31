-- ============================================
-- KKOOKK Database Initialization Script
-- ============================================
-- This script runs automatically when the MySQL container is first created.

-- ============================================
-- User & Permissions
-- ============================================
-- Create user if not exists
CREATE USER IF NOT EXISTS 'kkookkuser'@'localhost' IDENTIFIED BY 'kkookkpass';
CREATE USER IF NOT EXISTS 'kkookkuser'@'%' IDENTIFIED BY 'kkookkpass';

-- Grant all privileges on kkookkdb database
GRANT ALL PRIVILEGES ON kkookkdb.* TO 'kkookkuser'@'localhost';
GRANT ALL PRIVILEGES ON kkookkdb.* TO 'kkookkuser'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- ============================================
-- Schema Definition
-- ============================================

-- StampCard Table
