import { LoginRequest, ApiResponse, User } from '@empcon/types'
import { baseApi } from './baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User }, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<{ user: User }>) => response.data!,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    refreshToken: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {}, // Empty body since refresh token comes from httpOnly cookie
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      transformResponse: (response: ApiResponse<{ user: User }>) => response.data!.user,
      providesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
} = authApi