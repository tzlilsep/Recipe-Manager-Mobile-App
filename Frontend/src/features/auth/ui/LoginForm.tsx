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
  username: string;
  password: string;
  loading: boolean;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
};

export default function LoginForm({
  username,
  password,
  loading,
  onChangeUsername,
  onChangePassword,
  onSubmit,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TS</Text>
        <Text style={styles.welcome}>ברוכים הבאים</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>כניסה</Text>
        <Text style={styles.description}>לקבלת חשבון - צרו קשר</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="שם משתמש"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={onChangeUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="סיסמה"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>כניסה</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#ecd7c2ff' },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 48, fontWeight: '800', color: '#ffffffff' },
  welcome: { fontSize: 18, color: '#ffffffff' },
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
    backgroundColor: '#e2857bff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '700' },
});
