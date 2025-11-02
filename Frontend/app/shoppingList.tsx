// app/shoppingList.tsx
import { router } from 'expo-router';
import { ShoppingListScreen } from '../src/features/shoppingList';

export default function ShoppingListRoute() {
  return (
    <ShoppingListScreen
      onBack={() => router.back()}
      initialLists={[
        { id: 1, name: 'קניות שבועיות', items: [{ id: 11, name: 'חלב', checked: false }] },
      ]}
    />
  );
}
