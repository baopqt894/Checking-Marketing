"use client"

import { AppMetricsProvider } from "@/components/appPerfomance/AppMetricsContext"

export default function AppPerformanceLayout({ children }: { children: React.ReactNode }) {
  return <AppMetricsProvider>{children}</AppMetricsProvider>
}
