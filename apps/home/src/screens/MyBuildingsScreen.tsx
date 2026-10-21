// apps/home/src/screens/MyBuildingsScreen.tsx
//
// The first screen after logging in to Griho Home: "My buildings". It greets the
// person, shows today's date, and lists every building they belong to with
// their role there. Tapping a building opens it and makes it the active one.
// A person with no building yet sees an invitation to make or join one.
// "Create building" opens the create form. "Join with code" opens the join form.
// Requests the person sent that nobody has answered yet are shown in a yellow
// "Waiting for an answer" section. At the bottom: Log out, and "Delete my account".
// Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Account } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BuildingCard from '../components/BuildingCard';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import HouseDrawing from '../components/HouseDrawing';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TealCard from '../components/TealCard';
import TextLink from '../components/TextLink';
import WaitingRequestCard from '../components/WaitingRequestCard';
import { formatEyebrowDate, getGreeting } from '../greeting';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  account: Account;
  /** The building that is open right now, if any. It gets an "Active" label. */
  activeBuildingId: string | null;
  onOpenBuilding: (membership: MembershipWithLastOwner) => void;
  onCreateBuilding: () => void;
  onJoinWithCode: () => void;
  onDeleteAccount: () => void;
  onLogOut: () => void;
  /** A green "it worked" sentence to show at the top (for example "You left Blue Court."), or null. */
  notice: string | null;
};

export default function MyBuildingsScreen({
  account,
  activeBuildingId,
  onOpenBuilding,
  onCreateBuilding,
  onJoinWithCode,
  onDeleteAccount,
  onLogOut,
  notice,
}: Props) {
  const { data: memberships, error, loading, reload } = useLoad(() => api.getMyMemberships());
  const { data: myRequests } = useLoad(() => api.listMyJoinRequests());
  const waiting = (myRequests ?? []).filter((request) => request.status === 'pending');
  const now = new Date();
  const firstLetter = account.display_name.trim().charAt(0).toUpperCase();
  const hasBuildings = !!memberships && memberships.length > 0;

  return (
    <Screen>
      <View style={styles.topRow}>
        <Logo />
        <View
          style={styles.avatar}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Your account: ${account.display_name}`}
        >
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
      </View>

      <View style={styles.eyebrow}>
        <Eyebrow text={formatEyebrowDate(now)} />
      </View>
      <Text style={styles.title}>
        {getGreeting(now)}, {account.display_name}
      </Text>
      <Text style={styles.subtitle}>
        {hasBuildings
          ? 'Pick a building to open it.'
          : 'Your home, your community, all in one place.'}
      </Text>

      {notice ? <Notice kind="success" text={notice} /> : null}

      {waiting.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>WAITING FOR AN ANSWER</Text>
          <View style={styles.list}>
            {waiting.map((request) => (
              <WaitingRequestCard key={request.request_id} request={request} />
            ))}
          </View>
        </>
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

      {memberships && !hasBuildings ? (
        <>
          <View style={styles.chip}>
            <Text style={styles.chipText}>No building yet</Text>
          </View>

          <TealCard circle="top" style={styles.hero}>
            <View style={styles.house}>
              <HouseDrawing width={116} height={94} />
            </View>
            <Text style={styles.heroLabel}>GET STARTED</Text>
            <Text style={styles.heroTitle}>Make or join a building.</Text>
            <Text style={styles.heroBody}>
              Create your building, or join one with a code from its owner.
            </Text>
            <View style={styles.heroButtons}>
              <Button
                variant="light"
                compact
                arrow
                label="Create building"
                onPress={onCreateBuilding}
              />
              <Button variant="ghost" compact label="Join with code" onPress={onJoinWithCode} />
            </View>
          </TealCard>

          <View style={styles.emptyCard}>
            <View style={styles.windows} accessibilityElementsHidden importantForAccessibility="no">
              <View style={styles.windowRow}>
                <View style={styles.windowSquare} />
                <View style={[styles.windowSquare, styles.windowLit]} />
              </View>
              <View style={styles.windowRow}>
                <View style={[styles.windowSquare, styles.windowTeal]} />
                <View style={styles.windowSquare} />
              </View>
            </View>
            <View style={styles.emptyText}>
              <Text style={styles.emptyTitle}>Your buildings</Text>
              <Text style={styles.emptyBody}>Buildings you make or join will show up here.</Text>
            </View>
          </View>
        </>
      ) : null}

      {memberships && hasBuildings ? (
        <>
          <Text style={styles.sectionLabel}>YOUR BUILDINGS</Text>
          <View style={styles.list}>
            {memberships.map((membership) => (
              <BuildingCard
                key={membership.membership_id}
                membership={membership}
                active={membership.building.id === activeBuildingId}
                onPress={() => onOpenBuilding(membership)}
              />
            ))}
          </View>
          <View style={styles.actions}>
            <View style={styles.actionHalf}>
              <Button compact arrow label="Create building" onPress={onCreateBuilding} />
            </View>
            <View style={styles.actionHalf}>
              <Button compact variant="outline" label="Join with code" onPress={onJoinWithCode} />
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.spacer} />
      <Button variant="outline" label="Log out" onPress={onLogOut} />
      <TextLink danger label="Delete my account" onPress={onDeleteAccount} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.teal },
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
  loading: { marginTop: 32 },
  retry: { marginTop: 12 },
  sectionLabel: {
    marginTop: 22,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.muted,
  },
  list: { marginTop: 10, gap: 12 },
  actions: { marginTop: 16, flexDirection: 'row', gap: 8 },
  actionHalf: { flex: 1 },
  chip: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink },
  hero: { marginTop: 16, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 },
  house: { position: 'absolute', right: 14, top: 20 },
  heroLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.onTealSoft,
  },
  heroTitle: {
    marginTop: 8,
    maxWidth: 190,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: colors.white,
  },
  heroBody: {
    marginTop: 8,
    maxWidth: 250,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onTealBody,
  },
  heroButtons: { marginTop: 18, flexDirection: 'row', gap: 8 },
  emptyCard: {
    ...cardStyle,
    marginTop: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  windows: { gap: 6 },
  windowRow: { flexDirection: 'row', gap: 6 },
  windowSquare: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.windowOff },
  windowLit: { backgroundColor: colors.amber },
  windowTeal: { backgroundColor: colors.teal },
  emptyText: { flex: 1 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  emptyBody: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
  },
  spacer: { flexGrow: 1, minHeight: 16 },
});
