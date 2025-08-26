"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Define or import AppCountryData type
export interface AppCountryData {
  appId: string
  country: string
  today: {
    ESTIMATED_EARNINGS: number
    CLICKS: number
    IMPRESSIONS: number
    OBSERVED_ECPM: number
    IMPRESSION_CTR: number
    MATCH_RATE: number
  }
}

interface AppMetricsContextType {
  apiData: AppCountryData[]
  setApiData: (data: AppCountryData[]) => void
}

const AppMetricsContext = createContext<AppMetricsContextType | undefined>(undefined)

export const AppMetricsProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiData, setApiData] = useState<AppCountryData[]>([])

  return <AppMetricsContext.Provider value={{ apiData, setApiData }}>{children}</AppMetricsContext.Provider>
}

export const useAppMetrics = () => {
  const ctx = useContext(AppMetricsContext)
  if (!ctx) {
    throw new Error("useAppMetrics must be used within AppMetricsProvider")
  }
  return ctx
}
