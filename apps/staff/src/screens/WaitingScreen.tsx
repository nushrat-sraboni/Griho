// apps/staff/src/screens/WaitingScreen.tsx
//
// The "waiting for approval" screen of Griho Staff. A green banner shows which
// building the person asked to join, and a short list of steps shows where things
// stand: request sent, waiting for a yes, building opens. Nothing else can be done
// here until the request is answered. While the app is being built, a "testing
// only" button pretends someone said yes. The look follows the Griho Staff design.
// Owned by Sraboni.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import Brand from '../components/Brand';
import { OutlineButton } from '../components/Buttons';
import Eyebrow from '../components/Eyebrow';
import HeroCard from '../components/HeroCard';
import Screen from '../components/Screen';
import type { JoinRequestResult } from '../fakeBackend';
import { colors, styles } from '../styles';

type Props = {
  request: JoinRequestResult;
  onLogOut: () => void;
  /** Testing only: pretends someone approved the request. Shown only while developing. */
  onPretendApproved?: () => void;
};

type StepState = 'done' | 'current' | 'next';

// One row of the progress list: a round marker, a bold line, and a small grey line.
function Step({
  state,
  title,
  detail,
  last,
}: {
  state: StepState;
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <View style={local.stepRow}>
      <View style={local.markerColumn}>
        <View
          style={[
            local.marker,
            state === 'done' && local.markerDone,
            state === 'current' && local.markerCurrent,
            state === 'next' && local.markerNext,
          ]}
        >
          {state === 'done' ? <Text style={local.tick}>✓</Text> : null}
          {state === 'current' ? <View style={local.currentDot} /> : null}
        </View>
        {last ? null : <View style={[local.rail, state === 'done' && local.railDone]} />}
      </View>
      <View style={local.stepText}>
        <Text style={[local.stepTitle, state === 'next' && { color: colors.muted }]}>{title}</Text>
        <Text style={local.stepDetail}>{detail}</Text>
      </View>
    </View>
  );
}

export default function WaitingScreen({ request, onLogOut, onPretendApproved }: Props) {
  const roleWords = request.role === 'manager' ? 'Manager' : 'Guard';

  return (
    <Screen>
      <Brand />
      <Eyebrow>Request sent</Eyebrow>
      <Text style={styles.title}>Waiting for approval.</Text>
      <Text style={styles.subtitle}>Someone in charge needs to say yes first.</Text>

      <HeroCard label="You asked to join" title={request.building_name}>
        <View style={local.pill}>
          <View style={local.pillDot} />
          <Text style={local.pillText}>{roleWords} · Pending</Text>
        </View>
      </HeroCard>

      <View style={styles.card}>
        <Step state="done" title="Request sent" detail="Your code was accepted." />
        <Step
          state="current"
          title="Waiting for a yes"
          detail="An owner or the manager will answer."
        />
        <Step
          state="next"
          title="Your building opens"
          detail="You will see it here once you are in."
          last
        />
      </View>

      <Text style={styles.note}>Your code is only used up once you are approved.</Text>

      {onPretendApproved ? (
        <Pressable onPress={onPretendApproved} accessibilityRole="button">
          <Text style={styles.link}>Testing only: pretend I was approved</Text>
        </Pressable>
      ) : null}

      <View style={styles.spacer} />
      <OutlineButton label="Log out" onPress={onLogOut} />
    </Screen>
  );
}

const local = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 14,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.goldDot,
    marginRight: 8,
  },
  pillText: { color: colors.green, fontSize: 12, fontWeight: '800' },
  stepRow: { flexDirection: 'row' },
  markerColumn: { alignItems: 'center', marginRight: 14 },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: colors.green },
  markerCurrent: { backgroundColor: colors.sand, borderWidth: 2, borderColor: colors.gold },
  markerNext: { backgroundColor: '#eef1ed', borderWidth: 2, borderColor: '#d8dfd9' },
  tick: { color: colors.white, fontSize: 14, fontWeight: '800' },
  currentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  rail: { width: 2, flex: 1, minHeight: 28, backgroundColor: '#e0e6e1' },
  railDone: { backgroundColor: colors.green },
  stepText: { flex: 1, paddingTop: 3, paddingBottom: 14 },
  stepTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  stepDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
