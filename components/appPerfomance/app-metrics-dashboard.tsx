"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ArrowLeft, Star, Settings, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricChart } from "./metric-chart"
import { UnifiedMetricsTable } from "./unified-metrics-table"
import { AppOverviewTable } from "./app-overview-table"

interface MetricData {
  CLICKS?: number
  ESTIMATED_EARNINGS?: number
  IMPRESSIONS?: number
  IMPRESSION_CTR?: number
  MATCH_RATE?: number
  OBSERVED_ECPM?: number
}

export interface AppCountryData {
  appId: string
  country: string
  today: MetricData
  yesterday: MetricData
  avg7: MetricData
  avg30: MetricData
}

interface ApiResponse {
  publisherId: string
  apps: AppCountryData[]
}

interface DailyMetric extends MetricData {
  date: string
}

const mockApiData: AppCountryData[] = [
  {
    appId: "app_name1",
    country: "US",
    today: {
      ESTIMATED_EARNINGS: 0.15234,
      CLICKS: 5,
      IMPRESSIONS: 12,
      OBSERVED_ECPM: 3.2,
      IMPRESSION_CTR: 0.41667,
      MATCH_RATE: 0.95,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.18,
      CLICKS: 6,
      IMPRESSIONS: 14,
      OBSERVED_ECPM: 3.5,
      IMPRESSION_CTR: 0.42857,
      MATCH_RATE: 0.96,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.14,
      CLICKS: 4.5,
      IMPRESSIONS: 11,
      OBSERVED_ECPM: 3.0,
      IMPRESSION_CTR: 0.40909,
      MATCH_RATE: 0.94,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.12,
      CLICKS: 4,
      IMPRESSIONS: 10,
      OBSERVED_ECPM: 2.8,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 0.93,
    },
  },
  {
    appId: "app_name1",
    country: "GB",
    today: {
      ESTIMATED_EARNINGS: 0.098,
      CLICKS: 3,
      IMPRESSIONS: 8,
      OBSERVED_ECPM: 2.1,
      IMPRESSION_CTR: 0.375,
      MATCH_RATE: 0.92,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.125,
      CLICKS: 4,
      IMPRESSIONS: 10,
      OBSERVED_ECPM: 2.5,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 0.94,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.11,
      CLICKS: 3.5,
      IMPRESSIONS: 9,
      OBSERVED_ECPM: 2.3,
      IMPRESSION_CTR: 0.38889,
      MATCH_RATE: 0.93,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.095,
      CLICKS: 3,
      IMPRESSIONS: 8,
      OBSERVED_ECPM: 2.0,
      IMPRESSION_CTR: 0.375,
      MATCH_RATE: 0.91,
    },
  },
  {
    appId: "app_name2",
    country: "CA",
    today: {
      ESTIMATED_EARNINGS: 0.067,
      CLICKS: 2,
      IMPRESSIONS: 6,
      OBSERVED_ECPM: 1.8,
      IMPRESSION_CTR: 0.33333,
      MATCH_RATE: 0.89,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.085,
      CLICKS: 3,
      IMPRESSIONS: 7,
      OBSERVED_ECPM: 2.1,
      IMPRESSION_CTR: 0.42857,
      MATCH_RATE: 0.91,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.075,
      CLICKS: 2.5,
      IMPRESSIONS: 6.5,
      OBSERVED_ECPM: 1.9,
      IMPRESSION_CTR: 0.38462,
      MATCH_RATE: 0.9,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.065,
      CLICKS: 2.2,
      IMPRESSIONS: 6,
      OBSERVED_ECPM: 1.7,
      IMPRESSION_CTR: 0.36667,
      MATCH_RATE: 0.88,
    },
  },
  {
    appId: "app_name2",
    country: "DE",
    today: {
      ESTIMATED_EARNINGS: 0.045,
      CLICKS: 1,
      IMPRESSIONS: 4,
      OBSERVED_ECPM: 1.4,
      IMPRESSION_CTR: 0.25,
      MATCH_RATE: 0.87,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.062,
      CLICKS: 2,
      IMPRESSIONS: 5,
      OBSERVED_ECPM: 1.7,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 0.89,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.055,
      CLICKS: 1.5,
      IMPRESSIONS: 4.5,
      OBSERVED_ECPM: 1.5,
      IMPRESSION_CTR: 0.33333,
      MATCH_RATE: 0.88,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.048,
      CLICKS: 1.3,
      IMPRESSIONS: 4,
      OBSERVED_ECPM: 1.3,
      IMPRESSION_CTR: 0.325,
      MATCH_RATE: 0.86,
    },
  },
  {
    appId: "app_name1",
    country: "FR",
    today: {
      ESTIMATED_EARNINGS: 0.038,
      CLICKS: 1,
      IMPRESSIONS: 3,
      OBSERVED_ECPM: 1.2,
      IMPRESSION_CTR: 0.33333,
      MATCH_RATE: 0.85,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.051,
      CLICKS: 1,
      IMPRESSIONS: 4,
      OBSERVED_ECPM: 1.5,
      IMPRESSION_CTR: 0.25,
      MATCH_RATE: 0.87,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.044,
      CLICKS: 1.2,
      IMPRESSIONS: 3.5,
      OBSERVED_ECPM: 1.3,
      IMPRESSION_CTR: 0.34286,
      MATCH_RATE: 0.86,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.04,
      CLICKS: 1.1,
      IMPRESSIONS: 3.2,
      OBSERVED_ECPM: 1.1,
      IMPRESSION_CTR: 0.34375,
      MATCH_RATE: 0.84,
    },
  },
  {
    appId: "app_name1",
    country: "US",
    today: {
      ESTIMATED_EARNINGS: 0.12014,
      CLICKS: 3,
      IMPRESSIONS: 7,
      OBSERVED_ECPM: 2.5,
      IMPRESSION_CTR: 0.42857,
      MATCH_RATE: 1.0,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.15,
      CLICKS: 4,
      IMPRESSIONS: 8,
      OBSERVED_ECPM: 3.0,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.1,
      CLICKS: 2.5,
      IMPRESSIONS: 6,
      OBSERVED_ECPM: 2.2,
      IMPRESSION_CTR: 0.41667,
      MATCH_RATE: 1.0,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.08,
      CLICKS: 2,
      IMPRESSIONS: 5,
      OBSERVED_ECPM: 2.0,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 1.0,
    },
  },
  {
    appId: "app_name1",
    country: "GB",
    today: {
      ESTIMATED_EARNINGS: 0.085,
      CLICKS: 2,
      IMPRESSIONS: 5,
      OBSERVED_ECPM: 1.8,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 1.0,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.12,
      CLICKS: 3,
      IMPRESSIONS: 7,
      OBSERVED_ECPM: 2.2,
      IMPRESSION_CTR: 0.42857,
      MATCH_RATE: 1.0,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.09,
      CLICKS: 2.2,
      IMPRESSIONS: 5.5,
      OBSERVED_ECPM: 1.9,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 1.0,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.075,
      CLICKS: 1.8,
      IMPRESSIONS: 4.5,
      OBSERVED_ECPM: 1.7,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 1.0,
    },
  },
  {
    appId: "app_name2",
    country: "CA",
    today: {
      ESTIMATED_EARNINGS: 0.055,
      CLICKS: 1,
      IMPRESSIONS: 3,
      OBSERVED_ECPM: 1.5,
      IMPRESSION_CTR: 0.33333,
      MATCH_RATE: 1.0,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.08,
      CLICKS: 2,
      IMPRESSIONS: 4,
      OBSERVED_ECPM: 1.8,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.06,
      CLICKS: 1.5,
      IMPRESSIONS: 3.5,
      OBSERVED_ECPM: 1.6,
      IMPRESSION_CTR: 0.42857,
      MATCH_RATE: 1.0,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.05,
      CLICKS: 1.2,
      IMPRESSIONS: 3,
      OBSERVED_ECPM: 1.4,
      IMPRESSION_CTR: 0.4,
      MATCH_RATE: 1.0,
    },
  },
  {
    appId: "app_name3",
    country: "US",
    today: {
      ESTIMATED_EARNINGS: 0.0636,
      CLICKS: 2,
      IMPRESSIONS: 4,
      OBSERVED_ECPM: 2.1,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.08,
      CLICKS: 2.5,
      IMPRESSIONS: 5,
      OBSERVED_ECPM: 2.4,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.07,
      CLICKS: 2.2,
      IMPRESSIONS: 4.4,
      OBSERVED_ECPM: 2.2,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.065,
      CLICKS: 2.1,
      IMPRESSIONS: 4.2,
      OBSERVED_ECPM: 2.0,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
  },
  {
    appId: "app_name2",
    country: "DE",
    today: {
      ESTIMATED_EARNINGS: 0.042,
      CLICKS: 1,
      IMPRESSIONS: 2,
      OBSERVED_ECPM: 1.3,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    yesterday: {
      ESTIMATED_EARNINGS: 0.06,
      CLICKS: 1.5,
      IMPRESSIONS: 3,
      OBSERVED_ECPM: 1.6,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg7: {
      ESTIMATED_EARNINGS: 0.05,
      CLICKS: 1.3,
      IMPRESSIONS: 2.6,
      OBSERVED_ECPM: 1.4,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
    avg30: {
      ESTIMATED_EARNINGS: 0.045,
      CLICKS: 1.1,
      IMPRESSIONS: 2.2,
      OBSERVED_ECPM: 1.2,
      IMPRESSION_CTR: 0.5,
      MATCH_RATE: 1.0,
    },
  },
]

const generateMockDailyData = (appId: string, country: string): DailyMetric[] => {
  const data: DailyMetric[] = []
  const baseEarnings = Math.random() * 0.1 + 0.05

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const variation = (Math.random() - 0.5) * 0.3
    const earnings = Math.max(0, baseEarnings * (1 + variation))
    const clicks = Math.floor(earnings * 20 + Math.random() * 5)
    const impressions = Math.floor(clicks * (2 + Math.random() * 3))

    data.push({
      date: date.toISOString().split("T")[0],
      ESTIMATED_EARNINGS: earnings,
      CLICKS: clicks,
      IMPRESSIONS: impressions,
      OBSERVED_ECPM: earnings > 0 && impressions > 0 ? (earnings / impressions) * 1000 : 0,
      IMPRESSION_CTR: impressions > 0 ? clicks / impressions : 0,
      MATCH_RATE: 0.9 + Math.random() * 0.1,
    })
  }

  return data
}

interface AppMetricsDashboardProps {
  initialSelectedApp?: string
}

export function AppMetricsDashboard({ initialSelectedApp }: AppMetricsDashboardProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>("pub-6472469337251368")
  const [selectedApp, setSelectedApp] = useState<string | null>(initialSelectedApp || null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["ESTIMATED_EARNINGS"])

  const [apiData, setApiData] = useState<AppCountryData[]>(mockApiData)
  const [dailyData, setDailyData] = useState<DailyMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(true)

  const [countryPage, setCountryPage] = useState(1)

  const availablePublishers = [
    { id: "pub-6472469337251368", name: "Nguyenhatanh.dev@gmail.com" },
    { id: "pub-5804239035296145", name: "mkt@controlsolution.org" },
  ]

  const fetchOverviewData = async (publisherId: string) => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(
        `http://localhost:2703/tokens/app-metrics-30d-by-publisherid?publisherId=${publisherId}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const data = await response.json()
      console.log("[v0] Raw API response:", data)

      let appsData: AppCountryData[] = []

      if (data && data.apps && Array.isArray(data.apps)) {
        // API returns { publisherId, apps: [...] } format
        appsData = data.apps
        console.log("[v0] Successfully parsed API response with", appsData.length, "app records")
        setApiData(appsData)
        setUsingMockData(false)
        setError(null)
      } else if (data && Array.isArray(data)) {
        // If API returns array directly
        appsData = data
        console.log("[v0] Successfully parsed direct array response with", appsData.length, "app records")
        setApiData(appsData)
        setUsingMockData(false)
        setError(null)
      } else {
        console.log("[v0] Unexpected API response format:", data)
        console.log("[v0] Falling back to mock data due to format mismatch")
        setApiData(mockApiData)
        setUsingMockData(true)
        setError("Unexpected API response format")
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("[v0] API call was cancelled")
        return
      }

      console.log("[v0] API connection failed:", err.message)
      console.log("[v0] Falling back to mock data")
      setApiData(mockApiData)
      setUsingMockData(true)
      setError(`API connection failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyData = async (appId: string, country: string) => {
    try {
      setDailyLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // Increase timeout

      const response = await fetch(
        `http://localhost:2703/tokens/app-daily-metrics-30d-country?appId=${appId}&country=${country}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const data = await response.json()

      if (data && data.metrics && Array.isArray(data.metrics)) {
        // Transform API format to expected format
        const transformedData: DailyMetric[] = data.metrics.map((item: any) => ({
          date: item.date,
          ESTIMATED_EARNINGS: item.metrics.ESTIMATED_EARNINGS || 0,
          CLICKS: item.metrics.CLICKS || 0,
          IMPRESSIONS: item.metrics.IMPRESSIONS || 0,
          IMPRESSION_CTR: item.metrics.IMPRESSION_CTR || 0,
          MATCH_RATE: item.metrics.MATCH_RATE || 0,
          OBSERVED_ECPM: item.metrics.OBSERVED_ECPM || 0,
        }))
        setDailyData(transformedData)
        console.log("[v0] Successfully loaded", transformedData.length, "daily records")
      } else if (Array.isArray(data)) {
        // If API returns array directly
        setDailyData(data)
        console.log("[v0] Successfully loaded", data.length, "daily records")
      } else {
        console.log("[v0] Daily API response format:", data)
        throw new Error("Unexpected daily API response format")
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("[v0] Daily API call was cancelled")
        return
      }

      console.error("[v0] Daily data API failed:", err.message)
      console.log("[v0] Using mock daily data")
      setDailyData(generateMockDailyData(appId, country))
    } finally {
      setDailyLoading(false)
    }
  }

  useEffect(() => {
    fetchOverviewData(selectedPublisherId)
  }, [selectedPublisherId])

  const handlePublisherChange = (publisherId: string) => {
    setSelectedPublisherId(publisherId)
    setSelectedApp(null)
    setSelectedCountry(null)
    setDailyData([])
  }

  const apps = [...new Set(apiData.map((item) => item.appId))]

  const metricOptions = [
    {
      value: "ESTIMATED_EARNINGS",
      label: "Estimated Earnings",
      format: (val: number) => `$${val.toFixed(5)}`,
      color: "#3b82f6",
    },
    { value: "CLICKS", label: "Clicks", format: (val: number) => val.toFixed(1), color: "#ef4444" },
    { value: "IMPRESSIONS", label: "Impressions", format: (val: number) => val.toFixed(1), color: "#10b981" },
    { value: "OBSERVED_ECPM", label: "Observed eCPM", format: (val: number) => `$${val.toFixed(2)}`, color: "#f59e0b" },
    {
      value: "IMPRESSION_CTR",
      label: "Impression CTR",
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
      color: "#8b5cf6",
    },
    {
      value: "MATCH_RATE",
      label: "Match Rate",
      format: (val: number) => `${(val * 100).toFixed(1)}%`,
      color: "#06b6d4",
    },
  ]

  const getSelectedMetricConfigs = () => {
    return selectedMetrics
      .map((metricKey) => metricOptions.find((m) => m.value === metricKey))
      .filter(Boolean)
      .map((metric) => ({
        key: metric!.value,
        label: metric!.label,
        format: metric!.format,
        color: metric!.color,
      }))
  }

  const hasAnyDangerousApps = () => {
    return apps.some((app) => {
      const appCountries = apiData.filter((item) => item.appId === app)
      return appCountries.some((item) => {
        const calculateChange = (current: number, previous: number) => {
          if (!previous || previous === 0) return 0
          return ((current - previous) / previous) * 100
        }

        const currentData = Object.keys(item.today).length > 0 ? item.today : item.avg7
        const previousData = Object.keys(item.yesterday).length > 0 ? item.yesterday : item.avg30

        if (currentData && previousData) {
          const changes = {
            ESTIMATED_EARNINGS: calculateChange(
              currentData.ESTIMATED_EARNINGS || 0,
              previousData.ESTIMATED_EARNINGS || 0,
            ),
            CLICKS: calculateChange(currentData.CLICKS || 0, previousData.CLICKS || 0),
            IMPRESSIONS: calculateChange(currentData.IMPRESSIONS || 0, previousData.IMPRESSIONS || 0),
            IMPRESSION_CTR: calculateChange(currentData.IMPRESSION_CTR || 0, previousData.IMPRESSION_CTR || 0),
            MATCH_RATE: calculateChange(currentData.MATCH_RATE || 0, previousData.MATCH_RATE || 0),
            OBSERVED_ECPM: calculateChange(currentData.OBSERVED_ECPM || 0, previousData.OBSERVED_ECPM || 0),
          }

          return Object.values(changes).some((change) => change < -20)
        }
        return false
      })
    })
  }

  useEffect(() => {
    if (selectedApp && selectedCountry) {
      fetchDailyData(selectedApp, selectedCountry)
    }
  }, [selectedApp, selectedCountry])

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-80 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
              <p className="text-gray-500 text-sm mt-1">Kết nối đến API server...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedApp && selectedCountry) {
    const latestData = dailyData[dailyData.length - 1]
    const previousData = dailyData[dailyData.length - 2]

    const calculateChange = (current: number, previous: number) => {
      if (!previous || previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    const currentMetricOption = metricOptions.find((m) => m.value === selectedMetrics[0])
    const currentValue = (latestData?.[selectedMetrics[0] as keyof typeof latestData] as number) || 0
    const previousValue = (previousData?.[selectedMetrics[0] as keyof typeof previousData] as number) || 0
    const metricChange = calculateChange(currentValue, previousValue)

    const countryApiData = apiData.find((item) => item.appId === selectedApp && item.country === selectedCountry)

    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <span className="font-bold">PRO</span>
                </div>
                <nav className="flex items-center gap-6">
                  <button className="font-medium border-b-2 border-purple-500 pb-2">Trade</button>
                  <button className="text-gray-400 hover:text-gray-900 pb-2">Portfolio</button>
                  <button className="text-gray-400 hover:text-gray-900 pb-2">Analytics</button>
                  <button className="text-gray-400 hover:text-gray-900 pb-2">History</button>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Portfolio value</div>
                  <div className="font-mono">******* USD</div>
                </div>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-100 bg-transparent">
                  Account
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-full px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {selectedCountry.charAt(0)}
                  </div>
                  <span className="font-bold text-lg">
                    {selectedApp.split("~")[0]}/{selectedCountry}
                  </span>
                  <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div>
                    <div className="text-gray-600">Last price</div>
                    <div className="font-mono">{currentMetricOption?.format(currentValue)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Index price</div>
                    <div className="font-mono">{currentMetricOption?.format(currentValue * 0.99)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">24h change</div>
                    <div className={`font-mono ${metricChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {metricChange >= 0 ? "+" : ""}
                      {metricChange.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">24h volume</div>
                    <div className="font-mono">
                      {(currentValue * 1000).toFixed(0)} {selectedMetrics[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Maker / Taker fee</div>
                    <div className="font-mono">0.16% / 0.26%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-140px)]">
            {/* Left Panel - Order Form */}
            <div className="w-80 border-r border-gray-200 bg-white">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Order form</h3>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-100 rounded p-3">
                    <div className="text-sm text-gray-600 mb-2">2/3 - Get verified</div>
                    <div className="text-sm text-gray-500 mb-3">Verification takes only a few minutes.</div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Verify your account</Button>
                  </div>

                  <Tabs defaultValue="spot" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                      <TabsTrigger value="spot" className="text-gray-900 data-[state=active]:bg-gray-200">
                        Spot
                      </TabsTrigger>
                      <TabsTrigger value="margin" className="text-gray-900 data-[state=active]:bg-gray-200">
                        Margin
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="spot" className="space-y-4 mt-4">
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">Buy</Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-300 text-gray-500 hover:bg-gray-100 bg-transparent"
                        >
                          Sell
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Limit price</label>
                          <div className="flex items-center bg-gray-100 rounded mt-1">
                            <input
                              type="text"
                              value={currentValue.toFixed(5)}
                              className="flex-1 bg-transparent text-gray-900 p-2 text-right font-mono"
                              readOnly
                            />
                            <span className="text-gray-400 pr-2 text-sm">USD</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600">Quantity</label>
                          <div className="flex items-center bg-gray-100 rounded mt-1">
                            <input
                              type="text"
                              value="0.0001"
                              className="flex-1 bg-transparent text-gray-900 p-2 text-right font-mono"
                            />
                            <span className="text-gray-400 pr-2 text-sm">{selectedMetrics[0]}</span>
                          </div>
                        </div>

                        <div className="bg-gray-100 rounded p-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total</span>
                            <span className="font-mono">≈ 1.65 USD</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Buy {selectedMetrics[0]}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Center Panel - Order Book */}
            <div className="flex-1 border-r border-gray-200 bg-white">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Order book</h3>
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600">0.10</div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 p-2 text-xs text-gray-600 border-b border-gray-200">
                    <div>Price</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Total</div>
                  </div>

                  {/* Sell Orders (Red) */}
                  <div className="h-1/2 overflow-y-auto">
                    {Array.from({ length: 15 }, (_, i) => {
                      const price = currentValue * (1 + (i + 1) * 0.001)
                      const quantity = Math.random() * 5
                      return (
                        <div key={i} className="grid grid-cols-3 gap-4 p-1 text-xs hover:bg-gray-100 cursor-pointer">
                          <div className="text-red-600 font-mono">{price.toFixed(5)}</div>
                          <div className="text-right text-gray-500 font-mono">{quantity.toFixed(8)}</div>
                          <div className="text-right text-gray-500 font-mono">{(price * quantity).toFixed(5)}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Spread */}
                  <div className="border-y border-gray-200 p-2 text-center">
                    <div className="text-xs text-gray-600">Spread: 0.1 0.001%</div>
                  </div>

                  {/* Buy Orders (Green) */}
                  <div className="h-1/2 overflow-y-auto">
                    {Array.from({ length: 15 }, (_, i) => {
                      const price = currentValue * (1 - (i + 1) * 0.001)
                      const quantity = Math.random() * 5
                      return (
                        <div key={i} className="grid grid-cols-3 gap-4 p-1 text-xs hover:bg-gray-100 cursor-pointer">
                          <div className="text-green-600 font-mono">{price.toFixed(5)}</div>
                          <div className="text-right text-gray-500 font-mono">{quantity.toFixed(8)}</div>
                          <div className="text-right text-gray-500 font-mono">{(price * quantity).toFixed(5)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Charts */}
            <div className="flex-1 bg-white">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Market chart</h3>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  {dailyLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading chart...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-gray-100 rounded">
                      <MetricChart
                        data={dailyData}
                        selectedMetrics={getSelectedMetricConfigs()}
                        title="Daily Performance Metrics"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white">
            <Tabs defaultValue="balances" className="w-full">
              <div className="px-6">
                <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
                  <TabsTrigger
                    value="balances"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Balances
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Open orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="positions"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Margin positions
                  </TabsTrigger>
                  <TabsTrigger
                    value="trades"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Trades
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="balances" className="p-6">
                <div className="text-gray-600 text-center py-8">No balances to display</div>
              </TabsContent>
              <TabsContent value="orders" className="p-6">
                <div className="text-gray-600 text-center py-8">No open orders</div>
              </TabsContent>
              <TabsContent value="positions" className="p-6">
                <div className="text-gray-600 text-center py-8">No margin positions</div>
              </TabsContent>
              <TabsContent value="trades" className="p-6">
                <div className="text-gray-600 text-center py-8">No trades</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  if (selectedApp) {
    const details = apiData.filter((item) => item.appId === selectedApp)
    const countriesPerPage = 10 // Reduced from 20 to improve performance
    const totalPages = Math.ceil(details.length / countriesPerPage)
    const paginatedDetails = details.slice((countryPage - 1) * countriesPerPage, countryPage * countriesPerPage)

    console.log("[v0] Selected app:", selectedApp)
    console.log("[v0] Total countries for app:", details.length)
    console.log("[v0] Showing countries:", paginatedDetails.length, "on page", countryPage)

    console.log("[v0] Available apps in API data:", apps)
    console.log("[v0] API data sample:", apiData.slice(0, 3))
    if (details.length === 0) {
      console.log("[v0] WARNING: No data found for selected app. This indicates an app ID mismatch.")
      console.log("[v0] Selected app ID:", selectedApp)
      console.log("[v0] Available app IDs:", apps)
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-full mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Apps
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">App Performance Details</h1>
              </div>
              <p className="text-gray-600">
                Viewing metrics for: <span className="font-mono text-gray-900">{selectedApp}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Publisher</div>
              <div className="font-medium text-gray-900">
                {availablePublishers.find((p) => p.id === selectedPublisherId)?.name}
              </div>
            </div>
          </div>

          {usingMockData && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Using mock data. API connection failed: {error}
              </AlertDescription>
            </Alert>
          )}

          <UnifiedMetricsTable
            selectedApp={selectedApp}
            apiData={paginatedDetails}
            onSelectCountry={(country) => setSelectedCountry(country)}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCountryPage(Math.max(1, countryPage - 1))}
                disabled={countryPage === 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {countryPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCountryPage(Math.min(totalPages, countryPage + 1))}
                disabled={countryPage === totalPages}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">App Performance Monitor</h1>
              <p className="text-gray-600 mt-1">Real-time app metrics tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Publisher:</label>
              <Select value={selectedPublisherId} onValueChange={handlePublisherChange}>
                <SelectTrigger className="w-64 bg-white border-gray-300">
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {availablePublishers.map((publisher) => (
                    <SelectItem key={publisher.id} value={publisher.id} className="hover:bg-gray-50">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{publisher.name}</span>
                        <span className="text-xs text-gray-500">{publisher.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {usingMockData && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Using mock data. API connection failed: {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg border border-gray-200">
          <AppOverviewTable apiData={apiData} onSelectApp={setSelectedApp} />
        </div>
      </div>
    </div>
  )
}

export default AppMetricsDashboard
