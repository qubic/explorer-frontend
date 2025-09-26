import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface TurnstileState {
  token: string | null
  isLoading: boolean
  error: string | null
  isVerified: boolean
  lastVerifiedAt: number | null
}

const initialState: TurnstileState = {
  token: null,
  isLoading: false,
  error: null,
  isVerified: false,
  lastVerifiedAt: null
}

const turnstileSlice = createSlice({
  name: 'turnstile',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isVerified = true
      state.lastVerifiedAt = Date.now()
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isVerified = false
      state.token = null
    },
    clearToken: (state) => {
      state.token = null
      state.isVerified = false
      state.error = null
    },
    resetTurnstile: () => {
      return initialState
    }
  }
})

export const { setToken, setLoading, setError, clearToken, resetTurnstile } = turnstileSlice.actions
export default turnstileSlice.reducer
