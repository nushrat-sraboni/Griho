// apps/home/App.tsx
//
// The main entry of Griho Home (owners and tenants). It loads the app's font,
// then decides which screen to show:
//   log in / sign up   : before the person is logged in
//   My buildings       : the list of their buildings (the first screen after logging in)
//   Join with a code   : type a code, then "Request sent" while an owner decides
//   Delete my account  : leave everything and delete the account
//   Create a building  : the form to make a new building
//   Building home      : one building, with its name always shown at the top
//   Join requests      : the owner's list of people waiting to get in
//   People             : who is in the building; owners can remove people
//   Leave a building   : confirm leaving (or deleting it, for the only owner)
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
import type { Account, Building, CodeInfo, Flat, MemberListItem } from '@griho/shared';

import {
  api,
  type LeaveBuildingResult,
  type MembershipWithLastOwner,
  type SubmitJoinRequestResult,
} from './src/api';
import { loadMembership } from './src/buildings';
import BuildingHomeScreen from './src/screens/BuildingHomeScreen';
import ClaimFlatScreen from './src/screens/ClaimFlatScreen';
import CodeDetailScreen from './src/screens/CodeDetailScreen';
import CodesScreen from './src/screens/CodesScreen';
import CreateBuildingScreen from './src/screens/CreateBuildingScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';
import DeleteCodeScreen from './src/screens/DeleteCodeScreen';
import FlatFormScreen, { type FlatFormMode } from './src/screens/FlatFormScreen';
import FlatsScreen from './src/screens/FlatsScreen';
import JoinCodeScreen from './src/screens/JoinCodeScreen';
import LeaveBuildingScreen from './src/screens/LeaveBuildingScreen';
import LogInScreen from './src/screens/LogInScreen';
import MakeCodeScreen from './src/screens/MakeCodeScreen';
import MyBuildingsScreen from './src/screens/MyBuildingsScreen';
import PeopleScreen from './src/screens/PeopleScreen';
import RemovePersonScreen from './src/screens/RemovePersonScreen';
import RequestSentScreen from './src/screens/RequestSentScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import SignUpScreen from './src/screens/SignUpScreen';

type ScreenName =
  | 'logIn'
  | 'signUp'
  | 'buildings'
  | 'joinCode'
  | 'requestSent'
  | 'deleteAccount'
  | 'createBuilding'
  | 'building'
  | 'requests'
  | 'people'
  | 'removePerson'
  | 'leaveBuilding'
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
  // A green sentence on the log-in screen and on "My buildings" (for example "You left Blue Court.").
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [buildingsNotice, setBuildingsNotice] = useState<string | null>(null);
  // Joining: the answer to the last request that was sent.
  const [joinResult, setJoinResult] = useState<SubmitJoinRequestResult | null>(null);
  // People: the green sentence, and who is about to be removed.
  const [peopleNotice, setPeopleNotice] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberListItem | null>(null);
  // Flats: the green "it worked" sentence, which form is open, and which flat is being claimed.
  const [flatsNotice, setFlatsNotice] = useState<string | null>(null);
  const [flatForm, setFlatForm] = useState<FlatFormMode>({ kind: 'add' });
  const [claimTarget, setClaimTarget] = useState<Flat | null>(null);
  // Codes: the green "it worked" sentence, and which code is open.
  const [codesNotice, setCodesNotice] = useState<string | null>(null);
  const [openCode, setOpenCode] = useState<OpenCode | null>(null);

  /** Forgets everything about the person who was logged in. */
  function forgetEverything() {
    setAccount(null);
    setActive(null);
    setBuildingsNotice(null);
    setJoinResult(null);
    setPeopleNotice(null);
    setRemoveTarget(null);
    setFlatsNotice(null);
    setCodesNotice(null);
    setOpenCode(null);
  }

  function handleLoggedIn(loggedIn: Account) {
    forgetEverything();
    setLoginNotice(null);
    setAccount(loggedIn);
    setScreen('buildings');
  }

  async function handleLogOut() {
    await api.signOut();
    forgetEverything();
    setLoginNotice(null);
    setScreen('logIn');
  }

  function handleAccountDeleted() {
    forgetEverything();
    setLoginNotice('Your account was deleted.');
    setScreen('logIn');
  }

  /** Goes to "My buildings", with an optional green sentence. */
  function showBuildings(notice: string | null = null) {
    setBuildingsNotice(notice);
    setScreen('buildings');
  }

  function clearJustCreated() {
    // The "your building is ready" message has done its job once the person moves on.
    setActive((current) => (current ? { ...current, justCreated: false } : current));
  }

  function handleOpenRequests() {
    clearJustCreated();
    setScreen('requests');
  }

  function handleOpenPeople() {
    clearJustCreated();
    setPeopleNotice(null);
    setScreen('people');
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

  function handleLeft(result: LeaveBuildingResult['result']) {
    const name = active?.membership.building.name ?? 'the building';
    setActive(null);
    showBuildings(result === 'building_deleted' ? `${name} was deleted.` : `You left ${name}.`);
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
    setBuildingsNotice(null);
    setActive({ membership, justCreated: false });
    setScreen('building');
  }

  async function handleCreated(building: Building) {
    const membership = await loadMembership(api, building.id);
    if (membership) {
      setActive({ membership, justCreated: true });
      setScreen('building');
    } else {
      showBuildings();
    }
  }

  // Wait a moment for the font to load, so text never flashes in the wrong font.
  if (!fontsLoaded) return null;

  const switchToBuildings = () => showBuildings();
  let content;
  if (account && screen === 'building' && active) {
    content = (
      <BuildingHomeScreen
        key={active.membership.building.id}
        membership={active.membership}
        justCreated={active.justCreated}
        onSwitch={switchToBuildings}
        onOpenRequests={handleOpenRequests}
        onOpenFlats={handleOpenFlats}
        onOpenCodes={handleOpenCodes}
        onOpenPeople={handleOpenPeople}
        onLeave={() => setScreen('leaveBuilding')}
      />
    );
  } else if (account && screen === 'requests' && active) {
    content = (
      <RequestsScreen
        key={active.membership.building.id}
        membership={active.membership}
        onBack={() => setScreen('building')}
        onSwitch={switchToBuildings}
      />
    );
  } else if (account && screen === 'people' && active) {
    content = (
      <PeopleScreen
        key={active.membership.building.id}
        membership={active.membership}
        notice={peopleNotice}
        onBack={() => setScreen('building')}
        onSwitch={switchToBuildings}
        onRemove={(person) => {
          setPeopleNotice(null);
          setRemoveTarget(person);
          setScreen('removePerson');
        }}
      />
    );
  } else if (account && screen === 'removePerson' && active && removeTarget) {
    content = (
      <RemovePersonScreen
        membership={active.membership}
        person={removeTarget}
        onBack={() => setScreen('people')}
        onSwitch={switchToBuildings}
        onRemoved={(message) => {
          setPeopleNotice(message);
          setRemoveTarget(null);
          setScreen('people');
        }}
      />
    );
  } else if (account && screen === 'leaveBuilding' && active) {
    content = (
      <LeaveBuildingScreen
        membership={active.membership}
        account={account}
        onBack={() => setScreen('building')}
        onSwitch={switchToBuildings}
        onLeft={handleLeft}
      />
    );
  } else if (account && screen === 'codes' && active) {
    content = (
      <CodesScreen
        key={active.membership.building.id}
        membership={active.membership}
        notice={codesNotice}
        onBack={() => setScreen('building')}
        onSwitch={switchToBuildings}
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
        onSwitch={switchToBuildings}
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
        onSwitch={switchToBuildings}
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
        onSwitch={switchToBuildings}
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
        onSwitch={switchToBuildings}
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
        onSwitch={switchToBuildings}
        onDone={handleFlatDone}
      />
    );
  } else if (account && screen === 'claimFlat' && active && claimTarget) {
    content = (
      <ClaimFlatScreen
        membership={active.membership}
        flat={claimTarget}
        onBack={() => setScreen('flats')}
        onSwitch={switchToBuildings}
        onDone={handleFlatDone}
      />
    );
  } else if (account && screen === 'createBuilding') {
    content = <CreateBuildingScreen onBack={switchToBuildings} onCreated={handleCreated} />;
  } else if (account && screen === 'joinCode') {
    content = (
      <JoinCodeScreen
        onBack={switchToBuildings}
        onSent={(result) => {
          setJoinResult(result);
          setScreen('requestSent');
        }}
      />
    );
  } else if (account && screen === 'requestSent' && joinResult) {
    content = <RequestSentScreen result={joinResult} onDone={switchToBuildings} />;
  } else if (account && screen === 'deleteAccount') {
    content = (
      <DeleteAccountScreen
        account={account}
        onBack={switchToBuildings}
        onDeleted={handleAccountDeleted}
      />
    );
  } else if (account && screen === 'buildings') {
    content = (
      <MyBuildingsScreen
        account={account}
        activeBuildingId={active?.membership.building.id ?? null}
        notice={buildingsNotice}
        onOpenBuilding={handleOpenBuilding}
        onCreateBuilding={() => {
          setBuildingsNotice(null);
          setScreen('createBuilding');
        }}
        onJoinWithCode={() => {
          setBuildingsNotice(null);
          setScreen('joinCode');
        }}
        onDeleteAccount={() => setScreen('deleteAccount')}
        onLogOut={handleLogOut}
      />
    );
  } else if (screen === 'signUp') {
    content = <SignUpScreen onSignedUp={handleLoggedIn} onGoToLogIn={() => setScreen('logIn')} />;
  } else {
    content = (
      <LogInScreen
        notice={loginNotice}
        onLoggedIn={handleLoggedIn}
        onGoToSignUp={() => setScreen('signUp')}
      />
    );
  }

  return (
    <SafeAreaProvider>
      {content}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
