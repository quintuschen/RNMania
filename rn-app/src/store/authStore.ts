import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types'

// MIGRATION NOTE:
// Web version used zustand/middleware 'persist' with localStorage (default).
// RN has no localStorage → swap storage to AsyncStorage. One line change.

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Chen',
  email: 'alex.chen@demo.bank',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        await new Promise<void>((r) => setTimeout(() => r(), 800))
        if (email === 'demo@bank.com' && password === 'demo1234') {
          set({ user: MOCK_USER, token: 'mock-jwt-token' })
        } else {
          throw new Error('Invalid email or password')
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'rn-mania-auth',
      // Only change vs web: swap localStorage → AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
