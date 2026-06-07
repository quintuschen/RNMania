import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payeesApi } from '../../api/payees'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { maskAccountNumber, formatDate } from '../../lib/utils'

export function PayeesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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

  const filtered = payees.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.nickname.toLowerCase().includes(q) ||
      p.accountName.toLowerCase().includes(q) ||
      p.bank.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payees</h1>
            <p className="text-gray-500 text-sm mt-1">
              {payees.length} saved {payees.length === 1 ? 'payee' : 'payees'}
            </p>
          </div>
          <Link
            to="/payees/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Add payee
          </Link>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or bank…"
          className="w-full mb-4 rounded-lg border border-gray-300 px-4 py-2 text-sm
            outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {search ? 'No payees match your search' : 'No payees yet — add one!'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payee</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Bank & BSB</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last used</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((payee) => (
                  <tr key={payee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {payee.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payee.nickname}</p>
                          <p className="text-xs text-gray-500">{payee.accountName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="blue">{payee.bank}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{payee.bsb}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700">
                      {maskAccountNumber(payee.accountNumber)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {payee.lastUsed ? formatDate(payee.lastUsed) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/payees/${payee.id}/edit`}
                          className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setConfirmDelete(payee.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Delete payee?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove{' '}
              <span className="font-medium text-gray-700">
                {payees.find((p) => p.id === confirmDelete)?.nickname}
              </span>{' '}
              from your payees list.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
