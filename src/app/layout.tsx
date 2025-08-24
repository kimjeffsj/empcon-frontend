import type { Metadata } from "next";
import { ReduxProvider } from "@/lib/providers";
import "./globals.css";
import { AppLayout } from "@/shared/layout/AppLayout";
import { ProtectedLayout } from "@/shared/layout/ProtectedLayout";

export const metadata: Metadata = {
  title: "Employee Management System",
  description:
    "Comprehensive employee management solution for small businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ReduxProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
