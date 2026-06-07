import { useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../../navigation'
import { payeesApi } from '../../api/payees'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { maskAccountNumber, formatDate } from '../../lib/utils'
import type { Payee } from '../../types'

// MIGRATION NOTE:
// Web used <table> for the list → RN uses FlatList (virtualized, required for long lists).
// Web used window.confirm or a modal → RN uses Alert.alert (native) or Modal component.

type Props = NativeStackScreenProps<AppStackParamList, 'Tabs'>

export function PayeesScreen({ navigation }: Props) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Payee | null>(null)

  const { data: payees = [], isLoading } = useQuery({
    queryKey: ['payees'],
    queryFn: payeesApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: payeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      setConfirmDelete(null)
    },
  })

  const filtered = payees.filter(p => {
    const q = search.toLowerCase()
    return (
      p.nickname.toLowerCase().includes(q) ||
      p.accountName.toLowerCase().includes(q) ||
      p.bank.toLowerCase().includes(q)
    )
  })

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Payees</Text>
          <Text style={styles.subtitle}>{payees.length} saved {payees.length === 1 ? 'payee' : 'payees'}</Text>
        </View>
        <Button label="+ Add" onPress={() => navigation.navigate('AddPayee')} />
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or bank…"
        placeholderTextColor="#9ca3af"
      />

      {/* List */}
      {isLoading ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search ? 'No payees match your search' : 'No payees yet — add one!'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.nickname.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.nickname}</Text>
                <Text style={styles.accountName}>{item.accountName}</Text>
                <View style={styles.meta}>
                  <Badge label={item.bank} variant="blue" />
                  <Text style={styles.account}>{item.bsb} · {maskAccountNumber(item.accountNumber)}</Text>
                </View>
                <Text style={styles.date}>{item.lastUsed ? `Last used ${formatDate(item.lastUsed)}` : 'Never used'}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => navigation.navigate('EditPayee', { id: item.id })}>
                  <Text style={styles.editBtn}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => setConfirmDelete(item)}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Delete confirm modal */}
      <Modal visible={!!confirmDelete} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete payee?</Text>
            <Text style={styles.dialogBody}>
              This will permanently remove{' '}
              <Text style={{ fontWeight: '600' }}>{confirmDelete?.nickname}</Text>
              {' '}from your payees list.
            </Text>
            <View style={styles.dialogActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmDelete(null)} fullWidth />
              <Button
                label="Delete"
                variant="danger"
                loading={deleteMutation.isPending}
                onPress={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  searchInput: {
    marginHorizontal: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#111827', backgroundColor: '#fff',
  },
  list: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 40 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '600', color: '#1d4ed8' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  accountName: { fontSize: 12, color: '#6b7280' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  account: { fontSize: 12, color: '#6b7280', fontFamily: 'Courier' },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  actions: { gap: 8, alignItems: 'flex-end' },
  editBtn: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  deleteBtn: { fontSize: 13, color: '#ef4444', fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', gap: 12 },
  dialogTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  dialogBody: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
})
