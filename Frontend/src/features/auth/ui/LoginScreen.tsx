// src/features/auth/ui/LoginScreen.tsx

import React from 'react';
import { I18nManager } from 'react-native';
import { useLoginForm } from '../model/useLoginForm';
import LoginForm from './LoginForm';

 type Props = { onLogin: (username?: string) => void; };


// Enable RTL layout support if needed
I18nManager.allowRTL(true);
I18nManager.forceRTL(false);

/**
 * Smart container component that connects the form UI with business logic (hook).
 */
export default function LoginScreen({ onLogin }: Props) {
  const form = useLoginForm(onLogin);

  return (
    <LoginForm
      isRegister={form.isRegister}
      username={form.username}
      password={form.password}
      confirmPassword={form.confirmPassword}
      loading={form.loading}
      onChangeUsername={form.setUsername}
      onChangePassword={form.setPassword}
      onChangeConfirmPassword={form.setConfirmPassword}
      onSubmit={form.handleSubmit}
      onToggleMode={form.toggleMode}
    />
  );
}
