// apps/home/src/screens/PeopleScreen.tsx
//
// Everyone else in a building: owners, the manager, tenants and guards, each with
// their role. Everyone in a building can message everyone, so every row has a
// "Message" button that opens a chat. Owners also see a red "Remove" button on
// everyone except other owners (PRD 5.7). The person looking is not in the list.
// The building bar stays at the top so the building's name is always visible.
// Owned by Bishal.

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
import { canRemove, peopleCountSentence, splitGuards } from '../people';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** A green "it worked" sentence to show at the top, or null. */
  notice: string | null;
  onBack: () => void;
  onSwitch: () => void;
  onRemove: (person: MemberListItem) => void;
  /** Called with the chat that was opened (or started) for the chosen person. */
  onOpenChat: (conversationId: string, person: MemberListItem) => void;
};

export default function PeopleScreen({
  membership,
  notice,
  onBack,
  onSwitch,
  onRemove,
  onOpenChat,
}: Props) {
  const isOwner = membership.role === 'owner';
  const [chatError, setChatError] = useState<string | null>(null);

  async function startChat(person: MemberListItem) {
    setChatError(null);
    try {
      const { conversation_id } = await api.getOrCreateConversation({
        building_id: membership.building.id,
        other_account_id: person.account_id,
      });
      onOpenChat(conversation_id, person);
    } catch (caught) {
      setChatError(friendlyErrorMessage(caught as { message?: string }));
    }
  }
  const {
    data: people,
    error,
    loading,
    reload,
  } = useLoad(() => api.listMembers({ building_id: membership.building.id }));
  const split = people ? splitGuards(people) : null;

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label={membership.building.name} onPress={onBack} />

      {notice ? <Notice kind="success" text={notice} /> : null}
      {chatError ? <Notice kind="error" text={chatError} /> : null}

      <View style={styles.eyebrow}>
        <Eyebrow text="PEOPLE" />
      </View>
      <Text style={styles.title}>In {membership.building.name}</Text>
      {split ? (
        <Text style={styles.subtitle}>{peopleCountSentence(split.people, split.guards)}</Text>
      ) : null}

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
          <Text style={styles.emptyBody}>
            {isOwner
              ? 'People show up here once you say yes to their join requests.'
              : 'People show up here once they join the building.'}
          </Text>
        </View>
      ) : null}

      {people && people.length > 0 ? (
        <View style={styles.list}>
          {people.map((person) => (
            <PersonRow
              key={person.membership_id}
              person={person}
              removable={canRemove(membership.role, person)}
              onRemove={() => onRemove(person)}
              onMessage={() => startChat(person)}
            />
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
  emptyBody: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
  },
});
