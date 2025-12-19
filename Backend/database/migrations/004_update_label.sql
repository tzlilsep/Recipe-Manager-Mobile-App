
-- Add new label 'עוגה'
ALTER TYPE recipe_label ADD VALUE 'עוגה';

-- Remove all 'חגיגי' labels from recipes
DELETE FROM recipe_labels WHERE label = 'חגיגי';

-- Note: Cannot remove 'חגיגי' from enum type itself, but no recipes will use it anymore