"use client"

import { useState, useEffect, useMemo } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppOverviewTable } from "./app-overview-table"
import { MetricChart } from "./metric-chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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

interface SortConfig {
  key: string
  direction: "asc" | "desc"
}

interface FilterConfig {
  matchRate?: { operator: "above" | "below"; value: number }
  earnings?: { operator: "above" | "below"; value: number }
  clicks?: { operator: "above" | "below"; value: number }
  impressions?: { operator: "above" | "below"; value: number }
  ecpm?: { operator: "above" | "below"; value: number }
  ctr?: { operator: "above" | "below"; value: number }
}

const getTrendArrow = (currentValue: number, previousValue: number, formatter?: (val: number) => string) => {
  if (previousValue === 0 && currentValue === 0) return null
  if (previousValue === 0) {
    return (
      <span className="inline-flex items-center">
        <TrendingUp className="w-3 h-3 text-green-500" />
      </span>
    )
  }

  const change = currentValue - previousValue
  if (Math.abs(change) < 0.0001) return null

  const isIncrease = change > 0
  const Icon = isIncrease ? TrendingUp : TrendingDown

  return (
    <span className="inline-flex items-center">
      <Icon className={`w-3 h-3 ${isIncrease ? "text-green-500" : "text-red-500"}`} />
    </span>
  )
}

export function AppMetricsDashboard({ initialSelectedApp }: AppMetricsDashboardProps) {
  const { useRouter } = require("next/navigation")
  const router = useRouter()
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>("")
  const [selectedApp, setSelectedApp] = useState<string | null>(initialSelectedApp || null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["ESTIMATED_EARNINGS"])

  const [apiData, setApiData] = useState<AppCountryData[]>([])
  const [dailyData, setDailyData] = useState<DailyMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataReady, setDataReady] = useState(false)

  const [countryPage, setCountryPage] = useState(1)

  const [availablePublishers, setAvailablePublishers] = useState<{ id: string; name: string }[]>([])

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [showComparisonModal, setShowComparisonModal] = useState(false)

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({})
  const [showFilters, setShowFilters] = useState(false)

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
      setDataReady(false)
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
        setDataReady(true)
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
      setDataReady(false)
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
    setSelectedDates([])
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

  const handleDateSelection = (date: string, checked: boolean) => {
    if (checked) {
      setSelectedDates([...selectedDates, date])
    } else {
      setSelectedDates(selectedDates.filter((d) => d !== date))
    }
  }

  const getDateComparison = () => {
    if (selectedDates.length < 2) return []

    const sortedDates = [...selectedDates].sort()

    if (sortedDates.length === 2) {
      // For 2 dates, show simple comparison
      const currentDate = sortedDates[1]
      const previousDate = sortedDates[0]

      const currentData = dailyData.find((d) => d.date === currentDate)
      const previousData = dailyData.find((d) => d.date === previousDate)

      if (currentData && previousData) {
        return [
          {
            fromDate: previousDate,
            toDate: currentDate,
            metrics: {
              ESTIMATED_EARNINGS: {
                from: previousData.metrics?.ESTIMATED_EARNINGS ?? 0,
                to: currentData.metrics?.ESTIMATED_EARNINGS ?? 0,
                change:
                  (currentData.metrics?.ESTIMATED_EARNINGS ?? 0) - (previousData.metrics?.ESTIMATED_EARNINGS ?? 0),
                changePercent: previousData.metrics?.ESTIMATED_EARNINGS
                  ? (((currentData.metrics?.ESTIMATED_EARNINGS ?? 0) -
                      (previousData.metrics?.ESTIMATED_EARNINGS ?? 0)) /
                      (previousData.metrics?.ESTIMATED_EARNINGS ?? 0)) *
                    100
                  : 0,
              },
              CLICKS: {
                from: previousData.metrics?.CLICKS ?? 0,
                to: currentData.metrics?.CLICKS ?? 0,
                change: (currentData.metrics?.CLICKS ?? 0) - (previousData.metrics?.CLICKS ?? 0),
                changePercent: previousData.metrics?.CLICKS
                  ? (((currentData.metrics?.CLICKS ?? 0) - (previousData.metrics?.CLICKS ?? 0)) /
                      (previousData.metrics?.CLICKS ?? 0)) *
                    100
                  : 0,
              },
              IMPRESSIONS: {
                from: previousData.metrics?.IMPRESSIONS ?? 0,
                to: currentData.metrics?.IMPRESSIONS ?? 0,
                change: (currentData.metrics?.IMPRESSIONS ?? 0) - (previousData.metrics?.IMPRESSIONS ?? 0),
                changePercent: previousData.metrics?.IMPRESSIONS
                  ? (((currentData.metrics?.IMPRESSIONS ?? 0) - (previousData.metrics?.IMPRESSIONS ?? 0)) /
                      (previousData.metrics?.IMPRESSIONS ?? 0)) *
                    100
                  : 0,
              },
              OBSERVED_ECPM: {
                from: previousData.metrics?.OBSERVED_ECPM ?? 0,
                to: currentData.metrics?.OBSERVED_ECPM ?? 0,
                change: (currentData.metrics?.OBSERVED_ECPM ?? 0) - (previousData.metrics?.OBSERVED_ECPM ?? 0),
                changePercent: previousData.metrics?.OBSERVED_ECPM
                  ? (((currentData.metrics?.OBSERVED_ECPM ?? 0) - (previousData.metrics?.OBSERVED_ECPM ?? 0)) /
                      (previousData.metrics?.OBSERVED_ECPM ?? 0)) *
                    100
                  : 0,
              },
              IMPRESSION_CTR: {
                from: (previousData.metrics?.IMPRESSION_CTR ?? 0) * 100,
                to: (currentData.metrics?.IMPRESSION_CTR ?? 0) * 100,
                change:
                  (currentData.metrics?.IMPRESSION_CTR ?? 0) * 100 - (previousData.metrics?.IMPRESSION_CTR ?? 0) * 100,
                changePercent: previousData.metrics?.IMPRESSION_CTR
                  ? (((currentData.metrics?.IMPRESSION_CTR ?? 0) - (previousData.metrics?.IMPRESSION_CTR ?? 0)) /
                      (previousData.metrics?.IMPRESSION_CTR ?? 0)) *
                    100
                  : 0,
              },
              MATCH_RATE: {
                from: (previousData.metrics?.MATCH_RATE ?? 0) * 100,
                to: (currentData.metrics?.MATCH_RATE ?? 0) * 100,
                change: (currentData.metrics?.MATCH_RATE ?? 0) * 100 - (previousData.metrics?.MATCH_RATE ?? 0) * 100,
                changePercent: previousData.metrics?.MATCH_RATE
                  ? (((currentData.metrics?.MATCH_RATE ?? 0) - (previousData.metrics?.MATCH_RATE ?? 0)) /
                      (previousData.metrics?.MATCH_RATE ?? 0)) *
                    100
                  : 0,
              },
            },
          },
        ]
      }
    }

    // For 3+ dates, return all dates with their data for side-by-side comparison
    return sortedDates
      .map((date) => {
        const data = dailyData.find((d) => d.date === date)
        return {
          date,
          data: data
            ? {
                ESTIMATED_EARNINGS: data.metrics?.ESTIMATED_EARNINGS ?? 0,
                CLICKS: data.metrics?.CLICKS ?? 0,
                IMPRESSIONS: data.metrics?.IMPRESSIONS ?? 0,
                OBSERVED_ECPM: data.metrics?.OBSERVED_ECPM ?? 0,
                IMPRESSION_CTR: (data.metrics?.IMPRESSION_CTR ?? 0) * 100,
                MATCH_RATE: (data.metrics?.MATCH_RATE ?? 0) * 100,
              }
            : null,
        }
      })
      .filter((item) => item.data !== null)
  }

  const handleSort = (key: string) => {
    console.log("[v0] handleSort called with key:", key)
    console.log("[v0] Current sortConfig:", sortConfig)

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        console.log("[v0] Changing to desc")
        setSortConfig({ key, direction: "desc" })
      } else {
        console.log("[v0] Canceling sort")
        // Cancel sort for this column
        setSortConfig(null)
      }
    } else {
      console.log("[v0] New column sort - asc")
      // New column sort
      setSortConfig({ key, direction: "asc" })
    }
  }

  const handleFilterChange = (metric: keyof FilterConfig, operator: "above" | "below", value: number) => {
    setFilterConfig((prev) => ({
      ...prev,
      [metric]: { operator, value },
    }))
  }

  const clearFilter = (metric: keyof FilterConfig) => {
    setFilterConfig((prev) => {
      const newConfig = { ...prev }
      delete newConfig[metric]
      return newConfig
    })
  }

  const clearAllFilters = () => {
    setFilterConfig({})
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ChevronUp className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
    }

    if (sortConfig.direction === "asc") {
      return <ChevronUp className="w-3 h-3 text-blue-600" />
    } else {
      return <ChevronDown className="w-3 h-3 text-blue-600" />
    }
  }

  const processedDailyData = useMemo(() => {
    console.log("[v0] Processing data with sortConfig:", sortConfig)
    console.log("[v0] Raw dailyData length:", dailyData.length)

    let filteredData = [...dailyData]

    // Apply filters
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (config.value !== undefined && config.value !== "") {
        const numValue = Number.parseFloat(config.value.toString())
        if (!isNaN(numValue)) {
          filteredData = filteredData.filter((item) => {
            let itemValue: number
            switch (key) {
              case "matchRate":
                itemValue = (item.metrics?.MATCH_RATE ?? 0) * 100
                break
              case "earnings":
                itemValue = item.metrics?.ESTIMATED_EARNINGS ?? 0
                break
              case "ctr":
                itemValue = (item.metrics?.IMPRESSION_CTR ?? 0) * 100
                break
              default:
                return true
            }
            return config.operator === "above" ? itemValue > numValue : itemValue < numValue
          })
        }
      }
    })

    console.log("[v0] Filtered data length:", filteredData.length)

    // Apply sorting
    if (sortConfig) {
      console.log("[v0] Applying sort:", sortConfig)
      filteredData.sort((a, b) => {
        let aValue: number
        let bValue: number

        switch (sortConfig.key) {
          case "date":
            aValue = new Date(a.date).getTime()
            bValue = new Date(b.date).getTime()
            break
          case "earnings":
            aValue = a.metrics?.ESTIMATED_EARNINGS ?? 0
            bValue = b.metrics?.ESTIMATED_EARNINGS ?? 0
            break
          case "clicks":
            aValue = a.metrics?.CLICKS ?? 0
            bValue = b.metrics?.CLICKS ?? 0
            break
          case "impressions":
            aValue = a.metrics?.IMPRESSIONS ?? 0
            bValue = b.metrics?.IMPRESSIONS ?? 0
            break
          case "ecpm":
            aValue = a.metrics?.OBSERVED_ECPM ?? 0
            bValue = b.metrics?.OBSERVED_ECPM ?? 0
            break
          case "ctr":
            aValue = (a.metrics?.IMPRESSION_CTR ?? 0) * 100
            bValue = (b.metrics?.IMPRESSION_CTR ?? 0) * 100
            break
          case "matchRate":
            aValue = (a.metrics?.MATCH_RATE ?? 0) * 100
            bValue = (b.metrics?.MATCH_RATE ?? 0) * 100
            break
          default:
            return 0
        }

        console.log("[v0] Comparing:", aValue, "vs", bValue, "for key:", sortConfig.key)

        if (sortConfig.direction === "asc") {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
    }

    console.log("[v0] Final processed data length:", filteredData.length)
    return filteredData
  }, [dailyData, sortConfig, filterConfig])

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

          <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-800 text-lg font-semibold">Đang tải dữ liệu...</p>
              <p className="text-gray-600 text-sm mt-1">Kết nối đến API server...</p>
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
              <p className="text-gray-700 mt-1">
                {selectedApp ? "30-day performance data for selected app" : "Today's app metrics overview"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-800">Publisher:</label>
              <Select value={selectedPublisherId} onValueChange={handlePublisherChange}>
                <SelectTrigger className="w-64 bg-white border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {availablePublishers.map((publisher) => (
                    <SelectItem key={publisher.id} value={publisher.id} className="hover:bg-gray-50">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{publisher.name}</span>
                        <span className="text-xs text-gray-600">{publisher.id}</span>
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">30-Day Performance Data</h2>
                  <p className="text-gray-600 mt-1">App ID: {selectedApp}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? "bg-blue-50 border-blue-200" : ""}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {Object.keys(filterConfig).length > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                        {Object.keys(filterConfig).length}
                      </span>
                    )}
                  </Button>

                  {selectedDates.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedDates.length} dates selected</span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedDates([])}>
                        Clear
                      </Button>
                      {selectedDates.length >= 2 && (
                        <Button
                          size="sm"
                          onClick={() => setShowComparisonModal(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Compare Dates
                        </Button>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedApp(null)
                      setDailyData([])
                      setSelectedDates([])
                      router.push("/dashboard/app-performance")
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Filter Options</h4>
                    {Object.keys(filterConfig).length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Match Rate Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Match Rate (%)</label>
                      <div className="flex gap-2">
                        <Select
                          value={filterConfig.matchRate?.operator || ""}
                          onValueChange={(value: "above" | "below") => {
                            if (filterConfig.matchRate) {
                              handleFilterChange("matchRate", value, filterConfig.matchRate.value)
                            }
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="80"
                          className="flex-1"
                          value={filterConfig.matchRate?.value || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            if (!isNaN(value) && filterConfig.matchRate) {
                              handleFilterChange("matchRate", filterConfig.matchRate.operator, value)
                            } else if (!isNaN(value)) {
                              handleFilterChange("matchRate", "above", value)
                            }
                          }}
                        />
                        {filterConfig.matchRate && (
                          <Button variant="outline" size="sm" onClick={() => clearFilter("matchRate")}>
                            ×
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Earnings Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Earnings ($)</label>
                      <div className="flex gap-2">
                        <Select
                          value={filterConfig.earnings?.operator || ""}
                          onValueChange={(value: "above" | "below") => {
                            if (filterConfig.earnings) {
                              handleFilterChange("earnings", value, filterConfig.earnings.value)
                            }
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.01"
                          className="flex-1"
                          value={filterConfig.earnings?.value || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            if (!isNaN(value) && filterConfig.earnings) {
                              handleFilterChange("earnings", filterConfig.earnings.operator, value)
                            } else if (!isNaN(value)) {
                              handleFilterChange("earnings", "above", value)
                            }
                          }}
                        />
                        {filterConfig.earnings && (
                          <Button variant="outline" size="sm" onClick={() => clearFilter("earnings")}>
                            ×
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* CTR Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">CTR (%)</label>
                      <div className="flex gap-2">
                        <Select
                          value={filterConfig.ctr?.operator || ""}
                          onValueChange={(value: "above" | "below") => {
                            if (filterConfig.ctr) {
                              handleFilterChange("ctr", value, filterConfig.ctr.value)
                            }
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="5.0"
                          className="flex-1"
                          value={filterConfig.ctr?.value || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            if (!isNaN(value) && filterConfig.ctr) {
                              handleFilterChange("ctr", filterConfig.ctr.operator, value)
                            } else if (!isNaN(value)) {
                              handleFilterChange("ctr", "above", value)
                            }
                          }}
                        />
                        {filterConfig.ctr && (
                          <Button variant="outline" size="sm" onClick={() => clearFilter("ctr")}>
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Daily Metrics Table</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Select dates to compare performance metrics • {processedDailyData.length} of{" "}
                            {dailyData.length} rows
                            {sortConfig && (
                              <span className="ml-2 text-blue-600">
                                • Sorted by {sortConfig.key} ({sortConfig.direction})
                              </span>
                            )}
                          </p>
                        </div>
                        {(sortConfig || Object.keys(filterConfig).length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSortConfig(null)
                              setFilterConfig({})
                            }}
                          >
                            Reset All
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="max-h-96 w-auto overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                            <tr>
                              <th className="text-left py-3 px-3 text-gray-700 font-medium w-12">
                                <Checkbox
                                  checked={selectedDates.length === processedDailyData.length}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedDates(processedDailyData.map((d) => d.date))
                                    } else {
                                      setSelectedDates([])
                                    }
                                  }}
                                />
                              </th>
                              <th
                                className="text-left py-3 px-3 text-gray-700 font-medium w-20 cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("date")}
                              >
                                <div className="flex items-center gap-1">
                                  Date
                                  <SortIcon column="date" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-2 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("earnings")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Earnings ($)
                                  <SortIcon column="earnings" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-2 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("clicks")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Clicks
                                  <SortIcon column="clicks" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-2 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("impressions")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Impressions
                                  <SortIcon column="impressions" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-2 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("ecpm")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  eCPM ($)
                                  <SortIcon column="ecpm" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-2 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("ctr")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  CTR (%)
                                  <SortIcon column="ctr" />
                                </div>
                              </th>
                              <th
                                className="text-right py-3 px-3 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleSort("matchRate")}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Match Rate (%)
                                  <SortIcon column="matchRate" />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedDailyData.map((day, index) => {
                              const previousDay =
                                index < processedDailyData.length - 1 ? processedDailyData[index + 1] : null

                              return (
                                <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-2 px-3">
                                    <Checkbox
                                      checked={selectedDates.includes(day.date)}
                                      onCheckedChange={(checked) => handleDateSelection(day.date, checked as boolean)}
                                    />
                                  </td>
                                  <td className="py-2 px-3 font-medium text-gray-900">{day.date.slice(5)}</td>
                                  <td className="py-2 px-2 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>${day.metrics?.ESTIMATED_EARNINGS?.toFixed(4) ?? "0.0000"}</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(
                                            day.metrics?.ESTIMATED_EARNINGS ?? 0,
                                            previousDay.metrics?.ESTIMATED_EARNINGS ?? 0,
                                            (val) => `$${val.toFixed(4)}`,
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>{day.metrics?.CLICKS ?? 0}</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(day.metrics?.CLICKS ?? 0, previousDay.metrics?.CLICKS ?? 0)}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>{day.metrics?.IMPRESSIONS ?? 0}</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(
                                            day.metrics?.IMPRESSIONS ?? 0,
                                            previousDay.metrics?.IMPRESSIONS ?? 0,
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>${day.metrics?.OBSERVED_ECPM?.toFixed(2) ?? "0.00"}</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(
                                            day.metrics?.OBSERVED_ECPM ?? 0,
                                            previousDay.metrics?.OBSERVED_ECPM ?? 0,
                                            (val) => `$${val.toFixed(2)}`,
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>{((day.metrics?.IMPRESSION_CTR ?? 0) * 100).toFixed(2)}%</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(
                                            (day.metrics?.IMPRESSION_CTR ?? 0) * 100,
                                            (previousDay.metrics?.IMPRESSION_CTR ?? 0) * 100,
                                            (val) => `${val.toFixed(2)}%`,
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono text-xs">
                                    <div className="flex items-center justify-end gap-1">
                                      <span>{((day.metrics?.MATCH_RATE ?? 0) * 100).toFixed(2)}%</span>
                                      <div className="w-3 flex justify-center">
                                        {previousDay &&
                                          getTrendArrow(
                                            (day.metrics?.MATCH_RATE ?? 0) * 100,
                                            (previousDay.metrics?.MATCH_RATE ?? 0) * 100,
                                            (val) => `${val.toFixed(2)}%`,
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
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
          dataReady && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <AppOverviewTable apiData={apiData} onSelectApp={setSelectedApp} />
            </div>
          )
        )}

        <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Date Comparison Analysis</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedDates.length === 2 ? (
                // Two-date comparison (existing logic)
                getDateComparison().map((comparison: any, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {comparison.fromDate} → {comparison.toDate}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">Earnings</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">
                            ${comparison.metrics.ESTIMATED_EARNINGS.to.toFixed(4)}
                          </span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.ESTIMATED_EARNINGS.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.ESTIMATED_EARNINGS.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.ESTIMATED_EARNINGS.change > 0 ? "text-green-600" : comparison.metrics.ESTIMATED_EARNINGS.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.ESTIMATED_EARNINGS.change > 0 ? "+" : ""}$
                              {comparison.metrics.ESTIMATED_EARNINGS.change.toFixed(4)} (
                              {comparison.metrics.ESTIMATED_EARNINGS.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">Clicks</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">{comparison.metrics.CLICKS.to}</span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.CLICKS.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.CLICKS.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.CLICKS.change > 0 ? "text-green-600" : comparison.metrics.CLICKS.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.CLICKS.change > 0 ? "+" : ""}
                              {comparison.metrics.CLICKS.change} ({comparison.metrics.CLICKS.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">Impressions</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">{comparison.metrics.IMPRESSIONS.to}</span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.IMPRESSIONS.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.IMPRESSIONS.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.IMPRESSIONS.change > 0 ? "text-green-600" : comparison.metrics.IMPRESSIONS.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.IMPRESSIONS.change > 0 ? "+" : ""}
                              {comparison.metrics.IMPRESSIONS.change} (
                              {comparison.metrics.IMPRESSIONS.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">eCPM</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">
                            ${comparison.metrics.OBSERVED_ECPM.to.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.OBSERVED_ECPM.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.OBSERVED_ECPM.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.OBSERVED_ECPM.change > 0 ? "text-green-600" : comparison.metrics.OBSERVED_ECPM.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.OBSERVED_ECPM.change > 0 ? "+" : ""}$
                              {comparison.metrics.OBSERVED_ECPM.change.toFixed(2)} (
                              {comparison.metrics.OBSERVED_ECPM.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">CTR</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">
                            {comparison.metrics.IMPRESSION_CTR.to.toFixed(2)}%
                          </span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.IMPRESSION_CTR.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.IMPRESSION_CTR.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.IMPRESSION_CTR.change > 0 ? "text-green-600" : comparison.metrics.IMPRESSION_CTR.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.IMPRESSION_CTR.change > 0 ? "+" : ""}
                              {comparison.metrics.IMPRESSION_CTR.change.toFixed(2)}% (
                              {comparison.metrics.IMPRESSION_CTR.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700">Match Rate</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold">{comparison.metrics.MATCH_RATE.to.toFixed(2)}%</span>
                          <div className="flex items-center gap-1">
                            {comparison.metrics.MATCH_RATE.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : comparison.metrics.MATCH_RATE.change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            <span
                              className={`text-sm ${comparison.metrics.MATCH_RATE.change > 0 ? "text-green-600" : comparison.metrics.MATCH_RATE.change < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              {comparison.metrics.MATCH_RATE.change > 0 ? "+" : ""}
                              {comparison.metrics.MATCH_RATE.change.toFixed(2)}% (
                              {comparison.metrics.MATCH_RATE.changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Multi-Date Comparison ({selectedDates.length} dates)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Metric</th>
                          {getDateComparison().map((item: any) => (
                            <th key={item.date} className="text-center py-3 px-4 font-medium text-gray-700">
                              {item.date}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">Earnings ($)</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              ${item.data.ESTIMATED_EARNINGS.toFixed(4)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">Clicks</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              {item.data.CLICKS}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">Impressions</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              {item.data.IMPRESSIONS}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">eCPM ($)</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              ${item.data.OBSERVED_ECPM.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">CTR (%)</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              {item.data.IMPRESSION_CTR.toFixed(2)}%
                            </td>
                          ))}
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">Match Rate (%)</td>
                          {getDateComparison().map((item: any) => (
                            <td key={item.date} className="py-3 px-4 text-center font-mono">
                              {item.data.MATCH_RATE.toFixed(2)}%
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AppMetricsDashboard
