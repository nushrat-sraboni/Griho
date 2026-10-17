// apps/staff/src/components/Brand.tsx
//
// The Griho logo row: a green square with a "G" in it, the word "griho", and a
// small tagline. It sits at the top of the log-in, sign-up, and join screens,
// like the logo in the Griho design reference. Owned by Sraboni.

import { Text, View } from 'react-native';

import { styles } from '../styles';

export default function Brand() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>G</Text>
      </View>
      <View>
        <Text style={styles.brandName}>griho</Text>
        <Text style={styles.brandTagline}>a better way home</Text>
      </View>
    </View>
  );
}
