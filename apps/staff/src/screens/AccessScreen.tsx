// apps/staff/src/screens/AccessScreen.tsx
//
// The manager's "Guard access" screen, matching the design. It has two cards:
//   - Requests waiting: each guard who used a code, with Approve and Reject buttons.
//   - Guard codes: every code with how many times it was used, a status badge, a
//     Disable / Enable button, and a "New code" button to make another.
// Approving uses up one use of the code. Rejecting uses up nothing. A code that can
// still be used has a "Share code" link that opens the phone's share sheet. Disabling a code
// only blocks new requests. The data comes from the pretend backend until the real
// one exists. Owned by Sraboni.

import type { CodeInfo, PendingRequestForApprover } from '@griho/shared';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import Eyebrow from '../components/Eyebrow';
import Field from '../components/Field';
import {
  createCode,
  decideJoinRequest,
  listCodes,
  listPendingJoinRequests,
  setCodeStatus,
} from '../fakeBackend';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { guardCodeMessage, timeAgo } from '../text';

type Props = {
  displayName: string;
  /** The building's name, used in the message when a code is shared. */
  buildingName: string;
  /** Called after anything changes, so other screens can read the new numbers. */
  onChanged: () => void;
};

export default function AccessScreen({ displayName, buildingName, onChanged }: Props) {
  const [requests, setRequests] = useState<PendingRequestForApprover[]>([]);
  const [codes, setCodes] = useState<CodeInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [making, setMaking] = useState(false);
  const [maxUses, setMaxUses] = useState('1');

  const refresh = useCallback(async () => {
    try {
      const [newRequests, newCodes] = await Promise.all([listPendingJoinRequests(), listCodes()]);
      setRequests(newRequests);
      setCodes(newCodes);
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Runs one change, then reloads both lists and tells the other screens.
  async function run(id: string, action: () => Promise<unknown>) {
    setError(null);
    setBusyId(id);
    try {
      await action();
      await refresh();
      onChanged();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  // Opens the phone's own share sheet (which also has "Copy") with a ready-made message.
  async function handleShare(code: CodeInfo) {
    try {
      await Share.share({ message: guardCodeMessage(code.value, buildingName) });
    } catch {
      // The person closed the share sheet or sharing is not available: nothing to fix.
    }
  }

  async function handleCreate() {
    await run('new-code', async () => {
      await createCode(Number(maxUses));
      setMaking(false);
      setMaxUses('1');
    });
  }

  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>Controlled access</Eyebrow>
      <Text style={styles.title}>Guard access.</Text>
      <Text style={styles.subtitle}>Codes let people ask to join. You say yes or no.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <View style={local.cardHead}>
          <Text style={local.cardTitle}>Requests waiting</Text>
          {requests.length > 0 ? (
            <Text style={local.pendingBadge}>{requests.length} pending</Text>
          ) : null}
        </View>

        {requests.length === 0 ? (
          <Text style={local.empty}>No requests are waiting right now.</Text>
        ) : (
          requests.map((request, index) => (
            <View
              key={request.request_id}
              style={[local.request, index > 0 && local.requestDivider]}
            >
              <View style={local.requestTop}>
                <Avatar name={request.requester_name} />
                <View style={local.requestText}>
                  <Text style={local.name}>{request.requester_name}</Text>
                  <Text style={local.detail}>Guard · {timeAgo(request.created_at)}</Text>
                </View>
              </View>
              <View style={local.buttons}>
                <View style={local.buttonCell}>
                  <PrimaryButton
                    compact
                    label="Approve"
                    disabled={busyId === request.request_id}
                    onPress={() =>
                      run(request.request_id, () =>
                        decideJoinRequest(request.request_id, 'approve'),
                      )
                    }
                  />
                </View>
                <View style={local.buttonCell}>
                  <OutlineButton
                    compact
                    label="Reject"
                    disabled={busyId === request.request_id}
                    onPress={() =>
                      run(request.request_id, () => decideJoinRequest(request.request_id, 'reject'))
                    }
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <View style={local.cardHead}>
          <Text style={local.cardTitle}>Guard codes</Text>
          <Pressable
            style={local.newCode}
            onPress={() => setMaking((m) => !m)}
            accessibilityRole="button"
          >
            <Text style={local.newCodeText}>{making ? 'Close' : '+ New code'}</Text>
          </Pressable>
        </View>

        {making ? (
          <View style={local.makeForm}>
            <Field
              label="How many people can use it?"
              value={maxUses}
              onChangeText={setMaxUses}
              keyboardType="number-pad"
            />
            <View style={local.makeButton}>
              <PrimaryButton
                compact
                label={busyId === 'new-code' ? 'Making...' : 'Make code'}
                disabled={busyId === 'new-code' || !maxUses.trim()}
                onPress={handleCreate}
              />
            </View>
          </View>
        ) : null}

        {codes.length === 0 ? (
          <Text style={local.empty}>No codes yet. Tap "New code" to make one.</Text>
        ) : (
          codes.map((code, index) => {
            const active = code.status === 'active';
            return (
              <View key={code.id} style={[local.codeRow, index > 0 && local.requestDivider]}>
                <View style={local.requestText}>
                  <Text style={[local.codeValue, !active && { color: colors.muted }]}>
                    {code.value}
                  </Text>
                  <Text style={local.detail}>
                    {code.used_count} / {code.max_uses} used
                  </Text>
                  {active && code.remaining > 0 ? (
                    <Pressable
                      onPress={() => handleShare(code)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 20 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Share code ${code.value}`}
                    >
                      <Text style={local.shareLink}>Share code</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text style={[styles.badge, !active && local.badgeOff]}>
                  {active ? 'Active' : 'Disabled'}
                </Text>
                <View style={local.codeButton}>
                  <OutlineButton
                    compact
                    label={active ? 'Disable' : 'Enable'}
                    disabled={busyId === code.id}
                    onPress={() =>
                      run(code.id, () => setCodeStatus(code.id, active ? 'disabled' : 'active'))
                    }
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      <Text style={styles.note}>
        A code is only used up when you approve a request. Turning a code off blocks new requests
        only. Guards who already joined keep their access.
      </Text>
    </>
  );
}

const local = StyleSheet.create({
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  pendingBadge: {
    backgroundColor: colors.sand,
    color: '#8a5a1c',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 14 },
  request: { marginTop: 14 },
  requestDivider: { borderTopWidth: 1, borderTopColor: '#eff2ee', paddingTop: 14 },
  requestTop: { flexDirection: 'row', alignItems: 'center' },
  requestText: { flex: 1, marginLeft: 12 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  buttons: { flexDirection: 'row', marginTop: 10, marginHorizontal: -4 },
  buttonCell: { flex: 1, marginHorizontal: 4 },
  newCode: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCodeText: { color: colors.green, fontSize: 13, fontWeight: '800' },
  makeForm: { marginBottom: 4 },
  makeButton: { marginTop: 14 },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, minHeight: 56 },
  codeValue: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  shareLink: { color: colors.green, fontSize: 12, fontWeight: '800', marginTop: 6 },
  badgeOff: { backgroundColor: colors.softGrey, color: colors.muted },
  codeButton: { marginLeft: 8, width: 92 },
});
