// apps/staff/src/screens/SignUpScreen.tsx
//
// The sign-up screen of Griho Staff. A new manager or guard types a name, an
// email, and a password. The screen also explains that the same email cannot be
// used for Griho Home and Griho Staff, as the product rules require.
// Owned by Sraboni.

import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { signUp } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { styles } from '../styles';
import type { Account } from '@griho/shared';

type Props = {
  onSignedUp: (account: Account) => void;
  onGoToLogIn: () => void;
};

export default function SignUpScreen({ onSignedUp, onGoToLogIn }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignUp() {
    setError(null);
    setBusy(true);
    try {
      const account = await signUp({ email, password, displayName });
      onSignedUp(account);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Make an account</Text>
      <Text style={styles.subtitle}>For managers and guards</Text>

      <Text style={styles.label}>Your name</Text>
      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
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
        textContentType="newPassword"
      />

      <Text style={styles.note}>
        Each app needs its own email address. If you use Griho Home, use a different email here.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={busy}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{busy ? 'Making account...' : 'Make account'}</Text>
      </Pressable>

      <Pressable onPress={onGoToLogIn} accessibilityRole="button">
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </View>
  );
}
