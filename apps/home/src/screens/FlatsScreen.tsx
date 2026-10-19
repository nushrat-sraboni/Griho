// apps/home/src/screens/FlatsScreen.tsx
//
// The list of flats in a building, for its owners. Each flat shows who owns it
// and the one button that fits: Rename on the person's own flats, Claim on flats
// with no owner. "Add a flat" is at the bottom. The building bar stays at the
// top so the building's name is always visible. After an action, a green
// message says it worked. Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Account, Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import FlatRow from '../components/FlatRow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { flatCountSentence } from '../flats';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  account: Account;
  /** A green "it worked" sentence to show at the top, or null. */
  notice: string | null;
  onBack: () => void;
  onSwitch: () => void;
  onAdd: () => void;
  onRename: (flat: Flat) => void;
  onClaim: (flat: Flat) => void;
};

export default function FlatsScreen({
  membership,
  account,
  notice,
  onBack,
  onSwitch,
  onAdd,
  onRename,
  onClaim,
}: Props) {
  const {
    data: flats,
    error,
    loading,
    reload,
  } = useLoad(() => api.listFlats({ building_id: membership.building.id }));

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
        <Eyebrow text="FLATS" />
      </View>
      <Text style={styles.title}>Your flats</Text>
      {flats ? <Text style={styles.subtitle}>{flatCountSentence(flats)}</Text> : null}

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

      {flats && flats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No flats yet</Text>
          <Text style={styles.emptyBody}>
            Add the flats in your building so people can join them.
          </Text>
        </View>
      ) : null}

      {flats && flats.length > 0 ? (
        <View style={styles.list}>
          {flats.map((flat) => (
            <FlatRow
              key={flat.id}
              flat={flat}
              myAccountId={account.id}
              onRename={() => onRename(flat)}
              onClaim={() => onClaim(flat)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.spacer} />
      <Button label="Add a flat" onPress={onAdd} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 18 },
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
  spacer: { flexGrow: 1, minHeight: 24 },
});
