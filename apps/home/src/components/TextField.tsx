// apps/home/src/components/TextField.tsx
//
// One labelled text box. The label sits above it. A "password" box hides what
// is typed and has a Show / Hide button on its right edge. The border turns
// teal while the person is typing in it. Owned by Bishal.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** 'password' hides the text and adds the Show / Hide button. */
  kind?: 'text' | 'email' | 'password';
  placeholder?: string;
  /** For password boxes: is this a brand new password (sign up) or an existing one (log in)? */
  newPassword?: boolean;
};

export default function TextField({
  label,
  value,
  onChangeText,
  kind = 'text',
  placeholder,
  newPassword = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false);
  const isPassword = kind === 'password';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, focused && styles.inputFocused, isPassword && styles.inputPassword]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={label}
          secureTextEntry={isPassword && !shown}
          autoCapitalize={kind === 'text' ? 'words' : 'none'}
          autoCorrect={false}
          keyboardType={kind === 'email' ? 'email-address' : 'default'}
          autoComplete={
            kind === 'email'
              ? 'email'
              : isPassword
                ? newPassword
                  ? 'new-password'
                  : 'current-password'
                : 'name'
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword ? (
          <Pressable
            style={styles.toggle}
            onPress={() => setShown((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.toggleText}>{shown ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 14 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 14,
    backgroundColor: colors.fieldBackground,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.teal, borderWidth: 2, paddingHorizontal: 15 },
  inputPassword: { paddingRight: 72 },
  toggle: {
    position: 'absolute',
    right: 4,
    top: 4,
    height: 44,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontFamily: fonts.bold, fontSize: 14, color: colors.teal },
});
