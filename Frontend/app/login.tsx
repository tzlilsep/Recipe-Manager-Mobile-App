// app/login.tsx
import { router } from 'expo-router';
import { LoginScreen } from '../src/features/auth';

export default function LoginRoute() {
  return (
    <LoginScreen
      // Pass a callback function to LoginScreen. It will be invoked after a successful login.
      onLogin={() => {
        router.replace('/home');
      }}
    />
  );
}
