import type { Metadata } from "next";
import { ReduxProvider } from "@/lib/providers";
import "./globals.css";
import { ProtectedLayout } from "@/shared/layout/ProtectedLayout";
import { Toaster } from "@/shared/ui/sonner";

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
          <ProtectedLayout>
            {children}
            <Toaster />
          </ProtectedLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
