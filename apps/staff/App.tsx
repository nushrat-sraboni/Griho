// apps/staff/App.tsx
//
// The main screen of Griho Staff (managers and guards). It decides which screen
// to show: log in, sign up, or (for now) a simple "signed in" message. Real
// screens for joining buildings come in later steps.
// Owned by Sraboni.

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text, View } from 'react-native';

import type { Account } from '@griho/shared';
import LogInScreen from './src/screens/LogInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { styles } from './src/styles';

type Screen = 'logIn' | 'signUp' | 'signedIn';

export default function App() {
  const [screen, setScreen] = useState<Screen>('logIn');
  const [account, setAccount] = useState<Account | null>(null);

  function handleLoggedIn(loggedIn: Account) {
    setAccount(loggedIn);
    setScreen('signedIn');
  }

  if (screen === 'signUp') {
    return (
      <>
        <SignUpScreen onSignedUp={handleLoggedIn} onGoToLogIn={() => setScreen('logIn')} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (screen === 'signedIn' && account) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Welcome, {account.display_name}</Text>
        <Text style={styles.subtitle}>You are logged in to Griho Staff.</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <LogInScreen onLoggedIn={handleLoggedIn} onGoToSignUp={() => setScreen('signUp')} />
      <StatusBar style="auto" />
    </>
  );
}
