import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSlice from './authSlice'
import payrollSlice from './payrollSlice'
import { baseApi } from './api/baseApi'

// Persist configuration
const persistConfig = {
  key: 'empcon-auth',
  storage,
  whitelist: ['auth'], // Only persist auth state
  version: 1,
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  payroll: payrollSlice,
  [baseApi.reducerPath]: baseApi.reducer,
})

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
})

export const persistor = persistStore(store)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch