// apps/staff/src/components/LeaveSection.tsx
//
// The "Leave this building", "Log out", and "Delete my account" buttons that sit at the bottom of the
// guard home and manager overview screens. Tapping "Leave this building" opens a
// confirmation card that asks the person to type their own name first, as the
// product rules require. If the name matches, they leave. Owned by Sraboni.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { leaveBuilding } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { OutlineButton, PrimaryButton } from './Buttons';
import DeleteAccountSection from './DeleteAccountSection';
import Field from './Field';

type Props = {
  displayName: string;
  buildingName: string;
  onLeft: () => void;
  onLogOut: () => void;
};

export default function LeaveSection({ displayName, buildingName, onLeft, onLogOut }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLeave() {
    setError(null);
    setBusy(true);
    try {
      await leaveBuilding(typedName);
      onLeft();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  function closeConfirm() {
    setConfirming(false);
    setTypedName('');
    setError(null);
  }

  if (!confirming) {
    return (
      <View>
        <OutlineButton
          label="Leave this building"
          tone="danger"
          onPress={() => setConfirming(true)}
        />
        <OutlineButton label="Log out" onPress={onLogOut} />
        <DeleteAccountSection displayName={displayName} onDeleted={onLogOut} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={local.title}>Leave {buildingName}?</Text>
      <Text style={local.text}>You lose access right away. Type your name to confirm.</Text>
      <Field
        label="Type your name"
        value={typedName}
        onChangeText={setTypedName}
        placeholder={displayName}
        autoCapitalize="words"
        autoCorrect={false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        danger
        label={busy ? 'Leaving...' : 'Leave building'}
        onPress={handleLeave}
        disabled={busy || !typedName.trim()}
      />
      <OutlineButton label="Cancel" onPress={closeConfirm} />
    </View>
  );
}

const local = StyleSheet.create({
  title: { color: colors.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
});
