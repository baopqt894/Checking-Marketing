import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/app/providers/SessionProvider"; // ✅ Import AuthProvider
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LimGrow Checking Marketing Dashboard",
  description: "Dashboard for LimGrow Checking Marketing analytics and reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> 
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
