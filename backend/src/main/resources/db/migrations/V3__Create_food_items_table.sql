-- Flyway migration script V3: Create food_items and related tables

-- Create the main food_items table
CREATE TABLE food_items (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            cook_id BIGINT NOT NULL,                -- Foreign key to the users table
                            name VARCHAR(100) NOT NULL,
                            description TEXT,
                            price DECIMAL(10, 2) NOT NULL,
                            image_url VARCHAR(2048),
                            available BOOLEAN NOT NULL DEFAULT TRUE,
    -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- If using timestamps
    -- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- If using timestamps

                            CONSTRAINT fk_food_item_cook FOREIGN KEY (cook_id) REFERENCES users(id) -- Assuming your users table is named 'users' and PK is 'id'
);

-- Create the table for storing tags (used by @ElementCollection)
CREATE TABLE food_item_tags (
                                food_item_id BIGINT NOT NULL,
                                tag VARCHAR(50), -- Adjust size as needed

                                CONSTRAINT fk_food_item_tags_item FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE, -- Delete tags if item is deleted
    -- Optional: Add a unique constraint if a tag shouldn't repeat for the same item
    -- CONSTRAINT uk_food_item_tag UNIQUE (food_item_id, tag)
);

-- Optional: Add indexes for performance
CREATE INDEX idx_food_item_cook_id ON food_items(cook_id);
CREATE INDEX idx_food_item_available ON food_items(available);