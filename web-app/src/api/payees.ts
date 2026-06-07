import type { Payee, PayeeBank } from '../types'

// In-memory mock store — simulates a REST API
const store: Payee[] = [
  {
    id: 'p1',
    nickname: 'Landlord',
    accountName: 'John Smith Property',
    accountNumber: '123456789',
    bsb: '062-000',
    bank: 'Commonwealth Bank',
    createdAt: '2025-01-15T00:00:00Z',
    lastUsed: '2026-06-01T00:00:00Z',
  },
  {
    id: 'p2',
    nickname: 'Electricity',
    accountName: 'Origin Energy Pty Ltd',
    accountNumber: '987654321',
    bsb: '083-001',
    bank: 'NAB',
    createdAt: '2025-03-10T00:00:00Z',
    lastUsed: '2026-05-12T00:00:00Z',
  },
  {
    id: 'p3',
    nickname: 'Mum',
    accountName: 'Linda Chen',
    accountNumber: '456789012',
    bsb: '012-345',
    bank: 'ANZ',
    createdAt: '2024-11-20T00:00:00Z',
    lastUsed: null,
  },
]

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const payeesApi = {
  list: async (): Promise<Payee[]> => {
    await delay()
    return [...store]
  },

  get: async (id: string): Promise<Payee> => {
    await delay()
    const p = store.find((p) => p.id === id)
    if (!p) throw new Error('Payee not found')
    return { ...p }
  },

  create: async (
    data: Omit<Payee, 'id' | 'createdAt' | 'lastUsed'>
  ): Promise<Payee> => {
    await delay()
    const payee: Payee = {
      ...data,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    }
    store.push(payee)
    return { ...payee }
  },

  update: async (
    id: string,
    data: Partial<Omit<Payee, 'id' | 'createdAt'>>
  ): Promise<Payee> => {
    await delay()
    const idx = store.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Payee not found')
    store[idx] = { ...store[idx], ...data }
    return { ...store[idx] }
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const idx = store.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Payee not found')
    store.splice(idx, 1)
  },
}

export const BANKS: PayeeBank[] = [
  'ANZ',
  'Commonwealth Bank',
  'Westpac',
  'NAB',
  'Macquarie',
  'Other',
]
