// apps/staff/src/screens/LogInScreen.tsx
//
// The log-in screen of Griho Staff. The person types an email and a password,
// then taps "Log in". If it works, the app moves on. If not, a plain sentence
// explains why. There is also a link to the sign-up screen.
// Owned by Sraboni.

import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Account } from '@griho/shared';
import Brand from '../components/Brand';
import { signIn } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { styles } from '../styles';

type Props = {
  onLoggedIn: (account: Account) => void;
  onGoToSignUp: () => void;
};

export default function LogInScreen({ onLoggedIn, onGoToSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogIn() {
    setError(null);
    setBusy(true);
    try {
      const account = await signIn(email, password);
      onLoggedIn(account);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Brand />
        <Text style={styles.eyebrow}>Staff log in</Text>
        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>Log in for managers and guards.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9aa6a0"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleLogIn}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{busy ? 'Logging in...' : 'Log in'}</Text>
        </Pressable>

        <Pressable onPress={onGoToSignUp} accessibilityRole="button">
          <Text style={styles.link}>New here? Make an account</Text>
        </Pressable>
      </View>
    </View>
  );
}
