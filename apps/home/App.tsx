// apps/home/App.tsx
//
// The main entry of Griho Home (owners and tenants). It loads the app's font,
// then decides which screen to show:
//   log in / sign up   : before the person is logged in
//   My buildings       : the list of their buildings (the first screen after logging in)
//   Create a building  : the form to make a new building
//   Building home      : one building, with its name always shown at the top
//   Flats              : the owner's list of flats, with add, rename and claim screens
//   Join codes         : the owner's list of codes, with make, open (share, turn off or on) and delete
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
import type { Account, Building, CodeInfo, Flat } from '@griho/shared';

import { api, type MembershipWithLastOwner } from './src/api';
import { loadMembership } from './src/buildings';
import BuildingHomeScreen from './src/screens/BuildingHomeScreen';
import ClaimFlatScreen from './src/screens/ClaimFlatScreen';
import CodeDetailScreen from './src/screens/CodeDetailScreen';
import CodesScreen from './src/screens/CodesScreen';
import CreateBuildingScreen from './src/screens/CreateBuildingScreen';
import DeleteCodeScreen from './src/screens/DeleteCodeScreen';
import FlatFormScreen, { type FlatFormMode } from './src/screens/FlatFormScreen';
import FlatsScreen from './src/screens/FlatsScreen';
import LogInScreen from './src/screens/LogInScreen';
import MakeCodeScreen from './src/screens/MakeCodeScreen';
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
  | 'claimFlat'
  | 'codes'
  | 'makeCode'
  | 'codeDetail'
  | 'deleteCode';

/** The building that is open right now, and whether the person just made it. */
type ActiveBuilding = { membership: MembershipWithLastOwner; justCreated: boolean };

/** The code that is open, and whether the person just made it. */
type OpenCode = { code: CodeInfo; justMade: boolean };

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
  // Codes: the green "it worked" sentence, and which code is open.
  const [codesNotice, setCodesNotice] = useState<string | null>(null);
  const [openCode, setOpenCode] = useState<OpenCode | null>(null);

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
    setCodesNotice(null);
    setOpenCode(null);
    setScreen('logIn');
  }

  function clearJustCreated() {
    // The "your building is ready" message has done its job once the person moves on.
    setActive((current) => (current ? { ...current, justCreated: false } : current));
  }

  function handleOpenFlats() {
    clearJustCreated();
    setFlatsNotice(null);
    setScreen('flats');
  }

  function handleOpenCodes() {
    clearJustCreated();
    setCodesNotice(null);
    setScreen('codes');
  }

  function showCode(code: CodeInfo, justMade: boolean) {
    setCodesNotice(null);
    setOpenCode({ code, justMade });
    setScreen('codeDetail');
  }

  function handleCodeDeleted(message: string) {
    setOpenCode(null);
    setCodesNotice(message);
    setScreen('codes');
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
        onOpenCodes={handleOpenCodes}
      />
    );
  } else if (account && screen === 'codes' && active) {
    content = (
      <CodesScreen
        key={active.membership.building.id}
        membership={active.membership}
        notice={codesNotice}
        onBack={() => setScreen('building')}
        onSwitch={() => setScreen('buildings')}
        onMake={() => {
          setCodesNotice(null);
          setScreen('makeCode');
        }}
        onOpen={(code) => showCode(code, false)}
      />
    );
  } else if (account && screen === 'makeCode' && active) {
    content = (
      <MakeCodeScreen
        membership={active.membership}
        onBack={() => setScreen('codes')}
        onSwitch={() => setScreen('buildings')}
        onMade={(code) => showCode(code, true)}
      />
    );
  } else if (account && screen === 'codeDetail' && active && openCode) {
    content = (
      <CodeDetailScreen
        key={openCode.code.id}
        membership={active.membership}
        code={openCode.code}
        justMade={openCode.justMade}
        onBack={() => setScreen('codes')}
        onSwitch={() => setScreen('buildings')}
        onDelete={(latest) => {
          setOpenCode({ code: latest, justMade: false });
          setScreen('deleteCode');
        }}
      />
    );
  } else if (account && screen === 'deleteCode' && active && openCode) {
    content = (
      <DeleteCodeScreen
        membership={active.membership}
        code={openCode.code}
        onBack={() => setScreen('codeDetail')}
        onSwitch={() => setScreen('buildings')}
        onDeleted={handleCodeDeleted}
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
