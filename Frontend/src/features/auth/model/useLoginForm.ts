// src/features/auth/model/useLoginForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '../api/auth.service';
import { useAuth } from './auth.context';

export function useLoginForm(onSuccess: () => void) {
  // Local state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth context provides session actions and current auth data
  const { setAuth, signOut } = useAuth();

  const handleSubmit = async () => {
    // Prevent multiple submissions while a request is in progress
    if (loading) return;

    // Basic input validation
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      Alert.alert('שגיאה', 'נא למלא שם משתמש וסיסמה');
      return;
    }

    setLoading(true);

    // Clear any previous session before starting a new login attempt
    await signOut();

    try {
      // Perform login request to the server
      const result = await authService.login(trimmedUsername, password);

      // Handle failed login response
      if (!result.ok) {
        Alert.alert('שגיאה', 'שם משתמש או סיסמה לא נכונים');
        return;
      }

      // Save authenticated user data into the global Auth context
      await setAuth({
        token: result.token ?? null,
        userId: result.user?.id ?? null,
        userName: result.user?.name ?? null,
      });

      // Trigger navigation or other login-success behavior
      onSuccess();

    } catch {
      // Generic error handler (network issues, server error, etc.)
      Alert.alert('שגיאה', 'אירעה שגיאה במהלך ההתחברות. נסו שוב.');
    } finally {
      // Always stop loading when the request finishes
      setLoading(false);
    }
  };

  return {
    username,
    password,
    loading,
    setUsername,
    setPassword,
    handleSubmit,
  };
}
