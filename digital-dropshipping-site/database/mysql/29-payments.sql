-- ============================================================================
-- PAYMENTS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED NULL,
    provider VARCHAR(50) NOT NULL,                                  -- 'stripe', 'paypal', 'bank_transfer', etc.
    provider_payment_id VARCHAR(255) NOT NULL,                       -- External payment ID
    amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'disputed') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,                                 -- 'credit_card', 'bank_transfer', etc.
    metadata JSON NULL,                                              -- Additional payment details
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    UNIQUE KEY uq_provider_payment (provider, provider_payment_id),

    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_provider (provider, provider_payment_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS payments_recovery (
    id INT UNSIGNED PRIMARY KEY,
    invoice_id INT UNSIGNED NULL,
    provider VARCHAR(50) NOT NULL,
    provider_payment_id VARCHAR(255) NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'disputed') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    metadata JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_payments_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_payments_insert
    AFTER INSERT ON payments
    FOR EACH ROW
BEGIN
    INSERT INTO payments_recovery (id, invoice_id, provider, provider_payment_id, amount_cents, currency, status, payment_method, metadata, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.invoice_id, NEW.provider, NEW.provider_payment_id, NEW.amount_cents, NEW.currency, NEW.status, NEW.payment_method, NEW.metadata, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        invoice_id = NEW.invoice_id,
        provider = NEW.provider,
        provider_payment_id = NEW.provider_payment_id,
        amount_cents = NEW.amount_cents,
        currency = NEW.currency,
        status = NEW.status,
        payment_method = NEW.payment_method,
        metadata = NEW.metadata,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_payments_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_payments_update
    AFTER UPDATE ON payments
    FOR EACH ROW
BEGIN
    UPDATE payments_recovery 
    SET invoice_id = NEW.invoice_id,
        provider = NEW.provider,
        provider_payment_id = NEW.provider_payment_id,
        amount_cents = NEW.amount_cents,
        currency = NEW.currency,
        status = NEW.status,
        payment_method = NEW.payment_method,
        metadata = NEW.metadata,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_payments_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_payments_delete
    AFTER DELETE ON payments
    FOR EACH ROW
BEGIN
    DELETE FROM payments_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires invoices to exist first
INSERT INTO payments (invoice_id, provider, provider_payment_id, amount_cents, currency, status, payment_method)
SELECT 
    i.id,
    'stripe',
    CONCAT('pi_', LPAD(i.id, 20, '0')),
    i.amount_cents,
    i.currency,
    'pending',
    'credit_card'
FROM invoices i
WHERE i.status = 'issued'
LIMIT 1
ON DUPLICATE KEY UPDATE provider_payment_id = VALUES(provider_payment_id);

