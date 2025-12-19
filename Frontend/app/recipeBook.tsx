// app/recipeBook.tsx
import { router } from 'expo-router';
import { RecipeBookScreen } from '../src/features/recipeBook';
import { useShoppingListsController } from '../src/features/shoppingList/model/useShoppingListsController';
import { shoppingService } from '../src/features/shoppingList/api/shopping.service';
import { useAuth } from '../src/features/auth/model/auth.context';
import { sortByOrder, nextOrderFor } from '../src/features/shoppingList/model/domain/listOrder';
import { formatIngredientDisplay } from '../src/features/recipeBook/model/ingredientFormatter';

export default function RecipesRoute() {
  const { auth } = useAuth();
  const shoppingController = useShoppingListsController();

  const handleAddToShoppingList = async (listId: number, ingredients: Array<{ name: string; amount?: string; unit?: string }>) => {
    if (!auth?.token) return;

    try {
      let targetListId = listId;
      
      // If creating new list
      if (listId === -1) {
        const order = nextOrderFor(shoppingController.lists);
        const newList = await shoppingService.createList(auth.token, 'רשימת קניות', Date.now(), order);
        targetListId = newList.id;
        
        // Update local state
        const next = sortByOrder([...shoppingController.lists, newList]);
        shoppingController.lists.splice(0, shoppingController.lists.length, ...next);
      }
      
      // Get current list state
      const currentList = shoppingController.lists.find(l => l.id === targetListId);
      if (!currentList) return;

      // Add each ingredient as a separate item
      const updatedItems = [...currentList.items];
      for (const ing of ingredients) {
        // Use formatIngredientDisplay for clean formatting (rounds numbers, etc.)
        const itemName = formatIngredientDisplay(ing);
        
        updatedItems.push({
          id: Date.now() + Math.random(),
          name: itemName,
          checked: false,
        });
      }

      // Update the list with new items
      const updatedList = { ...currentList, items: updatedItems };
      const allLists = shoppingController.lists.map(l => l.id === targetListId ? updatedList : l);
      
      // Save to backend
      await shoppingService.saveMany(auth.token, allLists);
      
      // Update local state
      shoppingController.lists.splice(0, shoppingController.lists.length, ...allLists);
    } catch (error) {
      console.error('Failed to add to shopping list:', error);
    }
  };

  return (
    <RecipeBookScreen 
      onBack={() => router.back()} 
      shoppingLists={shoppingController.lists}
      onAddToShoppingList={handleAddToShoppingList}
    />    
  );
}
