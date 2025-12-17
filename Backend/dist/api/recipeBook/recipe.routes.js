"use strict";
// Backend/src/api/recipeBook/recipe.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipeRouter = createRecipeRouter;
const express_1 = require("express");
const recipe_controller_1 = require("./recipe.controller");
const recipe_service_1 = require("../../engine/recipeBook/recipe.service");
const requireAuth_1 = require("../../aws/cognito/requestToken/requireAuth");
const recipe_validators_1 = require("./recipe.validators");
function createRecipeRouter() {
    const router = (0, express_1.Router)();
    const recipeService = new recipe_service_1.RecipeService();
    const recipeController = new recipe_controller_1.RecipeController(recipeService);
    // All routes require authentication
    router.use(requireAuth_1.requireAuth);
    // GET /api/recipes - Get all recipes for the authenticated user
    router.get('/', recipeController.getUserRecipes);
    // GET /api/recipes/:recipeId - Get a single recipe by ID
    router.get('/:recipeId', recipe_validators_1.validateRecipeId, recipeController.getRecipeById);
    // POST /api/recipes - Create a new recipe
    router.post('/', recipe_validators_1.validateCreateRecipe, recipeController.createRecipe);
    // PUT /api/recipes/:recipeId - Update a recipe
    router.put('/:recipeId', recipe_validators_1.validateRecipeId, recipe_validators_1.validateUpdateRecipe, recipeController.updateRecipe);
    // DELETE /api/recipes/:recipeId - Delete a recipe
    router.delete('/:recipeId', recipe_validators_1.validateRecipeId, recipeController.deleteRecipe);
    // POST /api/recipes/:recipeId/save - Save (favorite) a recipe
    router.post('/:recipeId/save', recipe_validators_1.validateRecipeId, recipeController.saveRecipe);
    // DELETE /api/recipes/:recipeId/save - Unsave (unfavorite) a recipe
    router.delete('/:recipeId/save', recipe_validators_1.validateRecipeId, recipeController.unsaveRecipe);
    return router;
}
