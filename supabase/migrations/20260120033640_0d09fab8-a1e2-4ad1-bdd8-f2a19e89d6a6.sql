-- Recreate pg_net / pg_cron in a dedicated schema to satisfy linter
CREATE SCHEMA IF NOT EXISTS extensions;

-- pg_net doesn't support ALTER EXTENSION ... SET SCHEMA, so we recreate it
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- pg_cron: recreate in extensions schema as well (no jobs created yet)
DROP EXTENSION IF EXISTS pg_cron CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
