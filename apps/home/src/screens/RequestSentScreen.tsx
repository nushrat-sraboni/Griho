// apps/home/src/screens/RequestSentScreen.tsx
//
// Shown right after a join request is sent. It says plainly that the person must
// wait for an owner to answer, names the building and what they asked to be
// ("Tenant · Flat A-1"), and reminds them that the code was NOT used up: a use
// is counted only when an owner says yes. Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import type { SubmitJoinRequestResult } from '../api';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import HouseDrawing from '../components/HouseDrawing';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Pill from '../components/Pill';
import Screen from '../components/Screen';
import TealCard from '../components/TealCard';
import { roleWords } from '../joining';
import { colors, fonts } from '../theme';

type Props = {
  result: SubmitJoinRequestResult;
  onDone: () => void;
};

export default function RequestSentScreen({ result, onDone }: Props) {
  return (
    <Screen>
      <Logo />

      <View style={styles.eyebrow}>
        <Eyebrow text="REQUEST SENT" />
      </View>
      <Text style={styles.title}>Waiting for an answer</Text>
      <Text style={styles.subtitle}>Your request is on its way.</Text>

      <TealCard circle="top" style={styles.card}>
        <View style={styles.house}>
          <HouseDrawing width={116} height={94} />
        </View>
        <Text style={styles.cardLabel}>YOU ASKED TO JOIN</Text>
        <Text style={styles.cardTitle}>{result.building_name}</Text>
        <View style={styles.pill}>
          <Pill text={roleWords(result.role, result.flat_label)} tone="amber" />
        </View>
        <Text style={styles.cardBody}>
          An owner of this building will look at your request. When they say yes, the building shows
          up in your list.
        </Text>
      </TealCard>

      <Notice
        kind="success"
        text="The code was not used up. It only counts once an owner says yes."
      />

      <View style={styles.spacer} />
      <Button label="Back to my buildings" onPress={onDone} />
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
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  card: { marginTop: 20, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 },
  house: { position: 'absolute', right: 14, top: 20 },
  cardLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.onTealSoft,
  },
  cardTitle: {
    marginTop: 8,
    maxWidth: 190,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: colors.white,
  },
  pill: { marginTop: 10, alignSelf: 'flex-start' },
  cardBody: {
    marginTop: 14,
    maxWidth: 270,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onTealBody,
  },
  spacer: { flexGrow: 1, minHeight: 24 },
});
