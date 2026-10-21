// apps/home/src/screens/PeopleScreen.tsx
//
// The people in a building: other owners, the manager and tenants, each with
// their role. This is also how a member finds someone to message (PRD 5.6).
// Owners also see the building's guards in their own section (guards cannot
// message, so they are listed only so they can be removed) and a Remove button on
// everyone except other owners. The person looking is not in the list. The
// building bar stays at the top so the building's name is always visible.
// Owned by Bishal.

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
import { canRemove, peopleCountSentence } from '../people';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** A green "it worked" sentence to show at the top, or null. */
  notice: string | null;
  onBack: () => void;
  onSwitch: () => void;
  onRemove: (person: MemberListItem) => void;
};

export default function PeopleScreen({ membership, notice, onBack, onSwitch, onRemove }: Props) {
  const isOwner = membership.role === 'owner';
  const buildingId = membership.building.id;
  const people = useLoad(() => api.listMembers({ building_id: buildingId }));
  const guards = useLoad<MemberListItem[]>(() =>
    isOwner ? api.listGuards({ building_id: buildingId }) : Promise.resolve([]),
  );
  const error = people.error ?? guards.error;
  const reload = () => {
    people.reload();
    guards.reload();
  };

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label={membership.building.name} onPress={onBack} />

      {notice ? <Notice kind="success" text={notice} /> : null}

      <View style={styles.eyebrow}>
        <Eyebrow text="PEOPLE" />
      </View>
      <Text style={styles.title}>In {membership.building.name}</Text>
      {people.data && guards.data ? (
        <Text style={styles.subtitle}>{peopleCountSentence(people.data, guards.data)}</Text>
      ) : null}

      {people.loading || guards.loading ? (
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

      {people.data && people.data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No one else yet</Text>
          <Text style={styles.emptyBody}>
            {isOwner
              ? 'People show up here once you say yes to their join requests.'
              : 'People show up here once they join the building.'}
          </Text>
        </View>
      ) : null}

      {people.data && people.data.length > 0 ? (
        <View style={styles.list}>
          {people.data.map((person) => (
            <PersonRow
              key={person.membership_id}
              person={person}
              removable={canRemove(membership.role, person)}
              onRemove={() => onRemove(person)}
            />
          ))}
        </View>
      ) : null}

      {isOwner && guards.data && guards.data.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>GUARDS</Text>
          <View style={styles.guards}>
            {guards.data.map((guard) => (
              <PersonRow
                key={guard.membership_id}
                person={guard}
                removable={canRemove(membership.role, guard)}
                onRemove={() => onRemove(guard)}
              />
            ))}
          </View>
          <Text style={styles.footnote}>
            Guards cannot send or receive messages, so they are listed here only so you can remove
            them.
          </Text>
        </>
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
  sectionLabel: {
    marginTop: 22,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.muted,
  },
  guards: { marginTop: 10, gap: 10 },
  footnote: {
    marginTop: 14,
    marginHorizontal: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
