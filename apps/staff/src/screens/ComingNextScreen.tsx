// apps/staff/src/screens/ComingNextScreen.tsx
//
// A simple stand-in for manager screens that are designed but not built yet
// (Guards and Messages). It shows the usual header and a short note saying the
// screen is coming in a later step, so the bottom menu never leads to a dead end.
// Delete a stand-in once the real screen exists. Owned by Sraboni.

import { Text } from 'react-native';

import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import { styles } from '../styles';

type Props = {
  displayName: string;
  eyebrow: string;
  title: string;
  text: string;
};

export default function ComingNextScreen({ displayName, eyebrow, title, text }: Props) {
  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>{text}</Text>
    </>
  );
}
