// apps/home/src/screens/SignUpScreen.tsx
//
// The sign-up screen of Griho Home. A new owner or tenant types a name, an
// email, and a password (at least 6 characters). A yellow note explains the
// product rule that the same email cannot be used for both Griho Home and
// Griho Staff. If something is wrong, a plain red sentence says what.
// Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Account } from '@griho/shared';

import { api } from '../api';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

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
      const account = await api.signUp({ email, password, display_name: displayName });
      onSignedUp(account);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Logo />

      <View style={styles.eyebrow}>
        <Eyebrow text="NEW HERE" />
      </View>
      <Text style={styles.title}>Make your account</Text>
      <Text style={styles.subtitle}>For owners and tenants.</Text>

      <View style={styles.form}>
        <TextField label="Your name" value={displayName} onChangeText={setDisplayName} />
        <TextField
          label="Email"
          kind="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          kind="password"
          newPassword
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
        />

        <Notice
          kind="info"
          text="Each app needs its own email address. If you use Griho Staff, use a different email here."
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button
            label="Make account"
            arrow
            busy={busy}
            busyLabel="Making account..."
            onPress={handleSignUp}
          />
        </View>
        <TextLink label="Already have an account? Log in" onPress={onGoToLogIn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 24 },
  title: {
    marginTop: 10,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  form: { ...cardStyle, marginTop: 20, paddingTop: 6 },
  buttonSpace: { marginTop: 16 },
});
