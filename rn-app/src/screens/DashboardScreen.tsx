import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { payeesApi } from '../api/payees'
import { useAuthStore } from '../store/authStore'
import { formatDate, maskAccountNumber } from '../lib/utils'

export function DashboardScreen() {
  const { user } = useAuthStore()
  const { data: payees = [] } = useQuery({
    queryKey: ['payees'],
    queryFn: payeesApi.list,
  })

  const recentPayees = [...payees]
    .filter(p => p.lastUsed)
    .sort((a, b) => (b.lastUsed ?? '').localeCompare(a.lastUsed ?? ''))
    .slice(0, 3)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Good morning, {user?.name.split(' ')[0]} 👋</Text>
      <Text style={styles.subtitle}>Here's your account summary</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total Payees" value={String(payees.length)} icon="👥" />
        <StatCard label="Used Recently" value={String(payees.filter(p => p.lastUsed).length)} icon="🕐" />
        <StatCard label="Banks" value={String(new Set(payees.map(p => p.bank)).size)} icon="🏦" />
      </View>

      {/* Recent payees */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recently used payees</Text>
        {recentPayees.length === 0 ? (
          <Text style={styles.empty}>No payees used yet</Text>
        ) : (
          recentPayees.map(p => (
            <View key={p.id} style={styles.payeeRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.nickname.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.payeeInfo}>
                <Text style={styles.payeeName}>{p.nickname}</Text>
                <Text style={styles.payeeSub}>{p.bank} · {maskAccountNumber(p.accountNumber)}</Text>
              </View>
              <Text style={styles.payeeDate}>{p.lastUsed ? formatDate(p.lastUsed) : '—'}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, gap: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  statsRow: { flexDirection: 'row', gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  empty: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
  payeeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#dbeafe',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '600', color: '#1d4ed8' },
  payeeInfo: { flex: 1 },
  payeeName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  payeeSub: { fontSize: 12, color: '#6b7280' },
  payeeDate: { fontSize: 12, color: '#9ca3af' },
})

const statStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
    gap: 4,
  },
  icon: { fontSize: 22 },
  value: { fontSize: 22, fontWeight: '700', color: '#111827' },
  label: { fontSize: 11, color: '#6b7280' },
})
