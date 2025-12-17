// Backend/src/api/recipeBook/recipe.validators.ts

import { Request, Response, NextFunction } from 'express';
import { CreateRecipeRequest, UpdateRecipeRequest } from './recipe.types';

const INGREDIENT_UNITS = [
  'יחידה', 'גרם', 'קילו', 'כוס', 'כף', 'כפית',
  'ליטר', 'מ״ל', 'שיניים', 'חבילה', 'לפי הטעם', 'ללא'
];

const RECIPE_LABELS = [
  'קינוח', 'עוף', 'בשר', 'דגים', 'טבעוני', 'צמחוני',
  'מרק', 'מאפה', 'אפייה', 'סלט', 'מנה ראשונה',
  'מנה עיקרית', 'תוספת', 'חגיגי'
];

const STEP_TYPES = ['text', 'image'];
const ROW_TYPES = ['כותרת', 'מצרך'];

// Validate create recipe request
export function validateCreateRecipe(req: Request, res: Response, next: NextFunction) {
  const body = req.body as CreateRecipeRequest;

  // Validate required fields
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return res.status(400).json({ ok: false, error: 'INVALID_NAME' });
  }

  // Validate optional numeric fields
  if (body.prepMinutes !== undefined && (!Number.isInteger(body.prepMinutes) || body.prepMinutes < 0)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PREP_MINUTES' });
  }

  if (body.totalMinutes !== undefined && (!Number.isInteger(body.totalMinutes) || body.totalMinutes < 0)) {
    return res.status(400).json({ ok: false, error: 'INVALID_TOTAL_MINUTES' });
  }

  if (body.servings !== undefined && (!Number.isInteger(body.servings) || body.servings < 1)) {
    return res.status(400).json({ ok: false, error: 'INVALID_SERVINGS' });
  }

  // Validate labels
  if (body.labels !== undefined) {
    if (!Array.isArray(body.labels)) {
      return res.status(400).json({ ok: false, error: 'INVALID_LABELS' });
    }
    
    for (const label of body.labels) {
      if (!RECIPE_LABELS.includes(label)) {
        return res.status(400).json({ ok: false, error: 'INVALID_LABEL_VALUE' });
      }
    }
  }

  // Validate ingredient rows
  if (body.ingredientRows !== undefined) {
    if (!Array.isArray(body.ingredientRows)) {
      return res.status(400).json({ ok: false, error: 'INVALID_INGREDIENT_ROWS' });
    }

    for (const row of body.ingredientRows) {
      if (!Number.isInteger(row.position) || row.position < 0) {
        return res.status(400).json({ ok: false, error: 'INVALID_ROW_POSITION' });
      }

      if (!ROW_TYPES.includes(row.rowType)) {
        return res.status(400).json({ ok: false, error: 'INVALID_ROW_TYPE' });
      }

      // Validate group title rows
      if (row.rowType === 'כותרת') {
        if (!row.title || typeof row.title !== 'string' || !row.title.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_GROUP_TITLE' });
        }
        if (row.name || row.quantity !== undefined || row.unit || row.groupTitle) {
          return res.status(400).json({ ok: false, error: 'INVALID_GROUP_TITLE_FIELDS' });
        }
      }

      // Validate ingredient rows
      if (row.rowType === 'מצרך') {
        if (!row.name || typeof row.name !== 'string' || !row.name.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_INGREDIENT_NAME' });
        }
        if (row.title) {
          return res.status(400).json({ ok: false, error: 'INVALID_INGREDIENT_FIELDS' });
        }
        if (row.unit && !INGREDIENT_UNITS.includes(row.unit)) {
          return res.status(400).json({ ok: false, error: 'INVALID_UNIT' });
        }
        if (row.quantity !== undefined && (typeof row.quantity !== 'number' || row.quantity < 0)) {
          return res.status(400).json({ ok: false, error: 'INVALID_QUANTITY' });
        }
      }
    }
  }

  // Validate steps
  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps)) {
      return res.status(400).json({ ok: false, error: 'INVALID_STEPS' });
    }

    for (const step of body.steps) {
      if (!Number.isInteger(step.position) || step.position < 0) {
        return res.status(400).json({ ok: false, error: 'INVALID_STEP_POSITION' });
      }

      if (!STEP_TYPES.includes(step.stepType)) {
        return res.status(400).json({ ok: false, error: 'INVALID_STEP_TYPE' });
      }

      // Validate text steps
      if (step.stepType === 'text') {
        if (!step.textContent || typeof step.textContent !== 'string' || !step.textContent.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_TEXT_CONTENT' });
        }
        if (step.imageUrl) {
          return res.status(400).json({ ok: false, error: 'INVALID_TEXT_STEP_FIELDS' });
        }
      }

      // Validate image steps
      if (step.stepType === 'image') {
        if (!step.imageUrl || typeof step.imageUrl !== 'string' || !step.imageUrl.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_IMAGE_URL' });
        }
        if (step.textContent) {
          return res.status(400).json({ ok: false, error: 'INVALID_IMAGE_STEP_FIELDS' });
        }
      }
    }
  }

  next();
}

// Validate update recipe request
export function validateUpdateRecipe(req: Request, res: Response, next: NextFunction) {
  const body = req.body as UpdateRecipeRequest;

  // At least one field should be provided
  const hasAnyField = Object.keys(body).length > 0;
  if (!hasAnyField) {
    return res.status(400).json({ ok: false, error: 'NO_FIELDS_TO_UPDATE' });
  }

  // Validate name if provided
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    return res.status(400).json({ ok: false, error: 'INVALID_NAME' });
  }

  // Validate optional numeric fields
  if (body.prepMinutes !== undefined && (!Number.isInteger(body.prepMinutes) || body.prepMinutes < 0)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PREP_MINUTES' });
  }

  if (body.totalMinutes !== undefined && (!Number.isInteger(body.totalMinutes) || body.totalMinutes < 0)) {
    return res.status(400).json({ ok: false, error: 'INVALID_TOTAL_MINUTES' });
  }

  if (body.servings !== undefined && (!Number.isInteger(body.servings) || body.servings < 1)) {
    return res.status(400).json({ ok: false, error: 'INVALID_SERVINGS' });
  }

  // Validate labels
  if (body.labels !== undefined) {
    if (!Array.isArray(body.labels)) {
      return res.status(400).json({ ok: false, error: 'INVALID_LABELS' });
    }
    
    for (const label of body.labels) {
      if (!RECIPE_LABELS.includes(label)) {
        return res.status(400).json({ ok: false, error: 'INVALID_LABEL_VALUE' });
      }
    }
  }

  // Validate ingredient rows (same as create)
  if (body.ingredientRows !== undefined) {
    if (!Array.isArray(body.ingredientRows)) {
      return res.status(400).json({ ok: false, error: 'INVALID_INGREDIENT_ROWS' });
    }

    for (const row of body.ingredientRows) {
      if (!Number.isInteger(row.position) || row.position < 0) {
        return res.status(400).json({ ok: false, error: 'INVALID_ROW_POSITION' });
      }

      if (!ROW_TYPES.includes(row.rowType)) {
        return res.status(400).json({ ok: false, error: 'INVALID_ROW_TYPE' });
      }

      if (row.rowType === 'כותרת') {
        if (!row.title || typeof row.title !== 'string' || !row.title.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_GROUP_TITLE' });
        }
        if (row.name || row.quantity !== undefined || row.unit || row.groupTitle) {
          return res.status(400).json({ ok: false, error: 'INVALID_GROUP_TITLE_FIELDS' });
        }
      }

      if (row.rowType === 'מצרך') {
        if (!row.name || typeof row.name !== 'string' || !row.name.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_INGREDIENT_NAME' });
        }
        if (row.title) {
          return res.status(400).json({ ok: false, error: 'INVALID_INGREDIENT_FIELDS' });
        }
        if (row.unit && !INGREDIENT_UNITS.includes(row.unit)) {
          return res.status(400).json({ ok: false, error: 'INVALID_UNIT' });
        }
        if (row.quantity !== undefined && (typeof row.quantity !== 'number' || row.quantity < 0)) {
          return res.status(400).json({ ok: false, error: 'INVALID_QUANTITY' });
        }
      }
    }
  }

  // Validate steps (same as create)
  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps)) {
      return res.status(400).json({ ok: false, error: 'INVALID_STEPS' });
    }

    for (const step of body.steps) {
      if (!Number.isInteger(step.position) || step.position < 0) {
        return res.status(400).json({ ok: false, error: 'INVALID_STEP_POSITION' });
      }

      if (!STEP_TYPES.includes(step.stepType)) {
        return res.status(400).json({ ok: false, error: 'INVALID_STEP_TYPE' });
      }

      if (step.stepType === 'text') {
        if (!step.textContent || typeof step.textContent !== 'string' || !step.textContent.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_TEXT_CONTENT' });
        }
        if (step.imageUrl) {
          return res.status(400).json({ ok: false, error: 'INVALID_TEXT_STEP_FIELDS' });
        }
      }

      if (step.stepType === 'image') {
        if (!step.imageUrl || typeof step.imageUrl !== 'string' || !step.imageUrl.trim()) {
          return res.status(400).json({ ok: false, error: 'MISSING_IMAGE_URL' });
        }
        if (step.textContent) {
          return res.status(400).json({ ok: false, error: 'INVALID_IMAGE_STEP_FIELDS' });
        }
      }
    }
  }

  next();
}

// Validate recipe ID parameter
export function validateRecipeId(req: Request, res: Response, next: NextFunction) {
  const { recipeId } = req.params;
  
  // UUID format validation (simple check)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!recipeId || !uuidPattern.test(recipeId)) {
    return res.status(400).json({ ok: false, error: 'INVALID_RECIPE_ID' });
  }

  next();
}
