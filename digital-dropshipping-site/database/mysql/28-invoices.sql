-- ============================================================================
-- INVOICES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS invoices (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT UNSIGNED NOT NULL,
    client_id INT UNSIGNED NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('issued', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'issued',
    invoice_number VARCHAR(50) NULL UNIQUE,                         -- Human-readable invoice number
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME NULL,
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,

    INDEX idx_invoices_milestone (milestone_id),
    INDEX idx_invoices_client (client_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_due_date (due_date)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS invoices_recovery (
    id INT UNSIGNED PRIMARY KEY,
    milestone_id INT UNSIGNED NOT NULL,
    client_id INT UNSIGNED NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('issued', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'issued',
    invoice_number VARCHAR(50) NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME NULL,
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients_recovery(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_invoices_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_invoices_insert
    AFTER INSERT ON invoices
    FOR EACH ROW
BEGIN
    INSERT INTO invoices_recovery (id, milestone_id, client_id, amount_cents, currency, status, invoice_number, issued_at, paid_at, due_date, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.milestone_id, NEW.client_id, NEW.amount_cents, NEW.currency, NEW.status, NEW.invoice_number, NEW.issued_at, NEW.paid_at, NEW.due_date, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        milestone_id = NEW.milestone_id,
        client_id = NEW.client_id,
        amount_cents = NEW.amount_cents,
        currency = NEW.currency,
        status = NEW.status,
        invoice_number = NEW.invoice_number,
        issued_at = NEW.issued_at,
        paid_at = NEW.paid_at,
        due_date = NEW.due_date,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_invoices_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_invoices_update
    AFTER UPDATE ON invoices
    FOR EACH ROW
BEGIN
    UPDATE invoices_recovery 
    SET milestone_id = NEW.milestone_id,
        client_id = NEW.client_id,
        amount_cents = NEW.amount_cents,
        currency = NEW.currency,
        status = NEW.status,
        invoice_number = NEW.invoice_number,
        issued_at = NEW.issued_at,
        paid_at = NEW.paid_at,
        due_date = NEW.due_date,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_invoices_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_invoices_delete
    AFTER DELETE ON invoices
    FOR EACH ROW
BEGIN
    DELETE FROM invoices_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires milestones and clients to exist first
INSERT INTO invoices (milestone_id, client_id, amount_cents, currency, status, invoice_number, due_date)
SELECT 
    m.id,
    c.id,
    m.amount_cents,
    'AUD',
    'issued',
    CONCAT('INV-', YEAR(NOW()), '-', LPAD(m.id, 6, '0')),
    DATE_ADD(NOW(), INTERVAL 14 DAY)
FROM milestones m
JOIN contracts ct ON ct.id = m.contract_id
JOIN projects p ON p.id = ct.project_id
JOIN clients c ON c.id = p.client_id
WHERE m.status = 'approved'
LIMIT 1
ON DUPLICATE KEY UPDATE invoice_number = VALUES(invoice_number);

