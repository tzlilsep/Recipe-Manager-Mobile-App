"use strict";
// Backend/src/api/recipeBook/recipe.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeController = void 0;
class RecipeController {
    constructor(recipeService) {
        this.recipeService = recipeService;
        // GET /api/recipes - Get all recipes for the authenticated user
        this.getUserRecipes = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const recipes = await this.recipeService.getUserRecipes(userId);
                const response = recipes.map(this.mapRecipeToResponse);
                res.json({ ok: true, recipes: response });
            }
            catch (err) {
                console.error('getUserRecipes error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // GET /api/recipes/:recipeId - Get a single recipe by ID
        this.getRecipeById = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { recipeId } = req.params;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const recipe = await this.recipeService.getRecipeById(recipeId, userId);
                if (!recipe) {
                    return res.status(404).json({ ok: false, error: 'RECIPE_NOT_FOUND' });
                }
                res.json({ ok: true, recipe: this.mapRecipeToResponse(recipe) });
            }
            catch (err) {
                console.error('getRecipeById error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // POST /api/recipes - Create a new recipe
        this.createRecipe = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const body = req.body;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const recipe = await this.recipeService.createRecipe(userId, body);
                res.status(201).json({ ok: true, recipe: this.mapRecipeToResponse(recipe) });
            }
            catch (err) {
                console.error('createRecipe error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // PUT /api/recipes/:recipeId - Update a recipe
        this.updateRecipe = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { recipeId } = req.params;
                const body = req.body;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const recipe = await this.recipeService.updateRecipe(recipeId, userId, body);
                if (!recipe) {
                    return res.status(404).json({ ok: false, error: 'RECIPE_NOT_FOUND_OR_NO_ACCESS' });
                }
                res.json({ ok: true, recipe: this.mapRecipeToResponse(recipe) });
            }
            catch (err) {
                console.error('updateRecipe error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // DELETE /api/recipes/:recipeId - Delete a recipe
        this.deleteRecipe = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { recipeId } = req.params;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const success = await this.recipeService.deleteRecipe(recipeId, userId);
                if (!success) {
                    return res.status(404).json({ ok: false, error: 'RECIPE_NOT_FOUND_OR_NO_ACCESS' });
                }
                res.json({ ok: true });
            }
            catch (err) {
                console.error('deleteRecipe error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // POST /api/recipes/:recipeId/save - Save (favorite) a recipe
        this.saveRecipe = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { recipeId } = req.params;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                await this.recipeService.saveRecipe(recipeId, userId);
                res.json({ ok: true });
            }
            catch (err) {
                console.error('saveRecipe error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
        // DELETE /api/recipes/:recipeId/save - Unsave (unfavorite) a recipe
        this.unsaveRecipe = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { recipeId } = req.params;
                if (!userId) {
                    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
                }
                const success = await this.recipeService.unsaveRecipe(recipeId, userId);
                if (!success) {
                    return res.status(404).json({ ok: false, error: 'RECIPE_SAVE_NOT_FOUND' });
                }
                res.json({ ok: true });
            }
            catch (err) {
                console.error('unsaveRecipe error:', err);
                res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
            }
        };
    }
    // Helper: Map domain model to API response
    mapRecipeToResponse(recipe) {
        return {
            id: recipe.id,
            ownerUserId: recipe.ownerUserId,
            name: recipe.name,
            prepMinutes: recipe.prepMinutes,
            totalMinutes: recipe.totalMinutes,
            servings: recipe.servings,
            imageUrl: recipe.imageUrl,
            tips: recipe.tips,
            createdAt: recipe.createdAt.toISOString(),
            updatedAt: recipe.updatedAt.toISOString(),
            labels: recipe.labels,
            ingredientRows: recipe.ingredientRows.map(row => ({
                id: row.id,
                recipeId: row.recipeId,
                position: row.position,
                rowType: row.rowType,
                title: row.title,
                name: row.name,
                quantity: row.quantity,
                unit: row.unit,
                groupTitle: row.groupTitle
            })),
            steps: recipe.steps.map(step => ({
                id: step.id,
                recipeId: step.recipeId,
                position: step.position,
                stepType: step.stepType,
                textContent: step.textContent,
                imageUrl: step.imageUrl
            })),
            isSaved: recipe.isSaved
        };
    }
}
exports.RecipeController = RecipeController;
