-- ============================================================================
-- KYC DOCUMENTS TABLE - MySQL Version
-- ============================================================================
-- Stores KYC/verification documents uploaded by freelancers

USE uniti;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT UNSIGNED NOT NULL,
    document_type ENUM('id_card', 'passport', 'drivers_license', 'proof_of_address', 'tax_id', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED,
    mime_type VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT UNSIGNED NULL COMMENT 'Admin user who reviewed',
    reviewed_at DATETIME NULL,
    rejection_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_kyc_freelancer (freelancer_id),
    INDEX idx_kyc_status (status),
    INDEX idx_kyc_type (document_type)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

