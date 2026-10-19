// apps/home/src/components/TextField.tsx
//
// One labelled text box. The label sits above it. A "password" box hides what
// is typed and has a Show / Hide button on its right edge. The border turns
// teal while the person is typing in it, and red (with a short sentence under
// the box) when `error` is given. Owned by Bishal.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

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
  /** A short sentence shown in red under the box. The box gets a red border. */
  error?: string;
  /** Capital letters: 'words' suits a name, 'none' suits an email or a phone number. */
  capitalize?: 'none' | 'words' | 'sentences';
  /** Tells the phone what to suggest. Leave out for the sensible default. */
  autoComplete?: TextInputProps['autoComplete'];
  /** A short grey help sentence under the box. Hidden while an error is showing. */
  hint?: string;
};

export default function TextField({
  label,
  value,
  onChangeText,
  kind = 'text',
  placeholder,
  newPassword = false,
  error,
  capitalize,
  autoComplete,
  hint,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false);
  const isPassword = kind === 'password';

  const defaultComplete: TextInputProps['autoComplete'] =
    kind === 'email'
      ? 'email'
      : isPassword
        ? newPassword
          ? 'new-password'
          : 'current-password'
        : 'name';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            isPassword && styles.inputPassword,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={label}
          secureTextEntry={isPassword && !shown}
          autoCapitalize={capitalize ?? (kind === 'text' ? 'words' : 'none')}
          autoCorrect={false}
          keyboardType={kind === 'email' ? 'email-address' : 'default'}
          autoComplete={autoComplete ?? defaultComplete}
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
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
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
  inputError: { borderColor: colors.fieldError, borderWidth: 2, paddingHorizontal: 15 },
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
  errorText: { marginTop: 6, fontFamily: fonts.semiBold, fontSize: 13, color: colors.errorText },
  hintText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
