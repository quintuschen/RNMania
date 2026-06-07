export type PayeeBank =
  | 'ANZ'
  | 'Commonwealth Bank'
  | 'Westpac'
  | 'NAB'
  | 'Macquarie'
  | 'Other'

export interface Payee {
  id: string
  nickname: string
  accountName: string
  accountNumber: string
  bsb: string
  bank: PayeeBank
  createdAt: string
  lastUsed: string | null
}

export interface User {
  id: string
  name: string
  email: string
}
