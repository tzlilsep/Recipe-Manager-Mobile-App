-- 001_init.sql
-- Recipe Manager schema (PostgreSQL)
-- Notes:
-- - Users are authenticated via Cognito; the Cognito user id ("sub") is stored as TEXT.
-- - UUIDs are used for internal entities.
-- - Ordering is handled via "position" columns.
-- - Sharing is implemented via join tables.

BEGIN;

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- ENUMS ----------

-- Units for recipe ingredients
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ingredient_unit') THEN
    CREATE TYPE ingredient_unit AS ENUM (
      'יחידה',
      'גרם',
      'קילו',
      'כוס',
      'כף',
      'כפית',
      'ליטר',
      'מ״ל',
      'שיניים',
      'חבילה',
      'לפי הטעם',
      'ללא'
    );
  END IF;
END$$;

-- Recipe labels / tags
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_label') THEN
    CREATE TYPE recipe_label AS ENUM (
      'קינוח',
      'עוף',
      'בשר',
      'דגים',
      'טבעוני',
      'צמחוני',
      'מרק',
      'מאפה',
      'אפייה',
      'סלט',
      'מנה ראשונה',
      'מנה עיקרית',
      'תוספת',
      'חגיגי'
    );
  END IF;
END$$;

-- Recipe step type (text or image)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_step_type') THEN
    CREATE TYPE recipe_step_type AS ENUM ('text', 'image');
  END IF;
END$$;

-- Ingredient row type (group title or ingredient)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_ingredient_row_type') THEN
    CREATE TYPE recipe_ingredient_row_type AS ENUM ('כותרת', 'מצרך');
  END IF;
END$$;

-- ---------- USERS ----------

CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,  -- Cognito user identifier
  username  TEXT NOT NULL
);

-- ---------- SHOPPING LISTS ----------

CREATE TABLE IF NOT EXISTS shopping_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  position      INT  NOT NULL DEFAULT 0,   -- Ordering for the owner
  is_shared     BOOLEAN NOT NULL DEFAULT FALSE
);

-- Users a list is shared with (immediate share)
CREATE TABLE IF NOT EXISTS shopping_list_shares (
  list_id             UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position            INT  NOT NULL DEFAULT 0,  -- Ordering for the shared user
  PRIMARY KEY (list_id, shared_with_user_id)
);

-- Items in a shopping list
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT  NOT NULL DEFAULT 0,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_owner_position
  ON shopping_lists (owner_user_id, position);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_position
  ON shopping_list_items (list_id, position);

-- ---------- RECIPES ----------

CREATE TABLE IF NOT EXISTS recipes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  prep_minutes  INT,
  total_minutes INT,
  servings      INT,
  image_url     TEXT,
  tips          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users saving recipes (favorites)
CREATE TABLE IF NOT EXISTS recipe_saves (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_saves_recipe
  ON recipe_saves (recipe_id);

-- Recipe labels
CREATE TABLE IF NOT EXISTS recipe_labels (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  label     recipe_label NOT NULL,
  PRIMARY KEY (recipe_id, label)
);

-- Ingredient rows (single ordered list: group titles + ingredients)
CREATE TABLE IF NOT EXISTS recipe_ingredient_rows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position    INT  NOT NULL,
  row_type    recipe_ingredient_row_type NOT NULL,

  -- For group title rows
  title       TEXT,

  -- For ingredient rows
  name        TEXT,
  quantity    NUMERIC,
  unit        ingredient_unit,
  group_title TEXT,

  CHECK (
    (row_type = 'כותרת'
      AND title IS NOT NULL
      AND name IS NULL
      AND quantity IS NULL
      AND unit IS NULL
      AND group_title IS NULL)
    OR
    (row_type = 'מצרך'
      AND name IS NOT NULL
      AND title IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_recipe_ingredient_rows_recipe_position
  ON recipe_ingredient_rows (recipe_id, position);

-- Recipe steps (text or image)
CREATE TABLE IF NOT EXISTS recipe_steps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id    UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position     INT NOT NULL DEFAULT 0,
  step_type    recipe_step_type NOT NULL,
  text_content TEXT,
  image_url    TEXT,
  CHECK (
    (step_type = 'text'  AND text_content IS NOT NULL AND image_url IS NULL)
    OR
    (step_type = 'image' AND image_url IS NOT NULL AND text_content IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_position
  ON recipe_steps (recipe_id, position);

COMMIT;
