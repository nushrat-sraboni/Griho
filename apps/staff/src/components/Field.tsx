// apps/staff/src/components/Field.tsx
//
// A labelled text box in the Griho look: a bold label above a rounded grey box.
// For passwords it adds a "Show" / "Hide" button on the right. Every form screen
// uses this, so all the boxes look and behave the same. Owned by Sraboni.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors } from '../styles';

type Props = TextInputProps & {
  label: string;
  /** True for a password box: hides the typing and adds the Show button. */
  secret?: boolean;
};

export default function Field({ label, secret, style, ...inputProps }: Props) {
  const [shown, setShown] = useState(false);

  return (
    <View style={local.wrap}>
      <Text style={local.label}>{label}</Text>
      <View>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          secureTextEntry={secret && !shown}
          placeholderTextColor={colors.muted}
          style={[local.input, secret && local.inputWithButton, style]}
        />
        {secret ? (
          <Pressable
            style={local.showButton}
            onPress={() => setShown((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide password' : 'Show password'}
          >
            <Text style={local.showText}>{shown ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    backgroundColor: colors.inputBg,
    color: colors.ink,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithButton: { paddingRight: 72 },
  showButton: {
    position: 'absolute',
    right: 6,
    top: 2,
    height: 44,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showText: { color: colors.green, fontSize: 15, fontWeight: '700' },
});
