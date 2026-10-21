// apps/home/src/screens/NewMessageScreen.tsx
//
// "Who to message?" Lists everyone else in the building (owners, the manager,
// tenants and guards: everyone can message everyone). Tapping a person opens
// their chat, starting it if it is new. The building bar stays at the top so the
// building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { MemberListItem } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import PersonRow from '../components/PersonRow';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  onBack: () => void;
  onSwitch: () => void;
  /** Called with the chat that was opened (or started) for the chosen person. */
  onOpenChat: (conversationId: string, person: MemberListItem) => void;
};

export default function NewMessageScreen({ membership, onBack, onSwitch, onOpenChat }: Props) {
  const {
    data: people,
    error,
    loading,
    reload,
  } = useLoad(() => api.listMembers({ building_id: membership.building.id }));
  const [startError, setStartError] = useState<string | null>(null);

  async function start(person: MemberListItem) {
    setStartError(null);
    try {
      const { conversation_id } = await api.getOrCreateConversation({
        building_id: membership.building.id,
        other_account_id: person.account_id,
      });
      onOpenChat(conversation_id, person);
    } catch (caught) {
      setStartError(friendlyErrorMessage(caught as { message?: string }));
    }
  }

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label="Messages" onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="NEW MESSAGE" />
      </View>
      <Text style={styles.title}>Who to message?</Text>
      <Text style={styles.subtitle}>Pick a person to start a private chat.</Text>

      {startError ? <Notice kind="error" text={startError} /> : null}

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          color={colors.teal}
          accessibilityLabel="Loading"
        />
      ) : null}

      {error ? (
        <View>
          <Notice kind="error" text={error} />
          <View style={styles.retry}>
            <Button variant="outline" label="Try again" onPress={reload} />
          </View>
        </View>
      ) : null}

      {people && people.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No one else yet</Text>
          <Text style={styles.emptyBody}>People show up here once they join the building.</Text>
        </View>
      ) : null}

      {people && people.length > 0 ? (
        <View style={styles.list}>
          {people.map((person) => (
            <PersonRow key={person.membership_id} person={person} onPress={() => start(person)} />
          ))}
        </View>
      ) : null}
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
  loading: { marginTop: 32 },
  retry: { marginTop: 12 },
  list: { marginTop: 16, gap: 10 },
  empty: { ...cardStyle, marginTop: 16 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  emptyBody: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
});
