// apps/home/src/screens/LogInScreen.tsx
//
// The log-in screen of Griho Home. The person types an email and a password and
// taps "Log in". If it works, the app moves on. If not, a plain red sentence
// says why (for example, a Staff account is told to use Griho Staff). There is
// also a link to the sign-up screen. While the app is being tested, a small
// grey note shows a pretend login; it never appears in a finished app.
// Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Account } from '@griho/shared';

import { api } from '../api';
import { logInToHome } from '../auth';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import HouseDrawing from '../components/HouseDrawing';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TealCard from '../components/TealCard';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

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
      const account = await logInToHome(api, email, password);
      onLoggedIn(account);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Logo />

      <View style={styles.eyebrow}>
        <Eyebrow text="WELCOME BACK" />
      </View>
      <Text style={styles.title}>Log in to your home</Text>
      <Text style={styles.subtitle}>Your building, one message away.</Text>

      <TealCard style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerLabel}>YOUR BUILDING</Text>
          <Text style={styles.bannerBody}>Private messages with the people who live there.</Text>
        </View>
        <HouseDrawing width={110} height={88} />
      </TealCard>

      <View style={styles.form}>
        <TextField
          label="Email"
          kind="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <TextField label="Password" kind="password" value={password} onChangeText={setPassword} />

        {error ? <Notice kind="error" text={error} /> : null}

        <View style={styles.buttonSpace}>
          <Button
            label="Log in"
            arrow
            busy={busy}
            busyLabel="Logging in..."
            onPress={handleLogIn}
          />
        </View>
        <TextLink label="New here? Make an account" onPress={onGoToSignUp} />
      </View>

      {__DEV__ ? (
        <View style={styles.testChip}>
          <Text style={styles.testChipText}>
            Testing only: rahim@example.com, password test1234
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 28 },
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
  banner: {
    marginTop: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { maxWidth: 190 },
  bannerLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.onTealSoft,
  },
  bannerBody: {
    marginTop: 6,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.white,
  },
  form: { ...cardStyle, marginTop: 16, paddingTop: 6 },
  buttonSpace: { marginTop: 20 },
  testChip: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.chip,
  },
  testChipText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
