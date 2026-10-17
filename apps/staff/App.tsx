// apps/staff/App.tsx
//
// The main screen of Griho Staff (managers and guards). It decides which screen
// to show: log in, sign up, join a building with a code, or the waiting screen
// while the request is answered. Later steps add the real building screens.
// Owned by Sraboni.

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { getMyPendingRequest, signOut, type JoinRequestResult } from './src/fakeBackend';
import JoinBuildingScreen from './src/screens/JoinBuildingScreen';
import LogInScreen from './src/screens/LogInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import WaitingScreen from './src/screens/WaitingScreen';

type Screen = 'logIn' | 'signUp' | 'join' | 'waiting';

export default function App() {
  const [screen, setScreen] = useState<Screen>('logIn');
  const [request, setRequest] = useState<JoinRequestResult | null>(null);

  // After log-in or sign-up: show the waiting screen if a request is already
  // pending, otherwise ask for a code.
  function handleLoggedIn() {
    const pending = getMyPendingRequest();
    setRequest(pending);
    setScreen(pending ? 'waiting' : 'join');
  }

  async function handleLogOut() {
    await signOut();
    setRequest(null);
    setScreen('logIn');
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
    content = <WaitingScreen request={request} onLogOut={handleLogOut} />;
  } else {
    content = <LogInScreen onLoggedIn={handleLoggedIn} onGoToSignUp={() => setScreen('signUp')} />;
  }

  return (
    <>
      {content}
      <StatusBar style="auto" />
    </>
  );
}
