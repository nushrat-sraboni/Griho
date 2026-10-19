// apps/home/src/screens/CodesScreen.tsx
//
// The list of join codes in a building, for its owners. Each code shows its
// kind, whether it is Active, Turned off or Used up, and how many uses are left.
// Tapping a code opens it. "Make a code" is at the bottom. The building bar stays
// at the top so the building's name is always visible. After an action, a green
// message says it worked. Owned by Bishal.

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { CodeInfo } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import CodeCard from '../components/CodeCard';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { codesCountSentence } from '../codes';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  /** A green "it worked" sentence to show at the top, or null. */
  notice: string | null;
  onBack: () => void;
  onSwitch: () => void;
  onMake: () => void;
  onOpen: (code: CodeInfo) => void;
};

export default function CodesScreen({
  membership,
  notice,
  onBack,
  onSwitch,
  onMake,
  onOpen,
}: Props) {
  const {
    data: codes,
    error,
    loading,
    reload,
  } = useLoad(() => api.listCodes({ building_id: membership.building.id }));

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
        <Eyebrow text="JOIN CODES" />
      </View>
      <Text style={styles.title}>Your codes</Text>
      {codes ? <Text style={styles.subtitle}>{codesCountSentence(codes)}</Text> : null}

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

      {codes && codes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No codes yet</Text>
          <Text style={styles.emptyBody}>
            Make a code and share it, so people can ask to join your building.
          </Text>
        </View>
      ) : null}

      {codes && codes.length > 0 ? (
        <View style={styles.list}>
          {codes.map((code) => (
            <CodeCard key={code.id} code={code} onPress={() => onOpen(code)} />
          ))}
        </View>
      ) : null}

      <View style={styles.spacer} />
      <Button label="Make a code" onPress={onMake} />
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
  spacer: { flexGrow: 1, minHeight: 24 },
});
