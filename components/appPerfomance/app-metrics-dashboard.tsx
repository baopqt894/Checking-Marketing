"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppOverviewTable } from "./app-overview-table"
import { MetricChart } from "./metric-chart"
import { Checkbox } from "@/components/ui/checkbox"

interface MetricData {
  CLICKS?: number
  ESTIMATED_EARNINGS?: number
  IMPRESSIONS?: number
  IMPRESSION_CTR?: number
  MATCH_RATE?: number
  OBSERVED_ECPM?: number
}

interface AppCountryData {
  appId: string
  appName: string
  metrics: {
    ESTIMATED_EARNINGS: number
    CLICKS: number
    IMPRESSIONS: number
    OBSERVED_ECPM: number
    IMPRESSION_CTR: number
    MATCH_RATE: number
  }
}

interface ApiResponse {
  publisherId: string
  apps: AppCountryData[]
  date: string
}

interface DailyMetric {
  date: string
  metrics: {
    CLICKS?: number
    ESTIMATED_EARNINGS?: number
    IMPRESSIONS?: number
    IMPRESSION_CTR?: number
    MATCH_RATE?: number
    OBSERVED_ECPM?: number
  }
}

interface App30DayResponse {
  appId: string
  appName: string
  metrics: DailyMetric[]
}

interface AppMetricsDashboardProps {
  initialSelectedApp?: string
}

export function AppMetricsDashboard({ initialSelectedApp }: AppMetricsDashboardProps) {
  const { useRouter } = require('next/navigation');
  const router = useRouter();
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>("")
  const [selectedApp, setSelectedApp] = useState<string | null>(initialSelectedApp || null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["ESTIMATED_EARNINGS"])

  const [apiData, setApiData] = useState<AppCountryData[]>([])
  const [dailyData, setDailyData] = useState<DailyMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [countryPage, setCountryPage] = useState(1)

  const [availablePublishers, setAvailablePublishers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703"
        const response = await fetch(`${apiUrl}tokens/publishers`)
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        const data = await response.json()
        const publishers: { id: string; name: string }[] = []
        data.forEach((item: any) => {
          if (Array.isArray(item.publisher_ids)) {
            item.publisher_ids.forEach((id: string) => {
              publishers.push({ id, name: item.email })
            })
          }
        })
        setAvailablePublishers(publishers)
        if (publishers.length > 0) {
          setSelectedPublisherId((prev) => prev || publishers[0].id)
        }
      } catch (err: any) {
        setError("Failed to load publishers: " + err.message)
      }
    }
    fetchPublishers()
  }, [])

  useEffect(() => {
    if (selectedPublisherId) {
      fetchOverviewData(selectedPublisherId)
    }
  }, [selectedPublisherId])

  useEffect(() => {
    if (initialSelectedApp && selectedPublisherId) {
      setSelectedApp(initialSelectedApp)
      fetch30DayData(initialSelectedApp)
    }
  }, [initialSelectedApp, selectedPublisherId])

  const fetchOverviewData = async (publisherId: string) => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703"
      const response = await fetch(`${apiUrl}tokens/app-metrics-30d-by-publisherid?publisherId=${publisherId}`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const data: ApiResponse = await response.json()
      console.log("[v0] Raw API response:", data)

      if (data && data.apps && Array.isArray(data.apps)) {
        setApiData(data.apps)
        console.log("[v0] Successfully loaded", data.apps.length, "apps")
        setError(null)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("[v0] API call was cancelled")
        return
      }

      console.log("[v0] API connection failed:", err.message)
      setError(`API connection failed: ${err.message}`)
      setApiData([])
    } finally {
      setLoading(false)
    }
  }

  const fetch30DayData = async (appId: string) => {
    try {
      setDailyLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703"
      const response = await fetch(`${apiUrl}tokens/app-daily-metrics-30d?appId=${appId}`)

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const data: App30DayResponse = await response.json()
      console.log("[v0] 30-day API response:", data)

      if (data && data.metrics && Array.isArray(data.metrics)) {
        setDailyData(data.metrics)
        console.log("[v0] Successfully loaded", data.metrics.length, "daily metrics")
      } else {
        throw new Error("Invalid 30-day API response format")
      }
    } catch (err: any) {
      console.log("[v0] 30-day API call failed:", err.message)
      setError(`Failed to load 30-day data: ${err.message}`)
      setDailyData([])
    } finally {
      setDailyLoading(false)
    }
  }

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

  const chartData = dailyData.map((day) => ({
    date: day.date,
    CLICKS: day.metrics?.CLICKS || 0,
    ESTIMATED_EARNINGS: day.metrics?.ESTIMATED_EARNINGS || 0,
    IMPRESSIONS: day.metrics?.IMPRESSIONS || 0,
    IMPRESSION_CTR: day.metrics?.IMPRESSION_CTR || 0,
    MATCH_RATE: day.metrics?.MATCH_RATE || 0,
    OBSERVED_ECPM: day.metrics?.OBSERVED_ECPM || 0,
  }))

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">App Performance Monitor</h1>
              <p className="text-gray-600 mt-1">
                {selectedApp ? "30-day performance data for selected app" : "Today's app metrics overview"}
              </p>
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

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {selectedApp && dailyData.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">30-Day Performance Data</h2>
                  <p className="text-gray-600 mt-1">App ID: {selectedApp}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedApp(null);
                    setDailyData([]);
                    router.push('/dashboard/app-performance');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Back to Overview
                </button>
              </div>
            </div>
            <div className="p-6">
              {dailyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading 30-day data...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Daily Metrics Table</h3>
                    </div>
                    <div style={{ maxHeight: "500px", overflowY: "auto" }} className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                          <tr>
                            <th className="text-left p-3 text-gray-700 font-medium">Date</th>
                            <th className="text-right p-3 text-gray-700 font-medium">Earnings ($)</th>
                            <th className="text-right p-3 text-gray-700 font-medium">Clicks</th>
                            <th className="text-right p-3 text-gray-700 font-medium">Impressions</th>
                            <th className="text-right p-3 text-gray-700 font-medium">eCPM ($)</th>
                            <th className="text-right p-3 text-gray-700 font-medium">CTR (%)</th>
                            <th className="text-right p-3 text-gray-700 font-medium">Match Rate (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.map((day) => (
                            <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3 font-medium text-gray-900">{day.date}</td>
                              <td className="p-3 text-right font-mono">
                                ${day.metrics?.ESTIMATED_EARNINGS?.toFixed(4) ?? "0.0000"}
                              </td>
                              <td className="p-3 text-right font-mono">{day.metrics?.CLICKS ?? 0}</td>
                              <td className="p-3 text-right font-mono">{day.metrics?.IMPRESSIONS ?? 0}</td>
                              <td className="p-3 text-right font-mono">
                                ${day.metrics?.OBSERVED_ECPM?.toFixed(2) ?? "0.00"}
                              </td>
                              <td className="p-3 text-right font-mono">
                                {((day.metrics?.IMPRESSION_CTR ?? 0) * 100).toFixed(2)}%
                              </td>
                              <td className="p-3 text-right font-mono">
                                {((day.metrics?.MATCH_RATE ?? 0) * 100).toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedMetrics.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
                      <MetricChart
                        data={chartData}
                        selectedMetrics={getSelectedMetricConfigs()}
                        title="30-Day Performance Metrics"
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Metrics to Display</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {metricOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={selectedMetrics.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMetrics([...selectedMetrics, option.value])
                              } else {
                                setSelectedMetrics(selectedMetrics.filter((m) => m !== option.value))
                              }
                            }}
                          />
                          <label htmlFor={option.value} className="text-sm font-medium text-gray-700 cursor-pointer">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <AppOverviewTable apiData={apiData} onSelectApp={setSelectedApp} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AppMetricsDashboard
