// apps/staff/src/screens/WaitingScreen.tsx
//
// The "waiting for approval" screen of Griho Staff. It shows which building the
// person asked to join and that someone still has to say yes. Nothing else can
// be done here until the request is answered.
// Owned by Sraboni.

import { Pressable, Text, View } from 'react-native';

import type { JoinRequestResult } from '../fakeBackend';
import { styles } from '../styles';

type Props = {
  request: JoinRequestResult;
  onLogOut: () => void;
};

export default function WaitingScreen({ request, onLogOut }: Props) {
  const roleWords = request.role === 'manager' ? 'manager' : 'guard';

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Waiting for approval</Text>
      <Text style={styles.subtitle}>
        You asked to join {request.building_name} as a {roleWords}.
      </Text>
      <Text style={styles.note}>
        A person in charge of the building must say yes first. Please wait. Once you are approved,
        the app will show your building.
      </Text>

      <Pressable style={styles.button} onPress={onLogOut} accessibilityRole="button">
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}
