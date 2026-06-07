import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { payeesApi } from '../api/payees'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { formatDate, maskAccountNumber } from '../lib/utils'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { data: payees = [] } = useQuery({
    queryKey: ['payees'],
    queryFn: payeesApi.list,
  })

  const recentPayees = [...payees]
    .filter((p) => p.lastUsed)
    .sort((a, b) => (b.lastUsed ?? '').localeCompare(a.lastUsed ?? ''))
    .slice(0, 3)

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your account summary</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Payees" value={String(payees.length)} icon="👥" />
        <StatCard
          label="Used Recently"
          value={String(payees.filter((p) => p.lastUsed).length)}
          icon="🕐"
        />
        <StatCard label="Banks" value={String(new Set(payees.map((p) => p.bank)).size)} icon="🏦" />
      </div>

      {/* Recent payees */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recently used payees</h2>
          <Link
            to="/payees"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentPayees.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No payees used yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentPayees.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                  {p.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{p.nickname}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {p.bank} · {maskAccountNumber(p.accountNumber)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {p.lastUsed ? formatDate(p.lastUsed) : '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
