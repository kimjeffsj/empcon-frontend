import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserRole } from '@empcon/types'

interface User {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  department?: string
  position?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  tokenExpired: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  tokenExpired: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
      state.tokenExpired = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isRefreshing = false
      state.tokenExpired = false
    },
    clearUserData: (state) => {
      // Explicitly clear user data (used when redirecting to login)
      state.user = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setTokenRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload
    },
    tokenRefreshSuccess: (state) => {
      state.isRefreshing = false
      state.tokenExpired = false
      // Keep user and isAuthenticated as they are
    },
    tokenRefreshFailed: (state) => {
      // Clear authentication but preserve user info for potential recovery
      state.isAuthenticated = false
      state.isRefreshing = false
      state.tokenExpired = true
      state.isLoading = false
      // Note: Keep user data for recovery, it will be cleared by ProtectedLayout redirect
    },
  },
})

export const {
  setCredentials,
  logout,
  clearUserData,
  setLoading,
  setTokenRefreshing,
  tokenRefreshSuccess,
  tokenRefreshFailed
} = authSlice.actions

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated

export default authSlice.reducer