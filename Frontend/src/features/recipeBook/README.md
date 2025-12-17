# Recipe Book Feature - Architecture

## Directory Structure

```
recipeBook/
├── api/                    # REST API calls to backend
│   ├── index.ts           # Exports all API functions
│   ├── recipe.api.types.ts # API request/response types
│   └── recipe.service.ts  # API service functions
│
├── model/                  # Business logic & state management
│   ├── index.ts           # Exports all model items
│   ├── types.ts           # Core domain types
│   ├── useRecipeBook.ts   # Main hook for recipe book logic
│   ├── utils.ts           # Helper utilities
│   ├── usefulInfo.ts      # Useful cooking info database
│   └── mockData.ts        # Mock data for development
│
└── ui/                     # React components (presentation only)
    ├── RecipeBookScreen.tsx    # Main screen container
    ├── components/             # Shared UI components
    │   ├── index.ts           # Component exports
    │   ├── TabsBar.tsx
    │   ├── RecipeCard.tsx
    │   ├── RecipeFiltersModal.tsx
    │   ├── IngredientEditor.tsx
    │   ├── InstructionEditor.tsx
    │   ├── TagPicker.tsx
    │   ├── AddToShoppingListModal.tsx
    │   ├── MealEditorModal.tsx
    │   └── AddRecipeToMealModal.tsx
    │
    └── screens/               # Screen components
        ├── index.ts
        ├── RecipeListScreen.tsx
        ├── RecipeDetailsScreen.tsx
        ├── AddEditRecipeScreen.tsx
        ├── MealsScreen.tsx
        └── UsefulInfoScreen.tsx
```

## Architecture Principles

### 1. Separation of Concerns
- **UI Layer**: Pure presentation components that receive data via props
- **Model Layer**: Business logic, state management, and data transformations
- **API Layer**: Backend communication (REST calls)

### 2. Data Flow
```
Backend API 
    ↓
API Service (recipe.service.ts)
    ↓
useRecipeBook Hook (state + logic)
    ↓
UI Components (presentation)
```

### 3. Key Features

#### API Layer (`api/`)
- All backend communication happens here
- Handles authentication tokens automatically
- Returns typed responses
- Includes error handling with fallbacks

#### Model Layer (`model/`)
- **useRecipeBook**: Main React hook that:
  - Manages all recipe/meal state
  - Loads data from API on mount
  - Falls back to mock data if API fails
  - Handles filters, search, and data transformations
  - Provides all business logic functions

#### UI Layer (`ui/`)
- **Components**: Reusable UI pieces (modals, editors, cards)
- **Screens**: Full-screen views for different tabs
- **No business logic**: All logic comes from hooks
- **Type-safe**: All props are properly typed

### 4. Current State

✅ **Completed**:
- Full API layer with REST endpoints
- useRecipeBook hook with API integration
- All UI components working without errors
- Proper TypeScript typing throughout
- Separation of concerns achieved

⏳ **Mock Data Fallback**:
- App uses mock data initially
- Loads from API when available
- Seamlessly falls back if API fails
- Ready for backend integration

### 5. Backend Integration

The frontend is ready for backend integration. Required endpoints:

**Recipes**:
- `GET /api/recipes/my` - Get user's recipes
- `GET /api/recipes/others` - Get public recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/copy` - Copy recipe to my recipes

**Meals**:
- `GET /api/meals` - Get user's meals
- `POST /api/meals` - Create new meal
- `DELETE /api/meals/:id` - Delete meal
- `POST /api/meals/:mealId/recipes` - Add recipe to meal
- `DELETE /api/meals/:mealId/recipes/:recipeId` - Remove recipe from meal

### 6. Next Steps

1. **Test the UI** - Run the app and verify navigation works
2. **Backend Development** - Implement the required API endpoints
3. **Remove Mock Data** - Once backend is ready, can remove mockData.ts
4. **Add Loading States** - Consider adding loading indicators for API calls
5. **Error Handling** - Add user-friendly error messages
