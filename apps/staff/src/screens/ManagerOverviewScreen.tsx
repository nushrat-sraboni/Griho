// apps/staff/src/screens/ManagerOverviewScreen.tsx
//
// The manager's first screen, matching the "Manager overview" design: a greeting,
// the building name, a green banner saying how many guards are waiting for a yes
// (with a button to the Access screen), and four number cards. The leave and log-out
// buttons sit at the very bottom. The numbers come from the pretend backend until
// the real one exists. Owned by Sraboni.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import HeroCard from '../components/HeroCard';
import LeaveSection from '../components/LeaveSection';
import { getManagerCounts, type Membership } from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { greetingFor } from '../text';

type Counts = Awaited<ReturnType<typeof getManagerCounts>>;

type Props = {
  displayName: string;
  membership: Membership;
  /** Changes whenever the numbers might have changed, so this screen reads them again. */
  refreshKey: number;
  onGoToAccess: () => void;
  onLeft: () => void;
  onLogOut: () => void;
};

// One number card: a coloured square, a big number, and a small grey label.
function StatCard({
  tint,
  accent,
  value,
  label,
}: {
  tint: string;
  accent: string;
  value: number;
  label: string;
}) {
  return (
    <View style={local.stat}>
      <View style={[local.statIcon, { backgroundColor: tint }]}>
        <View style={[local.statIconInner, { backgroundColor: accent }]} />
      </View>
      <Text style={local.statValue}>{value}</Text>
      <Text style={local.statLabel}>{label}</Text>
    </View>
  );
}

export default function ManagerOverviewScreen({
  displayName,
  membership,
  refreshKey,
  onGoToAccess,
  onLeft,
  onLogOut,
}: Props) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getManagerCounts()
      .then((result) => {
        if (!cancelled) setCounts(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(friendlyErrorMessage(caught as { message?: string }));
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const firstName = displayName.trim().split(' ')[0];
  const waiting = counts?.waiting ?? 0;
  const heroTitle =
    waiting === 0
      ? 'You are all caught up.'
      : `${waiting} guard${waiting === 1 ? ' is' : 's are'} waiting for a yes.`;

  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>Manager workspace</Eyebrow>
      <Text style={styles.title}>
        {greetingFor(new Date().getHours())}, {firstName}
      </Text>
      <View style={local.buildingPill}>
        <Text style={local.buildingPillText}>{membership.building_name}</Text>
      </View>

      <HeroCard
        label="Needs your attention"
        title={heroTitle}
        detail={waiting === 0 ? 'No guard requests are waiting.' : undefined}
      >
        {waiting > 0 ? (
          <Pressable style={local.heroButton} onPress={onGoToAccess} accessibilityRole="button">
            <Text style={local.heroButtonText}>Review requests →</Text>
          </Pressable>
        ) : null}
      </HeroCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={local.grid}>
        <StatCard
          tint={colors.mint}
          accent={colors.green}
          value={counts?.guards ?? 0}
          label="Active guards"
        />
        <StatCard
          tint={colors.sand}
          accent={colors.gold}
          value={waiting}
          label="Waiting for a yes"
        />
        <StatCard
          tint="#eae8f6"
          accent="#5d5994"
          value={counts?.codesInUse ?? 0}
          label="Guard codes in use"
        />
        <StatCard tint="#f8e8e2" accent="#9a4d3a" value={counts?.chats ?? 0} label="Open chats" />
      </View>

      <View style={styles.spacer} />
      <LeaveSection
        displayName={displayName}
        buildingName={membership.building_name}
        onLeft={onLeft}
        onLogOut={onLogOut}
      />
    </>
  );
}

const local = StyleSheet.create({
  buildingPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 14,
  },
  buildingPillText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 14,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginTop: 16,
  },
  heroButtonText: { color: colors.green, fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 },
  stat: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconInner: { width: 14, height: 14, borderRadius: 5 },
  statValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 8,
  },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
