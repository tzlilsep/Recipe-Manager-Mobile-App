// Backend/src/api/recipeBook/recipe.routes.ts

import { Router } from 'express';
import { RecipeController } from './recipe.controller';
import { RecipeService } from '../../engine/recipeBook/recipe.service';
import { requireAuth } from '../../aws/cognito/requestToken/requireAuth';
import {
  validateCreateRecipe,
  validateUpdateRecipe,
  validateRecipeId
} from './recipe.validators';

export function createRecipeRouter(): Router {
  const router = Router();
  const recipeService = new RecipeService();
  const recipeController = new RecipeController(recipeService);

  // All routes require authentication
  router.use(requireAuth);

  // GET /api/recipes/tags - Get all available recipe tags
  router.get('/tags', recipeController.getTags);

  // GET /api/recipes - Get all recipes for the authenticated user
  router.get('/', recipeController.getUserRecipes);

  // GET /api/recipes/:recipeId - Get a single recipe by ID
  router.get('/:recipeId', validateRecipeId, recipeController.getRecipeById);

  // POST /api/recipes - Create a new recipe
  router.post('/', validateCreateRecipe, recipeController.createRecipe);

  // PUT /api/recipes/:recipeId - Update a recipe
  router.put('/:recipeId', validateRecipeId, validateUpdateRecipe, recipeController.updateRecipe);

  // DELETE /api/recipes/:recipeId - Delete a recipe
  router.delete('/:recipeId', validateRecipeId, recipeController.deleteRecipe);

  // POST /api/recipes/:recipeId/save - Save (favorite) a recipe
  router.post('/:recipeId/save', validateRecipeId, recipeController.saveRecipe);

  // DELETE /api/recipes/:recipeId/save - Unsave (unfavorite) a recipe
  router.delete('/:recipeId/save', validateRecipeId, recipeController.unsaveRecipe);

  return router;
}
