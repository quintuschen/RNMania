import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../../navigation'
import { payeesApi } from '../../api/payees'
import { PayeeForm, type PayeeFormData } from './PayeeForm'

type Props = NativeStackScreenProps<AppStackParamList, 'AddPayee'>

export function AddPayeeScreen({ navigation }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: PayeeFormData) => payeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      navigation.goBack()
    },
  })

  return (
    <PayeeForm
      onSubmit={(data) => mutation.mutateAsync(data).then(() => {})}
      onCancel={() => navigation.goBack()}
      submitLabel="Add payee"
    />
  )
}
