// apps/staff/App.tsx
//
// The main screen of Griho Staff (managers and guards). It decides which screen
// to show:
//   - log in or sign up, when nobody is logged in
//   - the join screen, when the person belongs to no building yet
//   - the waiting screen, while their join request is being answered
//   - the guard home screen or the manager workspace, once they belong to a building
// Later steps add the real manager screens. Owned by Sraboni.

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import type { Account } from '@griho/shared';
import {
  approveMyRequestForTesting,
  getMyMembership,
  getMyPendingRequest,
  signOut,
  type JoinRequestResult,
  type Membership,
} from './src/fakeBackend';
import GuardHomeScreen from './src/screens/GuardHomeScreen';
import JoinBuildingScreen from './src/screens/JoinBuildingScreen';
import LogInScreen from './src/screens/LogInScreen';
import ManagerWorkspace from './src/screens/ManagerWorkspace';
import SignUpScreen from './src/screens/SignUpScreen';
import WaitingScreen from './src/screens/WaitingScreen';

type Screen = 'logIn' | 'signUp' | 'join' | 'waiting' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('logIn');
  const [account, setAccount] = useState<Account | null>(null);
  const [request, setRequest] = useState<JoinRequestResult | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  // After log-in or sign-up: go to the building if they have one, the waiting
  // screen if a request is pending, otherwise ask for a code.
  function handleLoggedIn(loggedIn: Account) {
    const mine = getMyMembership();
    const pending = getMyPendingRequest();
    setAccount(loggedIn);
    setMembership(mine);
    setRequest(pending);
    setScreen(mine ? 'home' : pending ? 'waiting' : 'join');
  }

  async function handleLogOut() {
    await signOut();
    setAccount(null);
    setRequest(null);
    setMembership(null);
    setScreen('logIn');
  }

  // Testing only: pretends someone approved the waiting request.
  async function handlePretendApproved() {
    const approved = await approveMyRequestForTesting();
    setMembership(approved);
    setRequest(null);
    setScreen('home');
  }

  let content;
  if (screen === 'signUp') {
    content = <SignUpScreen onSignedUp={handleLoggedIn} onGoToLogIn={() => setScreen('logIn')} />;
  } else if (screen === 'join') {
    content = (
      <JoinBuildingScreen
        onRequestSent={(sent) => {
          setRequest(sent);
          setScreen('waiting');
        }}
        onLogOut={handleLogOut}
      />
    );
  } else if (screen === 'waiting' && request) {
    content = (
      <WaitingScreen
        request={request}
        onLogOut={handleLogOut}
        onPretendApproved={__DEV__ ? handlePretendApproved : undefined}
      />
    );
  } else if (screen === 'home' && account && membership) {
    const goBackToJoin = () => {
      setMembership(null);
      setScreen('join');
    };
    content =
      membership.role === 'manager' ? (
        <ManagerWorkspace
          displayName={account.display_name}
          membership={membership}
          onLeft={goBackToJoin}
          onLogOut={handleLogOut}
        />
      ) : (
        <GuardHomeScreen
          displayName={account.display_name}
          membership={membership}
          onLeft={goBackToJoin}
          onLogOut={handleLogOut}
        />
      );
  } else {
    content = <LogInScreen onLoggedIn={handleLoggedIn} onGoToSignUp={() => setScreen('signUp')} />;
  }

  return (
    <>
      {content}
      <StatusBar style="dark" />
    </>
  );
}
