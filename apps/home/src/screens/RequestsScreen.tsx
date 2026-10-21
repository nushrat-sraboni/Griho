// apps/home/src/screens/RequestsScreen.tsx
//
// The join requests waiting for an owner's answer. Each one shows who asked and
// what they would become, with "Say yes" and "Say no". The first answer wins:
// if another owner answered first, a plain sentence says so. Saying yes uses up
// one slot of the person's code; saying no uses nothing (PRD 5.5). The building
// bar stays at the top so the building's name is always visible. Owned by Bishal.

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { PendingRequestForApprover } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import Button from '../components/Button';
import Eyebrow from '../components/Eyebrow';
import Notice from '../components/Notice';
import RequestCard from '../components/RequestCard';
import Screen from '../components/Screen';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import { declinedMessage, joinedMessage, requestsCountSentence } from '../joining';
import { cardStyle, colors, fonts } from '../theme';
import { useLoad } from '../useLoad';

type Props = {
  membership: MembershipWithLastOwner;
  onBack: () => void;
  onSwitch: () => void;
};

export default function RequestsScreen({ membership, onBack, onSwitch }: Props) {
  const {
    data: requests,
    error: loadError,
    loading,
    reload,
  } = useLoad(() => api.listPendingJoinRequests({ building_id: membership.building.id }));
  const [notice, setNotice] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function answer(request: PendingRequestForApprover, decision: 'approve' | 'reject') {
    setNotice(null);
    setAnswerError(null);
    setBusyId(request.request_id);
    try {
      await api.decideJoinRequest({ request_id: request.request_id, decision });
      setNotice(
        decision === 'approve'
          ? joinedMessage(request, membership.building.name)
          : declinedMessage(request),
      );
    } catch (caught) {
      setAnswerError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusyId(null);
      reload(); // Always show the latest list, even after a failed answer.
    }
  }

  return (
    <Screen>
      <BuildingBar
        buildingName={membership.building.name}
        roleText={roleLabel(membership)}
        onSwitch={onSwitch}
      />
      <BackLink label={membership.building.name} onPress={onBack} />

      {notice ? <Notice kind="success" text={notice} /> : null}
      {answerError ? <Notice kind="error" text={answerError} /> : null}

      <View style={styles.eyebrow}>
        <Eyebrow text="JOIN REQUESTS" />
      </View>
      <Text style={styles.title}>Waiting for you</Text>
      {requests ? (
        <Text style={styles.subtitle}>{requestsCountSentence(requests.length)}</Text>
      ) : null}

      {loading && !requests ? (
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

      {requests && requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>All answered</Text>
          <Text style={styles.emptyBody}>New requests will show up here.</Text>
        </View>
      ) : null}

      {requests && requests.length > 0 ? (
        <>
          <View style={styles.list}>
            {requests.map((request) => (
              <RequestCard
                key={request.request_id}
                request={request}
                busy={busyId !== null}
                onYes={() => answer(request, 'approve')}
                onNo={() => answer(request, 'reject')}
              />
            ))}
          </View>
          <Notice
            kind="info"
            text="Saying yes uses up one slot of the person's code. Saying no does not."
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: 18 },
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
  emptyBody: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
});
