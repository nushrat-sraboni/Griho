// apps/home/src/screens/DeleteAccountScreen.tsx
//
// Asks the person to confirm deleting their whole account. It says what happens
// (PRD 5.8): they are logged out and cannot log in again; in every building they
// are in they leave, and their old messages stay marked "Deleted account". If
// they are the ONLY owner of some buildings, those buildings are deleted forever,
// and the screen lists them in red (PRD 5.10). The buildings come from
// getMyMemberships, which says "is_last_owner" for each one. The person must type
// their own name before the red button works. Owned by Bishal.

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import type { Account } from '@griho/shared';

import { api } from '../api';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Logo from '../components/Logo';
import Notice from '../components/Notice';
import Pill from '../components/Pill';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import TextLink from '../components/TextLink';
import { friendlyErrorMessage } from '../friendlyMessages';
import { buildingsThatWouldBeDeleted, buildingsThatWouldBeLeft, typedNameMatches } from '../people';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  account: Account;
  /** Keep my account: go back to my buildings. */
  onBack: () => void;
  /** Called after the account is deleted, so the app can go back to log in. */
  onDeleted: () => void;
};

export default function DeleteAccountScreen({ account, onBack, onDeleted }: Props) {
  const {
    data: memberships,
    error: loadError,
    loading,
    reload,
  } = useLoad(() => api.getMyMemberships());
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = typedNameMatches(typed, account.display_name);

  const deleted = memberships ? buildingsThatWouldBeDeleted(memberships) : [];
  const left = memberships ? buildingsThatWouldBeLeft(memberships) : [];

  async function handleDelete() {
    setError(null);
    setBusy(true);
    try {
      await api.deleteAccount({ typed_name: typed });
      onDeleted();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <BackButton label="Back to my buildings" onPress={onBack} />
        <Logo />
      </View>

      <View style={styles.eyebrow}>
        <Eyebrow text="DELETE MY ACCOUNT" />
      </View>
      <Text style={styles.title}>Delete your account?</Text>
      <Text style={styles.subtitle}>You will be logged out and cannot log in again.</Text>

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          color={colors.teal}
          accessibilityLabel="Loading"
        />
      ) : null}

      {loadError ? (
        <View>
          <Notice kind="error" text={loadError} />
          <View style={styles.retry}>
            <Button variant="outline" label="Try again" onPress={reload} />
          </View>
        </View>
      ) : null}

      {memberships ? (
        <View style={styles.card}>
          {deleted.length > 0 ? (
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
                You are the <Text style={styles.bold}>only owner of {deleted.join(' and ')}</Text>,
                so {deleted.length === 1 ? 'it' : 'they'} will be{' '}
                <Text style={styles.bold}>deleted forever</Text> with all flats, codes, people and
                messages.
              </Text>
            </View>
          ) : null}

          {deleted.length + left.length > 0 ? (
            <>
              <Text style={styles.listLabel}>BUILDINGS THAT ARE AFFECTED</Text>
              <View style={styles.list}>
                {deleted.map((name) => (
                  <View key={name} style={[styles.item, styles.itemDanger]}>
                    <Text style={[styles.itemName, styles.itemNameDanger]}>{name}</Text>
                    <Pill text="Deleted" tone="amber" />
                  </View>
                ))}
                {left.map((name) => (
                  <View key={name} style={styles.item}>
                    <Text style={styles.itemName}>{name}</Text>
                    <Pill text="You leave" tone="grey" />
                  </View>
                ))}
              </View>
              <Text style={styles.body}>
                In buildings that stay, your old messages remain, marked "Deleted account".
              </Text>
            </>
          ) : (
            <Text style={styles.bodyFirst}>You are not in any building right now.</Text>
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
              label="Delete my account"
              disabled={!ready}
              busy={busy}
              busyLabel="Deleting..."
              onPress={handleDelete}
            />
          </View>
          <TextLink label="Keep my account" onPress={onBack} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  card: { ...cardStyle, marginTop: 16 },
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
  bold: { fontFamily: fonts.bold },
  listLabel: {
    marginTop: 14,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.muted,
  },
  list: { marginTop: 8, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.fieldBackground,
  },
  itemDanger: { backgroundColor: colors.errorBackground },
  itemName: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  itemNameDanger: { color: colors.errorText },
  body: {
    marginTop: 14,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
  },
  bodyFirst: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  buttonSpace: { marginTop: 18 },
});
