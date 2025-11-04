-- ============================================================================
-- CONVERSATION_PARTICIPANTS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME NULL,                                     -- When user last read messages
    PRIMARY KEY (conversation_id, user_id),

    CONSTRAINT fk_conv_participants_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_conv_participants_user (user_id),
    INDEX idx_conv_participants_conversation (conversation_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS conversation_participants_recovery (
    conversation_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME NULL,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_conv_participants_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conv_participants_insert
    AFTER INSERT ON conversation_participants
    FOR EACH ROW
BEGIN
    INSERT INTO conversation_participants_recovery (conversation_id, user_id, joined_at, last_read_at, recovery_imported_at)
    VALUES (NEW.conversation_id, NEW.user_id, NEW.joined_at, NEW.last_read_at, NOW())
    ON DUPLICATE KEY UPDATE
        joined_at = NEW.joined_at,
        last_read_at = NEW.last_read_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_conv_participants_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conv_participants_update
    AFTER UPDATE ON conversation_participants
    FOR EACH ROW
BEGIN
    UPDATE conversation_participants_recovery 
    SET joined_at = NEW.joined_at,
        last_read_at = NEW.last_read_at,
        recovery_imported_at = NOW()
    WHERE conversation_id = NEW.conversation_id AND user_id = NEW.user_id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_conv_participants_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conv_participants_delete
    AFTER DELETE ON conversation_participants
    FOR EACH ROW
BEGIN
    DELETE FROM conversation_participants_recovery 
    WHERE conversation_id = OLD.conversation_id AND user_id = OLD.user_id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires conversations and users to exist first
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT 
    c.id,
    u.id,
    NOW()
FROM conversations c
CROSS JOIN users u
WHERE u.role IN ('client', 'freelancer')
LIMIT 2
ON DUPLICATE KEY UPDATE joined_at = VALUES(joined_at);

