-- ============================================================================
-- MESSAGES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED NULL,                                        -- Denormalized: allows direct project queries
    sender_id INT UNSIGNED NOT NULL,
    reply_to_message_id BIGINT UNSIGNED NULL,                            -- For message threading
    body TEXT NULL,
    message_type ENUM('text', 'system', 'file', 'milestone', 'deliverable') DEFAULT 'text',
    file_path VARCHAR(512) NULL,                                         -- Optional attachment path
    file_name VARCHAR(255) NULL,                                         -- Original file name
    file_size INT UNSIGNED NULL,                                         -- File size in bytes
    file_type VARCHAR(100) NULL,                                         -- MIME type
    is_read ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    edited_at DATETIME NULL,                                             -- When message was last edited
    deleted_at DATETIME NULL,                                            -- Soft delete timestamp
    metadata JSON NULL,                                                  -- Extensible metadata (reactions, mentions, etc.)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_reply_to FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL,

    INDEX idx_messages_conversation (conversation_id, created_at DESC),
    INDEX idx_messages_project (project_id, created_at DESC),            -- Direct project queries
    INDEX idx_messages_sender (sender_id, created_at DESC),
    INDEX idx_messages_is_read (is_read, conversation_id),
    INDEX idx_messages_type (message_type),
    INDEX idx_messages_deleted (deleted_at),
    INDEX idx_messages_reply_to (reply_to_message_id),
    INDEX idx_messages_project_unread (project_id, is_read, created_at DESC)  -- Composite for unread by project
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS messages_recovery (
    id BIGINT UNSIGNED PRIMARY KEY,
    conversation_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED NULL,
    sender_id INT UNSIGNED NOT NULL,
    reply_to_message_id BIGINT UNSIGNED NULL,
    body TEXT NULL,
    message_type ENUM('text', 'system', 'file', 'milestone', 'deliverable') DEFAULT 'text',
    file_path VARCHAR(512) NULL,
    file_name VARCHAR(255) NULL,
    file_size INT UNSIGNED NULL,
    file_type VARCHAR(100) NULL,
    is_read ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    edited_at DATETIME NULL,
    deleted_at DATETIME NULL,
    metadata JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Trigger to auto-populate project_id from conversation when message is inserted
-- This keeps project_id in sync automatically
DROP TRIGGER IF EXISTS trigger_messages_set_project_id;

DELIMITER $$

CREATE TRIGGER trigger_messages_set_project_id
    BEFORE INSERT ON messages
    FOR EACH ROW
BEGIN
    -- If project_id is not set, get it from the conversation
    IF NEW.project_id IS NULL THEN
        SELECT project_id INTO NEW.project_id
        FROM conversations
        WHERE id = NEW.conversation_id
        LIMIT 1;
    END IF;
END$$

DELIMITER ;

-- Trigger to update conversation's updated_at when message is created
DROP TRIGGER IF EXISTS trigger_messages_update_conversation;

DELIMITER $$

CREATE TRIGGER trigger_messages_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
END$$

DELIMITER ;

-- Triggers for recovery sync
DROP TRIGGER IF EXISTS trigger_auto_sync_messages_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_messages_insert
    AFTER INSERT ON messages
    FOR EACH ROW
BEGIN
    INSERT INTO messages_recovery (
        id, conversation_id, project_id, sender_id, reply_to_message_id,
        body, message_type, file_path, file_name, file_size, file_type,
        is_read, edited_at, deleted_at, metadata,
        created_at, updated_at, recovery_imported_at
    )
    VALUES (
        NEW.id, NEW.conversation_id, NEW.project_id, NEW.sender_id, NEW.reply_to_message_id,
        NEW.body, NEW.message_type, NEW.file_path, NEW.file_name, NEW.file_size, NEW.file_type,
        NEW.is_read, NEW.edited_at, NEW.deleted_at, NEW.metadata,
        NEW.created_at, NEW.updated_at, NOW()
    )
    ON DUPLICATE KEY UPDATE
        conversation_id = NEW.conversation_id,
        project_id = NEW.project_id,
        sender_id = NEW.sender_id,
        reply_to_message_id = NEW.reply_to_message_id,
        body = NEW.body,
        message_type = NEW.message_type,
        file_path = NEW.file_path,
        file_name = NEW.file_name,
        file_size = NEW.file_size,
        file_type = NEW.file_type,
        is_read = NEW.is_read,
        edited_at = NEW.edited_at,
        deleted_at = NEW.deleted_at,
        metadata = NEW.metadata,
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
        project_id = NEW.project_id,
        sender_id = NEW.sender_id,
        reply_to_message_id = NEW.reply_to_message_id,
        body = NEW.body,
        message_type = NEW.message_type,
        file_path = NEW.file_path,
        file_name = NEW.file_name,
        file_size = NEW.file_size,
        file_type = NEW.file_type,
        is_read = NEW.is_read,
        edited_at = NEW.edited_at,
        deleted_at = NEW.deleted_at,
        metadata = NEW.metadata,
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

-- ============================================================================
-- MIGRATION: Add new columns to existing messages table
-- ============================================================================
-- Run these ALTER statements if the table already exists:

-- ALTER TABLE messages
--   ADD COLUMN project_id INT UNSIGNED NULL AFTER conversation_id,
--   ADD COLUMN reply_to_message_id BIGINT UNSIGNED NULL AFTER sender_id,
--   ADD COLUMN message_type ENUM('text', 'system', 'file', 'milestone', 'deliverable') DEFAULT 'text' AFTER body,
--   ADD COLUMN file_name VARCHAR(255) NULL AFTER file_path,
--   ADD COLUMN file_size INT UNSIGNED NULL AFTER file_name,
--   ADD COLUMN file_type VARCHAR(100) NULL AFTER file_size,
--   ADD COLUMN edited_at DATETIME NULL,
--   ADD COLUMN deleted_at DATETIME NULL,
--   ADD COLUMN metadata JSON NULL;

-- -- Add foreign keys
-- ALTER TABLE messages
--   ADD CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
--   ADD CONSTRAINT fk_messages_reply_to FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- -- Populate project_id from conversations
-- UPDATE messages m
-- JOIN conversations c ON c.id = m.conversation_id
-- SET m.project_id = c.project_id
-- WHERE m.project_id IS NULL;

-- -- Add indexes
-- ALTER TABLE messages
--   ADD INDEX idx_messages_project (project_id, created_at DESC),
--   ADD INDEX idx_messages_type (message_type),
--   ADD INDEX idx_messages_deleted (deleted_at),
--   ADD INDEX idx_messages_reply_to (reply_to_message_id),
--   ADD INDEX idx_messages_project_unread (project_id, is_read, created_at DESC);

-- -- Update recovery table structure
-- ALTER TABLE messages_recovery
--   ADD COLUMN project_id INT UNSIGNED NULL AFTER conversation_id,
--   ADD COLUMN reply_to_message_id BIGINT UNSIGNED NULL AFTER sender_id,
--   ADD COLUMN message_type ENUM('text', 'system', 'file', 'milestone', 'deliverable') DEFAULT 'text' AFTER body,
--   ADD COLUMN file_name VARCHAR(255) NULL AFTER file_path,
--   ADD COLUMN file_size INT UNSIGNED NULL AFTER file_name,
--   ADD COLUMN file_type VARCHAR(100) NULL AFTER file_size,
--   ADD COLUMN edited_at DATETIME NULL,
--   ADD COLUMN deleted_at DATETIME NULL,
--   ADD COLUMN metadata JSON NULL;

