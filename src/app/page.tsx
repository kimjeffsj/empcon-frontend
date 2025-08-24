import { redirect } from 'next/navigation'

export default function HomePage() {
  // TODO: Check authentication status with Redux
  // For now, redirect to login
  redirect('/login')
}