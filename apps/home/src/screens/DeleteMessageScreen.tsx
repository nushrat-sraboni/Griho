// apps/home/src/screens/DeleteMessageScreen.tsx
//
// Asks the person to confirm deleting one of their own messages. Deleting removes
// it for everyone in the chat: both people then see "Message deleted" where the
// words were (PRD 5.6, API contract 4.7). The building bar stays at the top so
// the building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { clockTime } from '../messages';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  message: Message;
  /** Go back to the chat without deleting. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after the message was deleted. */
  onDeleted: () => void;
};

export default function DeleteMessageScreen({
  membership,
  message,
  onBack,
  onSwitch,
  onDeleted,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setError(null);
    setBusy(true);
    try {
      await api.deleteMessage({ message_id: message.id });
      onDeleted();
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
      <BackLink label="Chat" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="DELETE MESSAGE" />
      </View>
      <Text style={styles.title}>Delete this message?</Text>
      <Text style={styles.subtitle}>You cannot undo this.</Text>

      <View style={styles.card}>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>{message.body}</Text>
          <Text style={styles.quoteTime}>{clockTime(message.created_at)}</Text>
        </View>
        <Notice
          kind="info"
          text={
            'It is removed for everyone in this chat. Both of you will see "Message deleted" instead.'
          }
        />
        {error ? <Notice kind="error" text={error} /> : null}

        <Pressable
          onPress={handleDelete}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy }}
          style={({ pressed }) => [styles.delete, (pressed || busy) && styles.dimmed]}
        >
          <Text style={styles.deleteText}>{busy ? 'Deleting...' : 'Delete for everyone'}</Text>
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
  quote: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.ink },
  quoteTime: { marginTop: 6, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
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
