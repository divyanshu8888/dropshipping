-- Add password reset columns to users table
USE uniti;

ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL,
  ADD COLUMN reset_token_expires_at DATETIME DEFAULT NULL,
  ADD INDEX idx_reset_token (reset_token);
