export function formatBSB(bsb: string): string {
  const digits = bsb.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 3) return digits
  return `${digits.slice(0, 3)}-${digits.slice(3)}`
}

export function formatAccountNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account
  return '•'.repeat(account.length - 4) + account.slice(-4)
}
