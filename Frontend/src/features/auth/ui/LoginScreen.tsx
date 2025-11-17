// src/features/auth/ui/LoginScreen.tsx
import React from 'react';
import { useLoginForm } from '../model/useLoginForm';
import LoginForm from './LoginForm';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const form = useLoginForm(onLogin);

  return (
    <LoginForm
      username={form.username}
      password={form.password}
      loading={form.loading}
      onChangeUsername={form.setUsername}
      onChangePassword={form.setPassword}
      onSubmit={form.handleSubmit}
    />
  );
}
