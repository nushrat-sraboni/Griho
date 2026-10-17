// apps/staff/src/screens/ManagerWorkspace.tsx
//
// Everything a manager sees once they belong to a building: the four screens of the
// manager workspace (Overview, Access, Guards, Messages) and the bottom menu that
// switches between them. Overview and Access are built. Guards and Messages show a
// short "coming next" note for now. When something changes on the Access screen
// (a request answered, a code made), the Overview numbers and the little badge on
// the Access tab are read again. Owned by Sraboni.

import { useEffect, useState } from 'react';

import BottomNav, { type ManagerTab } from '../components/BottomNav';
import Screen from '../components/Screen';
import { getManagerCounts, type Membership } from '../fakeBackend';
import AccessScreen from './AccessScreen';
import ComingNextScreen from './ComingNextScreen';
import ManagerOverviewScreen from './ManagerOverviewScreen';

type Props = {
  displayName: string;
  membership: Membership;
  onLeft: () => void;
  onLogOut: () => void;
};

export default function ManagerWorkspace({ displayName, membership, onLeft, onLogOut }: Props) {
  const [tab, setTab] = useState<ManagerTab>('overview');
  // Goes up by one whenever the numbers might have changed.
  const [refreshKey, setRefreshKey] = useState(0);
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getManagerCounts()
      .then((counts) => {
        if (!cancelled) setWaiting(counts.waiting);
      })
      .catch(() => {
        // The screens show their own errors, so the badge just stays as it was.
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <Screen footer={<BottomNav current={tab} onChange={setTab} accessBadge={waiting} />}>
      {tab === 'overview' ? (
        <ManagerOverviewScreen
          displayName={displayName}
          membership={membership}
          refreshKey={refreshKey}
          onGoToAccess={() => setTab('access')}
          onLeft={onLeft}
          onLogOut={onLogOut}
        />
      ) : null}
      {tab === 'access' ? (
        <AccessScreen displayName={displayName} onChanged={() => setRefreshKey((k) => k + 1)} />
      ) : null}
      {tab === 'guards' ? (
        <ComingNextScreen
          displayName={displayName}
          eyebrow="Your team"
          title="Guards."
          text="The list of guards, and removing a guard, are coming in the next step."
        />
      ) : null}
      {tab === 'messages' ? (
        <ComingNextScreen
          displayName={displayName}
          eyebrow="Private communication"
          title="Messages."
          text="Chats with owners and tenants are coming in a later step."
        />
      ) : null}
    </Screen>
  );
}
