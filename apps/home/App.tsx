// apps/home/App.tsx
//
// The main entry of Griho Home (owners and tenants). It loads the app's font,
// then decides which screen to show:
//   log in / sign up   : before the person is logged in
//   My buildings       : the list of their buildings (the first screen after logging in)
//   Create a building  : the form to make a new building
//   Building home      : one building, with its name always shown at the top
//   Flats              : the owner's list of flats, with add, rename and claim screens
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
import type { Account, Building, Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from './src/api';
import { loadMembership } from './src/buildings';
import BuildingHomeScreen from './src/screens/BuildingHomeScreen';
import ClaimFlatScreen from './src/screens/ClaimFlatScreen';
import CreateBuildingScreen from './src/screens/CreateBuildingScreen';
import FlatFormScreen, { type FlatFormMode } from './src/screens/FlatFormScreen';
import FlatsScreen from './src/screens/FlatsScreen';
import LogInScreen from './src/screens/LogInScreen';
import MyBuildingsScreen from './src/screens/MyBuildingsScreen';
import SignUpScreen from './src/screens/SignUpScreen';

type ScreenName =
  | 'logIn'
  | 'signUp'
  | 'buildings'
  | 'createBuilding'
  | 'building'
  | 'flats'
  | 'flatForm'
  | 'claimFlat';

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
  // Flats: the green "it worked" sentence, which form is open, and which flat is being claimed.
  const [flatsNotice, setFlatsNotice] = useState<string | null>(null);
  const [flatForm, setFlatForm] = useState<FlatFormMode>({ kind: 'add' });
  const [claimTarget, setClaimTarget] = useState<Flat | null>(null);

  function handleLoggedIn(loggedIn: Account) {
    setAccount(loggedIn);
    setActive(null);
    setScreen('buildings');
  }

  async function handleLogOut() {
    await api.signOut();
    setAccount(null);
    setActive(null);
    setFlatsNotice(null);
    setScreen('logIn');
  }

  function handleOpenFlats() {
    // The "your building is ready" message has done its job once the person moves on.
    setActive((current) => (current ? { ...current, justCreated: false } : current));
    setFlatsNotice(null);
    setScreen('flats');
  }

  function handleFlatDone(message: string) {
    setFlatsNotice(message);
    setScreen('flats');
  }

  function openFlatForm(mode: FlatFormMode) {
    setFlatsNotice(null);
    setFlatForm(mode);
    setScreen('flatForm');
  }

  function openClaim(flat: Flat) {
    setFlatsNotice(null);
    setClaimTarget(flat);
    setScreen('claimFlat');
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
        onOpenFlats={handleOpenFlats}
      />
    );
  } else if (account && screen === 'flats' && active) {
    content = (
      <FlatsScreen
        key={active.membership.building.id}
        membership={active.membership}
        account={account}
        notice={flatsNotice}
        onBack={() => setScreen('building')}
        onSwitch={() => setScreen('buildings')}
        onAdd={() => openFlatForm({ kind: 'add' })}
        onRename={(flat) => openFlatForm({ kind: 'rename', flat })}
        onClaim={openClaim}
      />
    );
  } else if (account && screen === 'flatForm' && active) {
    content = (
      <FlatFormScreen
        membership={active.membership}
        mode={flatForm}
        onBack={() => setScreen('flats')}
        onSwitch={() => setScreen('buildings')}
        onDone={handleFlatDone}
      />
    );
  } else if (account && screen === 'claimFlat' && active && claimTarget) {
    content = (
      <ClaimFlatScreen
        membership={active.membership}
        flat={claimTarget}
        onBack={() => setScreen('flats')}
        onSwitch={() => setScreen('buildings')}
        onDone={handleFlatDone}
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
