import type { Metadata } from "next"
import { ReduxProvider } from "@/lib/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Comprehensive employee management solution for small businesses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}