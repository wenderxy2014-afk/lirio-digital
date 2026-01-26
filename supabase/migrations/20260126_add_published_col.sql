-- Add is_published column to ebd_devotionals table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ebd_devotionals' AND column_name = 'is_published') THEN
        ALTER TABLE ebd_devotionals ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END
$$;
