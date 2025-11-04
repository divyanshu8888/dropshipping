-- ============================================================================
-- MESSAGES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    body TEXT NULL,
    file_path VARCHAR(512) NULL,                                     -- Optional attachment path
    is_read ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_messages_conversation (conversation_id, created_at DESC),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_is_read (is_read)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS messages_recovery (
    id BIGINT UNSIGNED PRIMARY KEY,
    conversation_id INT UNSIGNED NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    body TEXT NULL,
    file_path VARCHAR(512) NULL,
    is_read ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_messages_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_messages_insert
    AFTER INSERT ON messages
    FOR EACH ROW
BEGIN
    INSERT INTO messages_recovery (id, conversation_id, sender_id, body, file_path, is_read, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.conversation_id, NEW.sender_id, NEW.body, NEW.file_path, NEW.is_read, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        conversation_id = NEW.conversation_id,
        sender_id = NEW.sender_id,
        body = NEW.body,
        file_path = NEW.file_path,
        is_read = NEW.is_read,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_messages_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_messages_update
    AFTER UPDATE ON messages
    FOR EACH ROW
BEGIN
    UPDATE messages_recovery 
    SET conversation_id = NEW.conversation_id,
        sender_id = NEW.sender_id,
        body = NEW.body,
        file_path = NEW.file_path,
        is_read = NEW.is_read,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_messages_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_messages_delete
    AFTER DELETE ON messages
    FOR EACH ROW
BEGIN
    DELETE FROM messages_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires conversations, conversation_participants, and users to exist first
INSERT INTO messages (conversation_id, sender_id, body, is_read)
SELECT 
    c.id,
    u.id,
    'Hello! I wanted to discuss the project requirements.',
    'FALSE'
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id
JOIN users u ON u.id = cp.user_id
WHERE u.role = 'client'
LIMIT 1
ON DUPLICATE KEY UPDATE body = VALUES(body);

INSERT INTO messages (conversation_id, sender_id, body, is_read)
SELECT 
    c.id,
    u.id,
    'Thanks for reaching out! I would be happy to help with your project.',
    'FALSE'
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id
JOIN users u ON u.id = cp.user_id
WHERE u.role = 'freelancer'
LIMIT 1
ON DUPLICATE KEY UPDATE body = VALUES(body);

