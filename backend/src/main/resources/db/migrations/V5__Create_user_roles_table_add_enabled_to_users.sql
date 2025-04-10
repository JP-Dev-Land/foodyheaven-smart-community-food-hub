-- Flyway migration script V5: Add user roles and enabled status

-- Add the 'enabled' column to the users table
ALTER TABLE users
    ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Create the user_roles join table
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role VARCHAR(50) NOT NULL, -- Matches Enum name length

    -- Define composite primary key
                            CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),

    -- Foreign key constraint to users table
                            CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Delete role assignments if user is deleted
);

-- Optional: Index on user_id for faster role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Note: If you already had a roles column directly in the users table,
-- you would need migration steps here to move that data into the new user_roles table
-- before dropping the old column. This script assumes roles were not stored before V5.