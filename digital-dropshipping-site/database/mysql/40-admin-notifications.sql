-- Admin Notifications Table
-- Stores moderation alerts, system notifications, and other admin alerts

CREATE TABLE IF NOT EXISTS admin_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL COMMENT 'Notification type: moderation_blocked_message, system_alert, etc.',
  title VARCHAR(255) NOT NULL COMMENT 'Short title for the notification',
  message TEXT NOT NULL COMMENT 'Detailed message/description',
  metadata JSON COMMENT 'Additional structured data (user info, project info, etc.)',
  user_id INT UNSIGNED COMMENT 'Related user ID (if applicable)',
  project_id INT UNSIGNED COMMENT 'Related project ID (if applicable)',
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT 'Severity level',
  is_read BOOLEAN DEFAULT FALSE COMMENT 'Whether admin has read this notification',
  read_at DATETIME NULL COMMENT 'When the notification was read',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_user_id (user_id),
  INDEX idx_project_id (project_id),
  INDEX idx_severity (severity),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

