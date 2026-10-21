// apps/home/src/screens/JoinCodeScreen.tsx
//
// The "Join with a code" screen of Griho Home. The person types the code an
// owner gave them. If it works, a join request is sent and the app moves on.
// If not, a plain red sentence says why (for example "This code does not work").
// A code alone lets nobody in: an owner still has to say yes (PRD 5.5).
// Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api, type SubmitJoinRequestResult } from '../api';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { friendlyErrorMessage } from '../friendlyMessages';
import { checkJoinCode } from '../joining';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  onBack: () => void;
  /** Called with the answer, so the app can show "Request sent". */
  onSent: (result: SubmitJoinRequestResult) => void;
};

export default function JoinCodeScreen({ onBack, onSent }: Props) {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setError(null);
    const found = checkJoinCode(code);
    setProblem(found);
    if (found) return;

    setBusy(true);
    try {
      const result = await api.submitJoinRequest({ code_value: code });
      onSent(result);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <BackButton label="Back to my buildings" onPress={onBack} />
        <Logo />
      </View>

      <View style={styles.eyebrow}>
        <Eyebrow text="JOIN A BUILDING" />
      </View>
      <Text style={styles.title}>Join with a code</Text>
      <Text style={styles.subtitle}>Type the code an owner gave you.</Text>

      <View style={styles.form}>
        <TextField
          label="Join code"
          value={code}
          onChangeText={setCode}
          placeholder="For example A1-TENANT"
          capitalize="characters"
          autoComplete="off"
          error={problem}
        />

        {error ? <Notice kind="error" text={error} /> : null}
        <Notice
          kind="info"
          text="A code alone does not let you in. An owner of the building must say yes first."
        />

        <View style={styles.buttonSpace}>
          <Button
            label="Send request"
            arrow
            busy={busy}
            busyLabel="Sending..."
            onPress={handleSend}
          />
        </View>
        <TextLink label="Cancel" onPress={onBack} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { marginTop: 22 },
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
  buttonSpace: { marginTop: 20 },
});
