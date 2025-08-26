import React, { createContext, useContext, useState } from "react"
import type { AppCountryData } from "./app-metrics-dashboard"

interface AppMetricsContextType {
  apiData: AppCountryData[]
  setApiData: (data: AppCountryData[]) => void
}

const AppMetricsContext = createContext<AppMetricsContextType | undefined>(undefined)

export const AppMetricsProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiData, setApiData] = useState<AppCountryData[]>([])
  return (
    <AppMetricsContext.Provider value={{ apiData, setApiData }}>
      {children}
    </AppMetricsContext.Provider>
  )
}

export const useAppMetrics = () => {
  const ctx = useContext(AppMetricsContext)
  if (!ctx) throw new Error("useAppMetrics must be used within AppMetricsProvider")
  return ctx
}
