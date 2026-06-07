// MIGRATION NOTE:
// Web: <input> / <select> HTML elements + Tailwind
// RN:  <TextInput> — no select equivalent, use Picker or custom list

import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

interface FormFieldProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
}

export function FormField({ label, error, hint, ...props }: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : styles.inputNormal]}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 44,
  },
  inputNormal: { borderColor: '#d1d5db' },
  inputError: { borderColor: '#f87171' },
  error: { fontSize: 12, color: '#ef4444' },
  hint: { fontSize: 12, color: '#6b7280' },
})
