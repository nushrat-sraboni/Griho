// apps/home/src/screens/BuildingHomeScreen.tsx
//
// The home page of one building. The bar at the top always shows the building's
// name and the person's role (a product rule), with a "Switch" button back to
// the list of buildings. Below are the building's address and contact info,
// loaded from the backend.
// Owners also see a "Flats" card (with a short count) that opens the flats list,
// and the next step, "Make join codes", which is built later and so is marked
// "Soon". Other roles do not see flats.
// Right after a building is created, a green "Your building is ready" message
// is shown. Owned by Bishal.

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Pill from '../components/Pill';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { flatSummary } from '../flats';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** True right after the person made this building, to show the "ready" message. */
  justCreated: boolean;
  onSwitch: () => void;
  onOpenFlats: () => void;
};

export default function BuildingHomeScreen({
  membership,
  justCreated,
  onSwitch,
  onOpenFlats,
}: Props) {
  const isOwner = membership.role === 'owner';
  const {
    data: building,
    error,
    loading,
    reload,
  } = useLoad(() => api.getBuilding({ building_id: membership.building.id }));
  const flatsLoad = useLoad<Flat[]>(() =>
    isOwner ? api.listFlats({ building_id: membership.building.id }) : Promise.resolve([]),
  );
  const roleText = roleLabel(membership);

  let flatsLine = 'Loading...';
  if (flatsLoad.error) flatsLine = 'Tap to see your flats';
  else if (flatsLoad.data) flatsLine = flatSummary(flatsLoad.data);

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleText}
        onSwitch={onSwitch}
      />

      {justCreated ? (
        <Notice kind="success" text="Your building is ready. You are its first owner." />
      ) : null}

      <View style={styles.eyebrow}>
        <Eyebrow text="YOUR BUILDING" />
      </View>
      <Text style={styles.title}>{membership.building.name}</Text>

      {isOwner ? (
        <Pressable
          style={styles.flatsCard}
          onPress={onOpenFlats}
          accessibilityRole="button"
          accessibilityLabel={`Flats, ${flatsLine}`}
        >
          <View
            style={styles.flatsIcon}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View style={styles.window} />
            <View style={[styles.window, styles.windowLit]} />
            <View style={styles.window} />
            <View style={styles.window} />
          </View>
          <View style={styles.flatsText}>
            <Text style={styles.flatsTitle}>Flats</Text>
            <Text style={styles.flatsBody}>{flatsLine}</Text>
          </View>
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.teal}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M9 6 L15 12 L9 18" />
          </Svg>
        </Pressable>
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

      {building ? (
        <View style={styles.details}>
          <View style={[styles.row, styles.rowLine]}>
            <Text style={styles.rowLabel}>ADDRESS</Text>
            <Text style={styles.rowValue}>{building.address}</Text>
          </View>
          <View style={[styles.row, styles.rowLine]}>
            <Text style={styles.rowLabel}>CONTACT</Text>
            <Text style={styles.rowValue}>{building.contact_info}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>YOUR ROLE</Text>
            <Text style={styles.rowValue}>{roleText}</Text>
          </View>
        </View>
      ) : null}

      {isOwner ? (
        <>
          <Text style={styles.sectionLabel}>NEXT STEP</Text>
          <View style={styles.step}>
            <View
              style={styles.stepNumber}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Make join codes</Text>
              <Text style={styles.stepBody}>Share a code so people can ask to join.</Text>
            </View>
            <Pill text="Soon" tone="grey" />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 22 },
  title: {
    marginTop: 10,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  flatsCard: {
    ...cardStyle,
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderColor: colors.teal,
    borderWidth: 1.5,
  },
  flatsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.teal,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 9,
  },
  window: { width: 11, height: 11, borderRadius: 3, backgroundColor: colors.page },
  windowLit: { backgroundColor: colors.amber },
  flatsText: { flex: 1 },
  flatsTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, letterSpacing: -0.2 },
  flatsBody: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
  },
  loading: { marginTop: 32 },
  retry: { marginTop: 12 },
  details: { ...cardStyle, marginTop: 16, paddingVertical: 6 },
  row: { paddingVertical: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.chip },
  rowLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  rowValue: { marginTop: 4, fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.muted,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.teal },
  stepText: { flex: 1 },
  stepTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  stepBody: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
