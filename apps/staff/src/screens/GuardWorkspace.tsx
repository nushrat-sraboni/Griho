// apps/staff/src/screens/GuardWorkspace.tsx
//
// Everything a guard sees once they belong to a building: the guard home screen, the
// Messages screens, and the Settings screen, with a three-tab bottom menu (Home,
// Messages, Settings). Guards can message anyone in their building and anyone can
// message them. Leaving the building, logging out, and deleting the account are on
// the Settings tab. Owned by Sraboni.

import { useState } from 'react';

import BottomNav, { GUARD_TABS, type GuardTab } from '../components/BottomNav';
import Screen from '../components/Screen';
import type { Membership } from '../fakeBackend';
import GuardHomeScreen from './GuardHomeScreen';
import MessagesFlow from './MessagesFlow';
import SettingsScreen from './SettingsScreen';

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

  if (tab === 'settings') {
    return (
      <Screen footer={nav}>
        <SettingsScreen
          displayName={displayName}
          membership={membership}
          onLeft={onLeft}
          onLogOut={onLogOut}
        />
      </Screen>
    );
  }

  return <GuardHomeScreen displayName={displayName} membership={membership} footer={nav} />;
}
