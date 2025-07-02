import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getSupabaseClient } from '../../lib/supabase'

// Types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'patient' | 'doctor' | 'admin'
  verified: boolean
  createdAt: string
  lastLogin?: string
}

export interface AuthState {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Session state
  sessionId: string | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  
  // UI state
  showLoginModal: boolean
  showRegisterModal: boolean
  
  // Error handling
  error: string | null
  lastError: string | null
  
  // Preferences (persisted)
  preferences: {
    language: 'es' | 'en'
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    location: { latitude: number; longitude: number } | null
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sessionId: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  showLoginModal: false,
  showRegisterModal: false,
  error: null,
  lastError: null,
  preferences: {
    language: 'es',
    theme: 'system',
    notifications: true,
    location: null,
  },
}

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name,
          avatar: data.user.user_metadata?.avatar_url,
          role: data.user.user_metadata?.role || 'patient',
          verified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at,
          lastLogin: new Date().toISOString(),
        } as User,
        session: {
          sessionId: data.session.access_token,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at! * 1000, // Convert to milliseconds
        }
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign in')
    }
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ 
    email, 
    password, 
    name, 
    role = 'patient' 
  }: { 
    email: string
    password: string
    name: string
    role?: 'patient' | 'doctor'
  }, { rejectWithValue }) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      })
      
      if (error) throw error
      
      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
          name,
          role,
          verified: false,
          createdAt: data.user.created_at,
        } as User : null,
        needsVerification: !data.session,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign up')
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      return {}
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign out')
    }
  }
)

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (data.session) {
        return {
          sessionId: data.session.access_token,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at! * 1000,
        }
      }
      
      throw new Error('No session returned')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh session')
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Session management
    setSession: (state, action: PayloadAction<{
      sessionId: string
      accessToken: string
      refreshToken: string
      expiresAt: number
    }>) => {
      const { sessionId, accessToken, refreshToken, expiresAt } = action.payload
      state.sessionId = sessionId
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.expiresAt = expiresAt
    },
    
    clearSession: (state) => {
      state.sessionId = null
      state.accessToken = null
      state.refreshToken = null
      state.expiresAt = null
    },
    
    // User management
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    
    // UI state
    setShowLoginModal: (state, action: PayloadAction<boolean>) => {
      state.showLoginModal = action.payload
      if (action.payload) {
        state.showRegisterModal = false
      }
    },
    
    setShowRegisterModal: (state, action: PayloadAction<boolean>) => {
      state.showRegisterModal = action.payload
      if (action.payload) {
        state.showLoginModal = false
      }
    },
    
    // Preferences
    setLanguage: (state, action: PayloadAction<'es' | 'en'>) => {
      state.preferences.language = action.payload
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.preferences.theme = action.payload
    },
    
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.preferences.notifications = action.payload
    },
    
    setUserLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
      state.preferences.location = action.payload
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.lastError = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
  
  extraReducers: (builder) => {
    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.sessionId = action.payload.session.sessionId
        state.accessToken = action.payload.session.accessToken
        state.refreshToken = action.payload.session.refreshToken
        state.expiresAt = action.payload.session.expiresAt
        state.showLoginModal = false
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.user) {
          state.user = action.payload.user
          state.isAuthenticated = !action.payload.needsVerification
        }
        state.showRegisterModal = false
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Sign out
    builder
      .addCase(signOut.fulfilled, (state) => {
        return { ...initialState, preferences: state.preferences }
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // Refresh session
    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.sessionId = action.payload.sessionId
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.expiresAt = action.payload.expiresAt
      })
      .addCase(refreshSession.rejected, (state) => {
        // Clear session on refresh failure
        state.sessionId = null
        state.accessToken = null
        state.refreshToken = null
        state.expiresAt = null
        state.isAuthenticated = false
      })
  },
})

// Export actions
export const {
  setSession,
  clearSession,
  setUser,
  updateUser,
  clearUser,
  setShowLoginModal,
  setShowRegisterModal,
  setLanguage,
  setTheme,
  setNotifications,
  setUserLocation,
  setError,
  clearError,
} = authSlice.actions

// Export reducer
export default authSlice.reducer
