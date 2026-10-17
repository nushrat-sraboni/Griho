// apps/home/App.tsx
//
// The main entry of Griho Home (owners and tenants). It loads the app's font,
// then decides which screen to show:
//   log in / sign up   : before the person is logged in
//   My buildings       : the list of their buildings (the first screen after logging in)
//   Create a building  : the form to make a new building
//   Building home      : one building, with its name always shown at the top
// It also remembers which building is "active" (open) while the app is running.
// Owned by Bishal.

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Account, Building } from '@griho/shared';

import { api, type MembershipWithLastOwner } from './src/api';
import { loadMembership } from './src/buildings';
import BuildingHomeScreen from './src/screens/BuildingHomeScreen';
import CreateBuildingScreen from './src/screens/CreateBuildingScreen';
import LogInScreen from './src/screens/LogInScreen';
import MyBuildingsScreen from './src/screens/MyBuildingsScreen';
import SignUpScreen from './src/screens/SignUpScreen';

type ScreenName = 'logIn' | 'signUp' | 'buildings' | 'createBuilding' | 'building';

/** The building that is open right now, and whether the person just made it. */
type ActiveBuilding = { membership: MembershipWithLastOwner; justCreated: boolean };

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [screen, setScreen] = useState<ScreenName>('logIn');
  const [account, setAccount] = useState<Account | null>(null);
  const [active, setActive] = useState<ActiveBuilding | null>(null);

  function handleLoggedIn(loggedIn: Account) {
    setAccount(loggedIn);
    setActive(null);
    setScreen('buildings');
  }

  async function handleLogOut() {
    await api.signOut();
    setAccount(null);
    setActive(null);
    setScreen('logIn');
  }

  function handleOpenBuilding(membership: MembershipWithLastOwner) {
    setActive({ membership, justCreated: false });
    setScreen('building');
  }

  async function handleCreated(building: Building) {
    const membership = await loadMembership(api, building.id);
    if (membership) {
      setActive({ membership, justCreated: true });
      setScreen('building');
    } else {
      setScreen('buildings');
    }
  }

  // Wait a moment for the font to load, so text never flashes in the wrong font.
  if (!fontsLoaded) return null;

  let content;
  if (account && screen === 'building' && active) {
    content = (
      <BuildingHomeScreen
        key={active.membership.building.id}
        membership={active.membership}
        justCreated={active.justCreated}
        onSwitch={() => setScreen('buildings')}
      />
    );
  } else if (account && screen === 'createBuilding') {
    content = (
      <CreateBuildingScreen onBack={() => setScreen('buildings')} onCreated={handleCreated} />
    );
  } else if (account && screen === 'buildings') {
    content = (
      <MyBuildingsScreen
        account={account}
        activeBuildingId={active?.membership.building.id ?? null}
        onOpenBuilding={handleOpenBuilding}
        onCreateBuilding={() => setScreen('createBuilding')}
        onLogOut={handleLogOut}
      />
    );
  } else if (screen === 'signUp') {
    content = <SignUpScreen onSignedUp={handleLoggedIn} onGoToLogIn={() => setScreen('logIn')} />;
  } else {
    content = <LogInScreen onLoggedIn={handleLoggedIn} onGoToSignUp={() => setScreen('signUp')} />;
  }

  return (
    <SafeAreaProvider>
      {content}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
