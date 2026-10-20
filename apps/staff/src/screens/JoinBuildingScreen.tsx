// apps/staff/src/screens/JoinBuildingScreen.tsx
//
// The "join a building" screen of Griho Staff. A manager or guard types the code
// they were given, then taps "Send request". If the code works, the request is
// sent and the app moves on to the waiting screen. If not, a plain sentence says
// why. A short "how joining works" list and a log-out button sit below. The look
// follows the Griho Staff design. Owned by Sraboni.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Brand from '../components/Brand';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import DeleteAccountSection from '../components/DeleteAccountSection';
import Eyebrow from '../components/Eyebrow';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { submitJoinRequest, type JoinRequestResult } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';

type Props = {
  displayName: string;
  onRequestSent: (request: JoinRequestResult) => void;
  onLogOut: () => void;
};

const STEPS = [
  'Type the code you were given.',
  'Someone in charge says yes.',
  'Your building opens.',
];

export default function JoinBuildingScreen({ displayName, onRequestSent, onLogOut }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setError(null);
    setBusy(true);
    try {
      const request = await submitJoinRequest(code);
      onRequestSent(request);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Brand />
      <Eyebrow>Join a building</Eyebrow>
      <Text style={styles.title}>Enter your code.</Text>
      <Text style={styles.subtitle}>
        Ask the building owner for a manager code, or your manager for a guard code.
      </Text>

      <View style={styles.card}>
        <Field
          label="Code"
          value={code}
          onChangeText={setCode}
          placeholder="For example: GUARD-2468"
          autoCapitalize="characters"
          autoCorrect={false}
          style={local.codeInput}
        />
        <Text style={local.hint}>Capital letters and spaces at the ends do not matter.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={busy ? 'Sending...' : 'Send request'}
          onPress={handleSend}
          disabled={busy || !code.trim()}
        />
      </View>

      <View style={styles.card}>
        <Text style={local.stepsTitle}>How joining works</Text>
        {STEPS.map((step, index) => (
          <View key={step} style={local.stepRow}>
            <View style={local.stepNumber}>
              <Text style={local.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={local.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />
      <OutlineButton label="Log out" onPress={onLogOut} />
      <DeleteAccountSection displayName={displayName} onDeleted={onLogOut} />
    </Screen>
  );
}

const local = StyleSheet.create({
  codeInput: { height: 52, fontWeight: '700', letterSpacing: 1 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10, marginHorizontal: 2 },
  stepsTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: colors.green, fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, color: '#3f524b', fontSize: 13, lineHeight: 18 },
});
