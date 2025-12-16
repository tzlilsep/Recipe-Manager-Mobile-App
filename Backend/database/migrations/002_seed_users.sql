-- 002_seed_users.sql
-- Seed initial users

BEGIN;

INSERT INTO users (id, username)
VALUES
  ('b384d812-c0e1-70b3-fdb8-7722db2e394b', 'ts'),
  ('b3e488a2-c031-708b-544b-a544e8681338', 'לידור')
ON CONFLICT (id) DO NOTHING;

COMMIT;
