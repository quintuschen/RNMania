import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../../navigation'
import { payeesApi } from '../../api/payees'
import { PayeeForm, type PayeeFormData } from './PayeeForm'

type Props = NativeStackScreenProps<AppStackParamList, 'EditPayee'>

export function EditPayeeScreen({ route, navigation }: Props) {
  const { id } = route.params
  const queryClient = useQueryClient()

  const { data: payee, isLoading } = useQuery({
    queryKey: ['payees', id],
    queryFn: () => payeesApi.get(id),
  })

  const mutation = useMutation({
    mutationFn: (data: PayeeFormData) => payeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      navigation.goBack()
    },
  })

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2563eb" />
      </View>
    )
  }

  if (!payee) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Payee not found</Text>
      </View>
    )
  }

  return (
    <PayeeForm
      defaultValues={{
        nickname: payee.nickname,
        accountName: payee.accountName,
        accountNumber: payee.accountNumber,
        bsb: payee.bsb,
        bank: payee.bank,
      }}
      onSubmit={(data) => mutation.mutateAsync(data).then(() => {})}
      onCancel={() => navigation.goBack()}
      submitLabel="Save changes"
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: '#6b7280', fontSize: 14 },
})
