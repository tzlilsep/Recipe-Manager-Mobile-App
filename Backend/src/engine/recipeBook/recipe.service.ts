// Backend/src/engine/recipeBook/recipe.service.ts

import { db } from '../../db/db';
import {
  Recipe,
  RecipeDetail,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeIngredientRow,
  RecipeStep,
  RecipeLabel
} from './recipe.types';

export class RecipeService {
  // Get all available recipe tags from the database enum
  async getAvailableTags(): Promise<string[]> {
    const result = await db.query<{ enumlabel: string }>(
      `
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = 'recipe_label'::regtype
      ORDER BY enumsortorder
      `
    );
    return result.rows.map(row => row.enumlabel);
  }
  // Get all recipes for a user (owned or saved)
  async getUserRecipes(userId: string): Promise<RecipeDetail[]> {
    const result = await db.query<any>(
      `
      SELECT DISTINCT
        r.id,
        r.owner_user_id,
        r.name,
        r.prep_minutes,
        r.total_minutes,
        r.servings,
        r.image_url,
        r.tips,
        r.created_at,
        r.updated_at,
        EXISTS(SELECT 1 FROM recipe_saves rs WHERE rs.recipe_id = r.id AND rs.user_id = $1) as is_saved
      FROM recipes r
      LEFT JOIN recipe_saves rs ON rs.recipe_id = r.id
      WHERE r.owner_user_id = $1 OR rs.user_id = $1
      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    const recipes: RecipeDetail[] = [];
    
    for (const row of result.rows) {
      const recipe = this.mapRowToRecipe(row);
      
      // Fetch labels
      const labels = await this.getRecipeLabels(recipe.id);
      
      // Fetch ingredient rows
      const ingredientRows = await this.getRecipeIngredientRows(recipe.id);
      
      // Fetch steps
      const steps = await this.getRecipeSteps(recipe.id);
      
      recipes.push({
        ...recipe,
        labels,
        ingredientRows,
        steps,
        isSaved: row.is_saved
      });
    }
    
    return recipes;
  }

  // Get a single recipe by ID
  async getRecipeById(recipeId: string, userId: string): Promise<RecipeDetail | null> {
    const result = await db.query<any>(
      `
      SELECT
        r.id,
        r.owner_user_id,
        r.name,
        r.prep_minutes,
        r.total_minutes,
        r.servings,
        r.image_url,
        r.tips,
        r.created_at,
        r.updated_at,
        EXISTS(SELECT 1 FROM recipe_saves rs WHERE rs.recipe_id = r.id AND rs.user_id = $2) as is_saved
      FROM recipes r
      WHERE r.id = $1
      `,
      [recipeId, userId]
    );

    if (!result.rows.length) return null;

    const recipe = this.mapRowToRecipe(result.rows[0]);
    const labels = await this.getRecipeLabels(recipe.id);
    const ingredientRows = await this.getRecipeIngredientRows(recipe.id);
    const steps = await this.getRecipeSteps(recipe.id);

    return {
      ...recipe,
      labels,
      ingredientRows,
      steps,
      isSaved: result.rows[0].is_saved
    };
  }

  // Create a new recipe
  async createRecipe(userId: string, input: CreateRecipeInput): Promise<RecipeDetail> {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Insert recipe
      const recipeResult = await client.query<any>(
        `
        INSERT INTO recipes (owner_user_id, name, prep_minutes, total_minutes, servings, image_url, tips)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, owner_user_id, name, prep_minutes, total_minutes, servings, image_url, tips, created_at, updated_at
        `,
        [userId, input.name, input.prepMinutes, input.totalMinutes, input.servings, input.imageUrl, input.tips]
      );

      const recipe = this.mapRowToRecipe(recipeResult.rows[0]);

      // Insert labels
      if (input.labels?.length) {
        for (const label of input.labels) {
          await client.query(
            'INSERT INTO recipe_labels (recipe_id, label) VALUES ($1, $2)',
            [recipe.id, label]
          );
        }
      }

      // Insert ingredient rows
      if (input.ingredientRows?.length) {
        for (const row of input.ingredientRows) {
          await client.query(
            `
            INSERT INTO recipe_ingredient_rows (recipe_id, position, row_type, title, name, quantity, unit, group_title)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [recipe.id, row.position, row.rowType, row.title, row.name, row.quantity, row.unit, row.groupTitle]
          );
        }
      }

      // Insert steps
      if (input.steps?.length) {
        for (const step of input.steps) {
          await client.query(
            `
            INSERT INTO recipe_steps (recipe_id, position, step_type, text_content, image_url)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [recipe.id, step.position, step.stepType, step.textContent, step.imageUrl]
          );
        }
      }

      await client.query('COMMIT');

      // Return full recipe detail
      const labels = await this.getRecipeLabels(recipe.id);
      const ingredientRows = await this.getRecipeIngredientRows(recipe.id);
      const steps = await this.getRecipeSteps(recipe.id);

      return {
        ...recipe,
        labels,
        ingredientRows,
        steps,
        isSaved: false
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Update an existing recipe
  async updateRecipe(recipeId: string, userId: string, input: UpdateRecipeInput): Promise<RecipeDetail | null> {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Check ownership
      const ownerCheck = await client.query<any>(
        'SELECT owner_user_id FROM recipes WHERE id = $1',
        [recipeId]
      );

      if (!ownerCheck.rows.length || ownerCheck.rows[0].owner_user_id !== userId) {
        await client.query('ROLLBACK');
        return null;
      }

      // Update recipe fields
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(input.name);
      }
      if (input.prepMinutes !== undefined) {
        updateFields.push(`prep_minutes = $${paramIndex++}`);
        updateValues.push(input.prepMinutes);
      }
      if (input.totalMinutes !== undefined) {
        updateFields.push(`total_minutes = $${paramIndex++}`);
        updateValues.push(input.totalMinutes);
      }
      if (input.servings !== undefined) {
        updateFields.push(`servings = $${paramIndex++}`);
        updateValues.push(input.servings);
      }
      if (input.imageUrl !== undefined) {
        updateFields.push(`image_url = $${paramIndex++}`);
        updateValues.push(input.imageUrl);
      }
      if (input.tips !== undefined) {
        updateFields.push(`tips = $${paramIndex++}`);
        updateValues.push(input.tips);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = now()`);
        updateValues.push(recipeId);
        
        await client.query(
          `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
          updateValues
        );
      }

      // Update labels if provided
      if (input.labels !== undefined) {
        await client.query('DELETE FROM recipe_labels WHERE recipe_id = $1', [recipeId]);
        
        for (const label of input.labels) {
          await client.query(
            'INSERT INTO recipe_labels (recipe_id, label) VALUES ($1, $2)',
            [recipeId, label]
          );
        }
      }

      // Update ingredient rows if provided
      if (input.ingredientRows !== undefined) {
        await client.query('DELETE FROM recipe_ingredient_rows WHERE recipe_id = $1', [recipeId]);
        
        for (const row of input.ingredientRows) {
          await client.query(
            `
            INSERT INTO recipe_ingredient_rows (recipe_id, position, row_type, title, name, quantity, unit, group_title)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [recipeId, row.position, row.rowType, row.title, row.name, row.quantity, row.unit, row.groupTitle]
          );
        }
      }

      // Update steps if provided
      if (input.steps !== undefined) {
        await client.query('DELETE FROM recipe_steps WHERE recipe_id = $1', [recipeId]);
        
        for (const step of input.steps) {
          await client.query(
            `
            INSERT INTO recipe_steps (recipe_id, position, step_type, text_content, image_url)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [recipeId, step.position, step.stepType, step.textContent, step.imageUrl]
          );
        }
      }

      await client.query('COMMIT');

      // Return updated recipe
      return this.getRecipeById(recipeId, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Delete a recipe
  async deleteRecipe(recipeId: string, userId: string): Promise<boolean> {
    const result = await db.query<any>(
      'DELETE FROM recipes WHERE id = $1 AND owner_user_id = $2 RETURNING id',
      [recipeId, userId]
    );

    return result.rows.length > 0;
  }

  // Save (favorite) a recipe
  async saveRecipe(recipeId: string, userId: string): Promise<boolean> {
    try {
      await db.query(
        'INSERT INTO recipe_saves (recipe_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [recipeId, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  // Unsave (unfavorite) a recipe
  async unsaveRecipe(recipeId: string, userId: string): Promise<boolean> {
    const result = await db.query<any>(
      'DELETE FROM recipe_saves WHERE recipe_id = $1 AND user_id = $2 RETURNING recipe_id',
      [recipeId, userId]
    );

    return result.rows.length > 0;
  }

  // Helper: Get labels for a recipe
  private async getRecipeLabels(recipeId: string): Promise<RecipeLabel[]> {
    const result = await db.query<any>(
      'SELECT label FROM recipe_labels WHERE recipe_id = $1',
      [recipeId]
    );

    return result.rows.map(r => r.label);
  }

  // Helper: Get ingredient rows for a recipe
  private async getRecipeIngredientRows(recipeId: string): Promise<RecipeIngredientRow[]> {
    const result = await db.query<any>(
      `
      SELECT id, recipe_id, position, row_type, title, name, quantity, unit, group_title
      FROM recipe_ingredient_rows
      WHERE recipe_id = $1
      ORDER BY position
      `,
      [recipeId]
    );

    return result.rows.map(r => ({
      id: r.id,
      recipeId: r.recipe_id,
      position: r.position,
      rowType: r.row_type,
      title: r.title,
      name: r.name,
      quantity: r.quantity ? parseFloat(r.quantity) : undefined,
      unit: r.unit,
      groupTitle: r.group_title
    }));
  }

  // Helper: Get steps for a recipe
  private async getRecipeSteps(recipeId: string): Promise<RecipeStep[]> {
    const result = await db.query<any>(
      `
      SELECT id, recipe_id, position, step_type, text_content, image_url
      FROM recipe_steps
      WHERE recipe_id = $1
      ORDER BY position
      `,
      [recipeId]
    );

    return result.rows.map(r => ({
      id: r.id,
      recipeId: r.recipe_id,
      position: r.position,
      stepType: r.step_type,
      textContent: r.text_content,
      imageUrl: r.image_url
    }));
  }

  // Helper: Map DB row to Recipe object
  private mapRowToRecipe(row: any): Recipe {
    return {
      id: row.id,
      ownerUserId: row.owner_user_id,
      name: row.name,
      prepMinutes: row.prep_minutes,
      totalMinutes: row.total_minutes,
      servings: row.servings,
      imageUrl: row.image_url,
      tips: row.tips,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
