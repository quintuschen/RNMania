// MIGRATION NOTE:
// Structure identical to LoginPage.tsx.
// Key differences:
//   - <div>       → <View>
//   - <p>/<h1>    → <Text>
//   - <form>      → no form element; onSubmit fires manually
//   - KeyboardAvoidingView wraps content so keyboard doesn't hide inputs
//   - ScrollView needed so small screens can scroll past keyboard

import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../store/authStore'
import { FormField } from '../components/FormField'
import { Button } from '../components/Button'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function LoginScreen() {
  const { login } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await login(data.email, data.password)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.appName}>NovaPay</Text>
          <Text style={styles.tagline}>Sign in to your account</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Email address"
                placeholder="demo@bank.com"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="current-password"
                error={errors.password?.message}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />

          {serverError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          <Button
            label="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
          />

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>Demo credentials</Text>
            <Text style={styles.hintBody}>demo@bank.com / demo1234</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#eff6ff' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  appName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  tagline: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { fontSize: 13, color: '#dc2626' },
  hint: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  hintTitle: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginBottom: 2 },
  hintBody: { fontSize: 12, color: '#374151', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
})
