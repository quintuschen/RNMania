import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payeesApi } from '../../api/payees'
import { PayeeForm, type PayeeFormData } from './PayeeForm'

export function EditPayeePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: payee, isLoading } = useQuery({
    queryKey: ['payees', id],
    queryFn: () => payeesApi.get(id!),
    enabled: !!id,
  })

  const mutation = useMutation({
    mutationFn: (data: PayeeFormData) => payeesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      navigate('/payees')
    },
  })

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!payee) {
    return (
      <div className="p-8 text-center text-gray-500">Payee not found</div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit payee</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update details for <span className="font-medium text-gray-700">{payee.nickname}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {mutation.isError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {mutation.error instanceof Error ? mutation.error.message : 'Failed to update payee'}
            </div>
          )}
          <PayeeForm
            defaultValues={{
              nickname: payee.nickname,
              accountName: payee.accountName,
              accountNumber: payee.accountNumber,
              bsb: payee.bsb,
              bank: payee.bank,
            }}
            onSubmit={(data) => mutation.mutateAsync(data)}
            onCancel={() => navigate('/payees')}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </div>
  )
}
