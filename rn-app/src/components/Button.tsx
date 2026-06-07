// MIGRATION NOTE:
// Web: <button> + Tailwind classes
// RN:  <Pressable> + StyleSheet — no className, no CSS

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563eb'} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },

  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' },
  danger: { backgroundColor: '#dc2626' },
  ghost: { backgroundColor: 'transparent' },

  label: { fontSize: 14, fontWeight: '600' },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: '#374151' },
  dangerLabel: { color: '#fff' },
  ghostLabel: { color: '#6b7280' },
})
