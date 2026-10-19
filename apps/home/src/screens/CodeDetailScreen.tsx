// apps/home/src/screens/CodeDetailScreen.tsx
//
// One join code, in big letters, with a Share button (it opens the phone's own
// share sheet). Below are its status, how many uses are used and left, and two
// actions: turn the code off or on, and delete it. Turning a code off blocks NEW
// requests only; people who already joined stay (PRD 5.4). Right after a code is
// made, a green message says so. The building bar stays at the top so the
// building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import type { CodeInfo } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import CodeBox from '../components/CodeBox';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import Pill, { type PillTone } from '../components/Pill';
import Screen from '../components/Screen';
import TextLink from '../components/TextLink';
import { roleLabel } from '../buildings';
import {
  codeStatus,
  codeTypeLabel,
  leftText,
  shareMessage,
  usedText,
  type CodeStatusTone,
} from '../codes';
import { friendlyErrorMessage } from '../friendlyMessages';
import { cardStyle, colors, fonts } from '../theme';

type Props = {
  membership: MembershipWithLastOwner;
  code: CodeInfo;
  /** True right after the code was made, to show the "Code made" message. */
  justMade: boolean;
  onBack: () => void;
  onSwitch: () => void;
  /** Go to the "Delete this code?" screen. The app passes along the latest version of the code. */
  onDelete: (code: CodeInfo) => void;
};

const STATUS_TONE: Record<CodeStatusTone, PillTone> = {
  active: 'green',
  off: 'grey',
  usedUp: 'amber',
};

export default function CodeDetailScreen({
  membership,
  code: firstCode,
  justMade,
  onBack,
  onSwitch,
  onDelete,
}: Props) {
  const [code, setCode] = useState(firstCode);
  const [message, setMessage] = useState<string | null>(
    justMade ? 'Code made. Share it with the person who should join.' : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const status = codeStatus(code);
  const isOff = code.status === 'disabled';

  async function handleShare() {
    try {
      await Share.share({ message: shareMessage(code, membership.building.name) });
    } catch {
      // The person closed the share sheet or sharing is not available: nothing to fix.
    }
  }

  async function handleToggle() {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const result = await api.setCodeStatus({
        code_id: code.id,
        status: isOff ? 'active' : 'disabled',
      });
      // Turning a code on or off answers with the updated code (only deleting answers { ok: true }).
      if ('id' in result) {
        setCode(result);
        setMessage(isOff ? 'Code turned on.' : null);
      }
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label="Join codes" onPress={onBack} />

      {message ? <Notice kind="success" text={message} /> : null}
      {isOff ? (
        <Notice
          kind="info"
          text="This code is turned off. No new requests can use it. People who already joined stay."
        />
      ) : null}
      {error ? <Notice kind="error" text={error} /> : null}

      <View style={styles.eyebrow}>
        <Eyebrow text={codeTypeLabel(code).toUpperCase()} />
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.cardLabel}>JOIN CODE</Text>
        <View style={styles.codeBox}>
          <CodeBox value={code.value} dimmed={isOff} />
        </View>
        <View style={styles.shareSpace}>
          <Button label="Share code" onPress={handleShare} />
        </View>
      </View>

      <View style={styles.details}>
        <View style={[styles.row, styles.rowLine]}>
          <Text style={styles.rowLabel}>STATUS</Text>
          <Pill text={status.text} tone={STATUS_TONE[status.tone]} />
        </View>
        <View style={[styles.row, styles.rowLine]}>
          <Text style={styles.rowLabel}>USED</Text>
          <Text style={styles.rowValue}>{usedText(code)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>LEFT</Text>
          <Text style={styles.rowValue}>{leftText(code)}</Text>
        </View>
      </View>
      <Text style={styles.footnote}>A use is counted only when you approve a request.</Text>

      <View style={styles.spacer} />
      <Button
        variant={isOff ? 'primary' : 'outline'}
        label={isOff ? 'Turn on this code' : 'Turn off this code'}
        busy={busy}
        busyLabel="Saving..."
        onPress={handleToggle}
      />
      <TextLink label="Delete code" danger onPress={() => onDelete(code)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 18 },
  codeCard: { ...cardStyle, marginTop: 14 },
  cardLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  codeBox: { marginTop: 8 },
  shareSpace: { marginTop: 16 },
  details: { ...cardStyle, marginTop: 16, paddingVertical: 6 },
  row: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.chip },
  rowLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  footnote: {
    marginTop: 12,
    marginHorizontal: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  spacer: { flexGrow: 1, minHeight: 24 },
});
