// app/home.tsx
import { router } from 'expo-router';
import { HomeScreen } from '../src/features/home';
import { useAuth } from '../src/features/auth/model/auth.context';

export default function HomeRoute() {
  const { signOut } = useAuth(); 

  return (
    <HomeScreen
      onNavigate={(page) => {
        // Handle navigation requests coming from the HomeScreen
        if (page === 'recipes') router.push('/recipeBook');   
        if (page === 'shopping') router.push('/shoppingList'); 
      }}
      onLogout={() => {
        // Perform global logout and redirect to the login screen
        signOut();
        router.replace('/login');
      }}
    />
  );
}
