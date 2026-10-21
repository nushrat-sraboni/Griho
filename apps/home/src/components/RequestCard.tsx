// apps/home/src/components/RequestCard.tsx
//
// One join request waiting for an owner's answer: who asked, what they would
// become ("Tenant · Flat A-2" or "Owner"), how long ago, and two buttons:
// "Say yes" and "Say no". While an answer is being sent, the buttons are off.
// Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';
import type { PendingRequestForApprover } from '@griho/shared';

import { roleWords, timeAgo } from '../joining';
import { colors, fonts } from '../theme';
import Avatar from './Avatar';
import Button from './Button';
import Pill from './Pill';

type Props = {
  request: PendingRequestForApprover;
  /** True while an answer for this request is being sent. */
  busy: boolean;
  onYes: () => void;
  onNo: () => void;
};

export default function RequestCard({ request, busy, onYes, onNo }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar name={request.requester_name} />
        <View style={styles.middle}>
          <Text style={styles.name} numberOfLines={1}>
            {request.requester_name}
          </Text>
          <View style={styles.pill}>
            <Pill text={roleWords(request.role, request.flat_label)} />
          </View>
        </View>
        <Text style={styles.when}>{timeAgo(request.created_at, new Date())}</Text>
      </View>
      <View style={styles.buttons}>
        <View style={styles.half}>
          <Button compact label="Say yes" disabled={busy} onPress={onYes} />
        </View>
        <View style={styles.half}>
          <Button compact variant="outline" label="Say no" disabled={busy} onPress={onNo} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  middle: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  pill: { marginTop: 4, alignSelf: 'flex-start' },
  when: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  buttons: { marginTop: 14, flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
});
