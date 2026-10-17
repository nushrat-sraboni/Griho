// apps/home/src/screens/BuildingHomeScreen.tsx
//
// The home page of one building. The bar at the top always shows the building's
// name and the person's role (a product rule), with a "Switch" button back to
// the list of buildings. Below are the building's address and contact info,
// loaded from the backend, and a short list of next steps (add flats, make join
// codes) that are built in later steps and so are marked "Soon".
// Right after a building is created, a green "Your building is ready" message
// is shown. Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { api, type MembershipWithLastOwner } from '../api';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Pill from '../components/Pill';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** True right after the person made this building, to show the "ready" message. */
  justCreated: boolean;
  onSwitch: () => void;
};

const NEXT_STEPS = [
  { number: '1', title: 'Add your flats', body: 'Each flat gets its own owner and code.' },
  { number: '2', title: 'Make join codes', body: 'Share a code so people can ask to join.' },
];

export default function BuildingHomeScreen({ membership, justCreated, onSwitch }: Props) {
  const {
    data: building,
    error,
    loading,
    reload,
  } = useLoad(() => api.getBuilding({ building_id: membership.building.id }));
  const roleText = roleLabel(membership);

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

      <Text style={styles.sectionLabel}>NEXT STEPS</Text>
      <View style={styles.steps}>
        {NEXT_STEPS.map((step) => (
          <View key={step.number} style={styles.step}>
            <View
              style={styles.stepNumber}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <Text style={styles.stepNumberText}>{step.number}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
            <Pill text="Soon" tone="grey" />
          </View>
        ))}
      </View>
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
  loading: { marginTop: 32 },
  retry: { marginTop: 12 },
  details: { ...cardStyle, marginTop: 16, paddingVertical: 6 },
  row: { paddingVertical: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.chip },
  rowLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  rowValue: { marginTop: 4, fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  sectionLabel: {
    marginTop: 22,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.muted,
  },
  steps: { marginTop: 10, gap: 10 },
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
