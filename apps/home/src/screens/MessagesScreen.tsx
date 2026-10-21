// apps/home/src/screens/MessagesScreen.tsx
//
// The list of the person's chats in one building, newest activity first. Each
// chat shows the other person, their last message, and when it was sent. A
// person who left shows as "Former member" and one who deleted their account as
// "Deleted account" (worked out when reading, PRD 5.8). "New message" starts a
// chat with anyone in the building. The building bar stays at the top so the
// building's name is always visible. Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ConversationItem } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import ConversationRow from '../components/ConversationRow';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  onBack: () => void;
  onSwitch: () => void;
  onNew: () => void;
  onOpen: (chat: ConversationItem) => void;
};

export default function MessagesScreen({ membership, onBack, onSwitch, onNew, onOpen }: Props) {
  const {
    data: chats,
    error,
    loading,
    reload,
  } = useLoad(() => api.listConversations({ building_id: membership.building.id }));

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label={membership.building.name} onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="MESSAGES" />
      </View>
      <Text style={styles.title}>Your chats</Text>
      <Text style={styles.subtitle}>Private messages, one person at a time.</Text>

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

      {chats && chats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptyBody}>Tap "New message" to say hello to someone.</Text>
        </View>
      ) : null}

      {chats && chats.length > 0 ? (
        <View style={styles.list}>
          {chats.map((chat) => (
            <ConversationRow key={chat.conversation_id} chat={chat} onPress={() => onOpen(chat)} />
          ))}
        </View>
      ) : null}

      <View style={styles.spacer} />
      <Button label="New message" onPress={onNew} />
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
  spacer: { flexGrow: 1, minHeight: 24 },
});
