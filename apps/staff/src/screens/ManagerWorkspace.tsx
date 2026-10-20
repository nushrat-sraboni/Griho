// apps/staff/src/screens/ManagerWorkspace.tsx
//
// Everything a manager sees once they belong to a building: the four screens of the
// manager workspace (Overview, Access, Guards, Messages) and the bottom menu that
// switches between them. When something changes (a request answered, a code made, a
// guard removed, a message sent), the Overview numbers and the little badge on the
// Access tab are read again. Owned by Sraboni.

import { useEffect, useState } from 'react';

import BottomNav, { MANAGER_TABS, type ManagerTab } from '../components/BottomNav';
import Screen from '../components/Screen';
import { getManagerCounts, type Membership } from '../fakeBackend';
import AccessScreen from './AccessScreen';
import GuardsScreen from './GuardsScreen';
import ManagerOverviewScreen from './ManagerOverviewScreen';
import MessagesFlow from './MessagesFlow';

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

  const changed = () => setRefreshKey((k) => k + 1);

  const nav = (
    <BottomNav tabs={MANAGER_TABS} current={tab} onChange={setTab} badges={{ access: waiting }} />
  );

  if (tab === 'messages') {
    return (
      <MessagesFlow
        displayName={displayName}
        buildingName={membership.building_name}
        footer={nav}
        onChanged={changed}
      />
    );
  }

  return (
    <Screen footer={nav}>
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
        <AccessScreen
          displayName={displayName}
          buildingName={membership.building_name}
          onChanged={changed}
        />
      ) : null}
      {tab === 'guards' ? (
        <GuardsScreen
          displayName={displayName}
          buildingName={membership.building_name}
          onChanged={changed}
        />
      ) : null}
    </Screen>
  );
}
