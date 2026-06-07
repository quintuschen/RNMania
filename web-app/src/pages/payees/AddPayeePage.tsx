import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { payeesApi } from '../../api/payees'
import { PayeeForm, type PayeeFormData } from './PayeeForm'

export function AddPayeePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: PayeeFormData) => payeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      navigate('/payees')
    },
  })

  const handleSubmit = async (data: PayeeFormData) => {
    await mutation.mutateAsync(data)
  }

  return (
    <div className="p-8">
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add payee</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add a new recipient for payments
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {mutation.isError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {mutation.error instanceof Error ? mutation.error.message : 'Failed to add payee'}
            </div>
          )}
          <PayeeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/payees')}
            submitLabel="Add payee"
          />
        </div>
      </div>
    </div>
  )
}
