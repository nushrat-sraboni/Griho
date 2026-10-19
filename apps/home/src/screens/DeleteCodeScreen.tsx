// apps/home/src/screens/DeleteCodeScreen.tsx
//
// Asks the owner to confirm deleting a join code. It says what will happen: the
// code stops working and leaves the list; people who already joined with it stay;
// requests still waiting on it are cancelled (PRD 5.4, API contract 4.4). The
// building bar stays at the top so the building's name is always visible.
// Owned by Bishal.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CodeInfo } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import CodeBox from '../components/CodeBox';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  code: CodeInfo;
  /** Go back to the code without deleting it. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after deleting, with a green sentence to show on the codes list. */
  onDeleted: (message: string) => void;
};

export default function DeleteCodeScreen({ membership, code, onBack, onSwitch, onDeleted }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setError(null);
    setBusy(true);
    try {
      await api.setCodeStatus({ code_id: code.id, status: 'deleted' });
      onDeleted(`Code ${code.value} was deleted.`);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label="Code" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="DELETE CODE" />
      </View>
      <Text style={styles.title}>Delete this code?</Text>
      <Text style={styles.subtitle}>You cannot undo this.</Text>

      <View style={styles.card}>
        <CodeBox value={code.value} size="medium" />
        <Text style={styles.body}>The code stops working and disappears from your list.</Text>
        <Notice
          kind="info"
          text="People who already joined with it stay in the building. Requests still waiting for this code are cancelled."
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <Pressable
          onPress={handleDelete}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy }}
          style={({ pressed }) => [styles.delete, (pressed || busy) && styles.dimmed]}
        >
          <Text style={styles.deleteText}>{busy ? 'Deleting...' : 'Delete code'}</Text>
        </Pressable>
        <TextLink label="Keep it" onPress={onBack} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 4 },
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
  card: { ...cardStyle, marginTop: 20 },
  body: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  delete: {
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: { opacity: 0.7 },
  deleteText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});
