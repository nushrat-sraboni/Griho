// apps/home/src/screens/BuildingHomeScreen.tsx
//
// The home page of one building. The bar at the top always shows the building's
// name and the person's role (a product rule), with a "Switch" button back to
// the list of buildings. Below are the building's address and contact info,
// loaded from the backend.
// Owners also see two cards, each with a short count: "Flats" (opens the flats
// list) and "Join codes" (opens the codes list). Other roles see neither.
// Right after a building is created, a green "Your building is ready" message
// is shown. Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { CodeInfo, Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import MenuCard from '../components/MenuCard';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { codesSummary } from '../codes';
import { flatSummary } from '../flats';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** True right after the person made this building, to show the "ready" message. */
  justCreated: boolean;
  onSwitch: () => void;
  onOpenFlats: () => void;
  onOpenCodes: () => void;
};

/** The count line for a card: "Loading...", the summary, or a nudge to tap when loading failed. */
function cardLine<T>(
  load: { data: T | null; error: string | null },
  summarize: (data: T) => string,
  whenFailed: string,
): string {
  if (load.error) return whenFailed;
  if (load.data) return summarize(load.data);
  return 'Loading...';
}

export default function BuildingHomeScreen({
  membership,
  justCreated,
  onSwitch,
  onOpenFlats,
  onOpenCodes,
}: Props) {
  const isOwner = membership.role === 'owner';
  const buildingId = membership.building.id;
  const {
    data: building,
    error,
    loading,
    reload,
  } = useLoad(() => api.getBuilding({ building_id: buildingId }));
  const flatsLoad = useLoad<Flat[]>(() =>
    isOwner ? api.listFlats({ building_id: buildingId }) : Promise.resolve([]),
  );
  const codesLoad = useLoad<CodeInfo[]>(() =>
    isOwner ? api.listCodes({ building_id: buildingId }) : Promise.resolve([]),
  );
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

      {isOwner ? (
        <View style={styles.cards}>
          <MenuCard
            title="Flats"
            body={cardLine(flatsLoad, flatSummary, 'Tap to see your flats')}
            tileColor={colors.teal}
            onPress={onOpenFlats}
            icon={
              <View style={styles.windows}>
                <View style={styles.window} />
                <View style={[styles.window, styles.windowLit]} />
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            }
          />
          <MenuCard
            title="Join codes"
            body={cardLine(codesLoad, codesSummary, 'Tap to see your codes')}
            tileColor={colors.amber}
            onPress={onOpenCodes}
            icon={
              <Svg
                width={26}
                height={26}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.onAmber}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Circle cx={8} cy={15} r={4} />
                <Path d="M11 12.5 L20 4" />
                <Path d="M16 8 L19 11" />
              </Svg>
            }
          />
        </View>
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
  cards: { marginTop: 16, gap: 12 },
  windows: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 9,
  },
  window: { width: 11, height: 11, borderRadius: 3, backgroundColor: colors.page },
  windowLit: { backgroundColor: colors.amber },
  loading: { marginTop: 32 },
  retry: { marginTop: 12 },
  details: { ...cardStyle, marginTop: 16, paddingVertical: 6 },
  row: { paddingVertical: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.chip },
  rowLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  rowValue: { marginTop: 4, fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
});
