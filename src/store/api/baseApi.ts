import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5002/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User',
    'Employee', 
    'Department',
    'Position',
    'Schedule',
    'TimeEntry',
    'LeaveRequest',
    'Payroll',
    'Notification'
  ],
  endpoints: () => ({}),
})

// Auth endpoints will be defined in authApi.ts