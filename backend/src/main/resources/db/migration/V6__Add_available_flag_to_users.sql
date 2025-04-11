-- Flyway migration script V6: Add 'available' column for delivery agents

ALTER TABLE users
ADD COLUMN available BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Add an index if querying available agents frequently
CREATE INDEX idx_users_available ON users(available);

-- Optional: If you want to mark existing users with DELIVERY_AGENT role as available by default:
-- UPDATE users SET available = TRUE WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'ROLE_DELIVERY_AGENT');
-- Note: Check your actual table/column names ('user_roles', 'user_id', 'role') if using this update.