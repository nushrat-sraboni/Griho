// apps/staff/src/screens/LogInScreen.tsx
//
// The log-in screen of Griho Staff. The person types an email and a password,
// then taps "Log in". If it works, the app moves on. If not, a plain sentence
// explains why. There is also a link to the sign-up screen. The look follows the
// Griho Staff design. Owned by Sraboni.

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Account } from '@griho/shared';
import Brand from '../components/Brand';
import { PrimaryButton } from '../components/Buttons';
import Eyebrow from '../components/Eyebrow';
import Field from '../components/Field';
import HeroCard from '../components/HeroCard';
import Screen from '../components/Screen';
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
    <Screen>
      <Brand />
      <Eyebrow>Welcome back</Eyebrow>
      <Text style={styles.title}>Log in to your building</Text>
      <Text style={styles.subtitle}>For managers and guards.</Text>

      <HeroCard label="Your building" title="Keep doors and codes in order." />

      <View style={styles.card}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secret
          textContentType="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={busy ? 'Logging in...' : 'Log in'}
          onPress={handleLogIn}
          disabled={busy}
        />
        <Pressable onPress={onGoToSignUp} accessibilityRole="button">
          <Text style={styles.link}>New here? Make an account</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>Testing only: sraboni@staff.test, any password</Text>
    </Screen>
  );
}
