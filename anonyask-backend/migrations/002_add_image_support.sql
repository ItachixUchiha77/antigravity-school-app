-- Add image message support to private and group chat

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages
  ALTER COLUMN type TYPE VARCHAR(10);
ALTER TABLE messages
  ADD CONSTRAINT messages_type_check CHECK (type IN ('text', 'voice', 'image'));
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE group_messages
  DROP CONSTRAINT IF EXISTS group_messages_type_check;
ALTER TABLE group_messages
  ALTER COLUMN type TYPE VARCHAR(10);
ALTER TABLE group_messages
  ADD CONSTRAINT group_messages_type_check CHECK (type IN ('text', 'voice', 'image'));
ALTER TABLE group_messages
  ADD COLUMN IF NOT EXISTS image_url TEXT;
