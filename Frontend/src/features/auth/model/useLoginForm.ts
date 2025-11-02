// src/features/auth/model/useLoginForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '../api/auth.service';

/**
 * Hook responsible for managing login/register form state and calling the AuthService.
 */
export function useLoginForm(onSuccess: (username: string) => void) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setIsRegister(!isRegister);

  const handleSubmit = async () => {
    if (isRegister && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = isRegister
      ? await authService.register(username, password)
      : await authService.login(username, password);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Error', result.error || 'Authentication failed');
      return;
    }

    onSuccess(username);
  };

  return {
    isRegister,
    username,
    password,
    confirmPassword,
    loading,
    setUsername,
    setPassword,
    setConfirmPassword,
    toggleMode,
    handleSubmit,
  };
}
