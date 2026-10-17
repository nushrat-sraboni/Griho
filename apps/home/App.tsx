// apps/home/App.tsx
//
// The main entry of Griho Home (owners and tenants). It loads the app's font,
// then decides which screen to show: log in, sign up, or the signed-in home
// screen. Real building screens come in later steps.
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
import type { Account } from '@griho/shared';

import { api } from './src/api';
import HomeScreen from './src/screens/HomeScreen';
import LogInScreen from './src/screens/LogInScreen';
import SignUpScreen from './src/screens/SignUpScreen';

type ScreenName = 'logIn' | 'signUp' | 'home';

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

  function handleLoggedIn(loggedIn: Account) {
    setAccount(loggedIn);
    setScreen('home');
  }

  async function handleLogOut() {
    await api.signOut();
    setAccount(null);
    setScreen('logIn');
  }

  // Wait a moment for the font to load, so text never flashes in the wrong font.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      {screen === 'home' && account ? (
        <HomeScreen account={account} onLogOut={handleLogOut} />
      ) : screen === 'signUp' ? (
        <SignUpScreen onSignedUp={handleLoggedIn} onGoToLogIn={() => setScreen('logIn')} />
      ) : (
        <LogInScreen onLoggedIn={handleLoggedIn} onGoToSignUp={() => setScreen('signUp')} />
      )}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
