// apps/home/src/screens/LeaveBuildingScreen.tsx
//
// Asks the person to confirm leaving a building. What it says depends on who
// they are:
//   - anyone else: they lose access right away, and their old messages stay
//     marked "Former member" (PRD 5.8)
//   - an owner, with other owners staying: also, their flats will have no owner
//     and the people living in those flats lose access (PRD 5.9)
//   - the ONLY owner: a strong red warning that the whole building is deleted
//     forever, with no undo (PRD 5.10)
// The person must type their own name before the red button works. The backend
// checks the name again. Owned by Bishal.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import type { Account } from '@griho/shared';

import { api, type LeaveBuildingResult, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { typedNameMatches } from '../people';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  account: Account;
  /** Stay: go back to the building. */
  onBack: () => void;
  onSwitch: () => void;
  /** Called after leaving, with what happened, so the app can show a message. */
  onLeft: (result: LeaveBuildingResult['result']) => void;
};

export default function LeaveBuildingScreen({
  membership,
  account,
  onBack,
  onSwitch,
  onLeft,
}: Props) {
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const name = membership.building.name;
  const lastOwner = membership.is_last_owner;
  const owner = membership.role === 'owner';
  const ready = typedNameMatches(typed, account.display_name);

  async function handleLeave() {
    setError(null);
    setBusy(true);
    try {
      const result = await api.leaveBuilding({
        building_id: membership.building.id,
        typed_name: typed,
      });
      onLeft(result.result);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <BuildingBar buildingName={name} roleText={roleLabel(membership)} onSwitch={onSwitch} />
      <BackLink label={name} onPress={onBack} />

      <View style={styles.eyebrow}>
        <Eyebrow text="LEAVE A BUILDING" />
      </View>
      <Text style={styles.title}>Leave {name}?</Text>
      {lastOwner ? null : (
        <Text style={styles.subtitle}>You can ask to join again later with a new code.</Text>
      )}

      <View style={styles.card}>
        {lastOwner ? (
          <View style={styles.danger} accessibilityRole="alert">
            <Svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.errorText}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M12 3 L22 20 H2 Z" />
              <Line x1={12} y1={10} x2={12} y2={14} />
              <Line x1={12} y1={17} x2={12.01} y2={17} />
            </Svg>
            <Text style={styles.dangerText}>
              <Text style={styles.bold}>You are the only owner.</Text> If you leave, {name} is
              deleted <Text style={styles.bold}>forever</Text>: all its flats, codes, requests,
              people and messages. There is no undo.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.body}>
              You <Text style={styles.bold}>lose access to {name} right away</Text>. Other buildings
              you are in are not affected.
            </Text>
            {owner ? (
              <Notice
                kind="info"
                text="Your flats will have no owner, and the people who live in them lose access. Another owner can claim those flats."
              />
            ) : null}
            <Notice
              kind="info"
              text={`Your old messages stay in the chats, marked "Former member".`}
            />
          </>
        )}

        {error ? <Notice kind="error" text={error} /> : null}

        <TextField
          label="Type your name to confirm"
          value={typed}
          onChangeText={setTyped}
          placeholder={account.display_name}
          autoComplete="off"
          hint="Capital letters and extra spaces do not matter."
        />

        <View style={styles.buttonSpace}>
          <Button
            variant="danger"
            label={lastOwner ? `Delete ${name} and leave` : `Leave ${name}`}
            disabled={!ready}
            busy={busy}
            busyLabel="Leaving..."
            onPress={handleLeave}
          />
        </View>
        <TextLink label={lastOwner ? 'Keep my building' : 'Stay'} onPress={onBack} />
      </View>
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
  card: { ...cardStyle, marginTop: 20 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  bold: { fontFamily: fonts.bold },
  danger: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.errorBackground,
  },
  dangerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.errorText,
  },
  buttonSpace: { marginTop: 20 },
});
