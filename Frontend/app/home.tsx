// app/home.tsx
import { router } from 'expo-router';
import { HomeScreen } from '../src/features/home';

export default function HomeRoute() {
  // TODO: להחליף בשם משתמש אמיתי כשיהיה state של התחברות
  const username = 'דנה';

  return (
    <HomeScreen
      username={username}
      onNavigate={(page) => {
        if (page === 'recipes') router.push('/recipeBook');
        if (page === 'shopping') router.push('/shoppingList');
        // planty כרגע נעול, אין ניווט
      }}
      onLogout={() => router.replace('/login')}
    />
  );
}
