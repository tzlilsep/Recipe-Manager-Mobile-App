// src/features/auth/ui/LoginForm.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

type Props = {
  isRegister: boolean;
  username: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangeConfirmPassword: (v: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
};

export default function LoginForm({
  isRegister,
  username,
  password,
  confirmPassword,
  loading,
  onChangeUsername,
  onChangePassword,
  onChangeConfirmPassword,
  onSubmit,
  onToggleMode,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TS</Text>
        <Text style={styles.welcome}>Welcome</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{isRegister ? 'Register' : 'Login'}</Text>
        <Text style={styles.description}>
          {isRegister ? 'Create a new account' : 'Sign in to your account'}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={onChangeUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
          />
          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={onChangeConfirmPassword}
              secureTextEntry
            />
          )}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? 'Register' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleMode}>
            <Text style={styles.switchText}>
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#EEF2FF' },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 48, fontWeight: '800', color: '#4F46E5' },
  welcome: { fontSize: 18, color: '#6B7280' },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  description: { textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  form: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '700' },
  switchText: { color: '#2563EB', marginTop: 10, textAlign: 'center' },
});
