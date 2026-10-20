// apps/staff/src/screens/GuardWorkspace.tsx
//
// Everything a guard sees once they belong to a building: the guard home screen and
// the Messages screens, with a two-tab bottom menu (Home and Messages). Guards can
// message anyone in their building and anyone can message them. Owned by Sraboni.

import { useState } from 'react';

import BottomNav, { GUARD_TABS, type GuardTab } from '../components/BottomNav';
import type { Membership } from '../fakeBackend';
import GuardHomeScreen from './GuardHomeScreen';
import MessagesFlow from './MessagesFlow';

type Props = {
  displayName: string;
  membership: Membership;
  onLeft: () => void;
  onLogOut: () => void;
};

export default function GuardWorkspace({ displayName, membership, onLeft, onLogOut }: Props) {
  const [tab, setTab] = useState<GuardTab>('home');
  const nav = <BottomNav tabs={GUARD_TABS} current={tab} onChange={setTab} />;

  if (tab === 'messages') {
    return (
      <MessagesFlow
        displayName={displayName}
        buildingName={membership.building_name}
        footer={nav}
        onChanged={() => {}}
      />
    );
  }

  return (
    <GuardHomeScreen
      displayName={displayName}
      membership={membership}
      footer={nav}
      onLeft={onLeft}
      onLogOut={onLogOut}
    />
  );
}
