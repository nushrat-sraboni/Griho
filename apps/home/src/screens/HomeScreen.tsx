// apps/home/src/screens/HomeScreen.tsx
//
// The first screen after logging in to Griho Home. It greets the person, shows
// the date, and (because there are no building screens yet) invites them to
// make or join a building. The two building buttons only say "coming soon" for
// now; the real screens are built in later steps. There is also a Log out
// button. Owned by Bishal.

import { Alert, StyleSheet, Text, View } from 'react-native';
import type { Account } from '@griho/shared';

import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import HouseDrawing from '../components/HouseDrawing';
import Logo from '../components/Logo';
import Screen from '../components/Screen';
import TealCard from '../components/TealCard';
import { formatEyebrowDate, getGreeting } from '../greeting';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  account: Account;
  onLogOut: () => void;
};

function showComingSoon() {
  Alert.alert('Coming soon', 'This part is built in a later step.');
}

export default function HomeScreen({ account, onLogOut }: Props) {
  const now = new Date();
  const firstLetter = account.display_name.trim().charAt(0).toUpperCase();

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
      <Text style={styles.subtitle}>Your home, your community, all in one place.</Text>

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
          <Button variant="light" compact arrow label="Create building" onPress={showComingSoon} />
          <Button variant="ghost" compact label="Join with code" onPress={showComingSoon} />
        </View>
      </TealCard>

      <View style={styles.buildings}>
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
        <View style={styles.buildingsText}>
          <Text style={styles.buildingsTitle}>Your buildings</Text>
          <Text style={styles.buildingsBody}>Buildings you make or join will show up here.</Text>
        </View>
      </View>

      <View style={styles.spacer} />
      <Button variant="outline" label="Log out" onPress={onLogOut} />
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
  buildings: {
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
  buildingsText: { flex: 1 },
  buildingsTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  buildingsBody: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
  },
  spacer: { flexGrow: 1, minHeight: 16 },
});
