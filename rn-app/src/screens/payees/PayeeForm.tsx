// MIGRATION NOTE:
// Web used <select> for bank picker → RN has no native <select>.
// Options: (1) Picker from @react-native-picker/picker, (2) custom modal list.
// We use a simple Pressable list overlay here to avoid extra native dependency.

import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '../../components/FormField'
import { Button } from '../../components/Button'
import { BANKS } from '../../api/payees'
import { formatBSB, formatAccountNumber } from '../../lib/utils'
import type { PayeeBank } from '../../types'

const schema = z.object({
  nickname: z.string().min(1, 'Nickname is required').max(40),
  accountName: z.string().min(2, 'Account name is required').max(80),
  accountNumber: z.string().min(6).max(10).regex(/^\d+$/, 'Digits only'),
  bsb: z.string().regex(/^\d{3}-\d{3}$/, 'BSB must be in format 000-000'),
  bank: z.enum(['ANZ', 'Commonwealth Bank', 'Westpac', 'NAB', 'Macquarie', 'Other']),
})

export type PayeeFormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<PayeeFormData>
  onSubmit: (data: PayeeFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function PayeeForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save payee' }: Props) {
  const [bankPickerOpen, setBankPickerOpen] = useState(false)

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PayeeFormData>({
    resolver: zodResolver(schema),
    defaultValues: { bank: 'ANZ', ...defaultValues },
  })

  const selectedBank = watch('bank')

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="nickname"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField label="Nickname" placeholder="e.g. Landlord, Mum"
            error={errors.nickname?.message} hint="A friendly name to identify this payee"
            onChangeText={onChange} onBlur={onBlur} value={value} />
        )}
      />

      <Controller
        control={control}
        name="accountName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField label="Account name" placeholder="Full legal account name"
            error={errors.accountName?.message}
            onChangeText={onChange} onBlur={onBlur} value={value} />
        )}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="bsb"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="BSB" placeholder="000-000" keyboardType="number-pad"
                error={errors.bsb?.message}
                onChangeText={(text) => {
                  const raw = text.replace(/\D/g, '').slice(0, 6)
                  const formatted = raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw
                  onChange(formatted)
                }}
                onBlur={onBlur} value={value} />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Account number" placeholder="6–10 digits" keyboardType="number-pad"
                error={errors.accountNumber?.message}
                onChangeText={(text) => onChange(formatAccountNumber(text))}
                onBlur={onBlur} value={value} />
            )}
          />
        </View>
      </View>

      {/* Bank picker — replaces <select> */}
      <View>
        <Text style={styles.label}>Bank</Text>
        <Pressable style={styles.picker} onPress={() => setBankPickerOpen(true)}>
          <Text style={styles.pickerText}>{selectedBank}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </Pressable>
        {errors.bank && <Text style={styles.error}>{errors.bank.message}</Text>}
      </View>

      <View style={styles.buttons}>
        <View style={styles.half}>
          <Button label="Cancel" variant="secondary" onPress={onCancel} fullWidth />
        </View>
        <View style={styles.half}>
          <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
        </View>
      </View>

      {/* Bank picker modal */}
      <Modal visible={bankPickerOpen} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setBankPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select bank</Text>
            {BANKS.map(bank => (
              <Pressable
                key={bank}
                style={[styles.bankOption, bank === selectedBank && styles.bankSelected]}
                onPress={() => {
                  setValue('bank', bank as PayeeBank, { shouldValidate: true })
                  setBankPickerOpen(false)
                }}
              >
                <Text style={[styles.bankLabel, bank === selectedBank && styles.bankLabelSelected]}>
                  {bank}
                </Text>
                {bank === selectedBank && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  form: { gap: 16, padding: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4 },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', minHeight: 44,
  },
  pickerText: { fontSize: 14, color: '#111827' },
  pickerChevron: { fontSize: 14, color: '#6b7280' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 4,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  bankOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10 },
  bankSelected: { backgroundColor: '#eff6ff' },
  bankLabel: { flex: 1, fontSize: 15, color: '#111827' },
  bankLabelSelected: { color: '#2563eb', fontWeight: '600' },
  checkmark: { color: '#2563eb', fontWeight: '700' },
})
