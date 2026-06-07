import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { BANKS } from '../../api/payees'
import { formatBSB, formatAccountNumber } from '../../lib/utils'
import type { Payee } from '../../types'

const schema = z.object({
  nickname: z.string().min(1, 'Nickname is required').max(40),
  accountName: z.string().min(2, 'Account name is required').max(80),
  accountNumber: z
    .string()
    .min(6, 'Account number must be 6–10 digits')
    .max(10, 'Account number must be 6–10 digits')
    .regex(/^\d+$/, 'Digits only'),
  bsb: z
    .string()
    .regex(/^\d{3}-\d{3}$/, 'BSB must be in format 000-000'),
  bank: z.enum(['ANZ', 'Commonwealth Bank', 'Westpac', 'NAB', 'Macquarie', 'Other']),
})

export type PayeeFormData = z.infer<typeof schema>

interface PayeeFormProps {
  defaultValues?: Partial<PayeeFormData>
  onSubmit: (data: PayeeFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function PayeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save payee',
}: PayeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PayeeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank: 'ANZ',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label="Nickname"
            placeholder="e.g. Landlord, Mum"
            error={errors.nickname?.message}
            hint="A friendly name to identify this payee"
            {...register('nickname')}
          />
        </div>

        <div className="col-span-2">
          <Input
            label="Account name"
            placeholder="Full legal account name"
            error={errors.accountName?.message}
            {...register('accountName')}
          />
        </div>

        <Input
          label="BSB"
          placeholder="000-000"
          error={errors.bsb?.message}
          {...register('bsb', {
            onChange: (e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 6)
              const formatted = raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw
              setValue('bsb', formatted, { shouldValidate: true })
            },
          })}
        />

        <Input
          label="Account number"
          placeholder="6–10 digits"
          error={errors.accountNumber?.message}
          {...register('accountNumber', {
            onChange: (e) => {
              setValue('accountNumber', formatAccountNumber(e.target.value), {
                shouldValidate: true,
              })
            },
          })}
        />

        <div className="col-span-2">
          <Select
            label="Bank"
            error={errors.bank?.message}
            options={BANKS.map((b) => ({ value: b, label: b }))}
            {...register('bank')}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
