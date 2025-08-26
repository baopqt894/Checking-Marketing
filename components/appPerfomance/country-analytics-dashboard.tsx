"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { MetricChart } from "./metric-chart"

interface DailyMetric {
  date: string
  ESTIMATED_EARNINGS: number
  CLICKS: number
  IMPRESSIONS: number
  IMPRESSION_CTR: number
  MATCH_RATE: number
}

interface CountryAnalyticsDashboardProps {
  appId?: string
  country?: string
}

export function CountryAnalyticsDashboard({ appId: propAppId, country: propCountry }: CountryAnalyticsDashboardProps) {
  const params = useParams()
  const router = useRouter()

  const appId = propAppId || (params?.app_id as string)
  const country = propCountry || (params?.country as string)?.toUpperCase()

  const [dailyData, setDailyData] = useState<DailyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["ESTIMATED_EARNINGS"])
  const [activeTab, setActiveTab] = useState<string>("Analytics")

  const metricOptions = [
    {
      value: "ESTIMATED_EARNINGS",
      label: "Estimated Earnings",
      format: (val: number) => `$${val.toFixed(5)}`,
    },
    {
      value: "CLICKS",
      label: "Clicks",
      format: (val: number) => val.toFixed(0),
    },
    {
      value: "IMPRESSIONS",
      label: "Impressions",
      format: (val: number) => val.toFixed(0),
    },
    {
      value: "IMPRESSION_CTR",
      label: "CTR",
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
    {
      value: "MATCH_RATE",
      label: "Match Rate",
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
  ]

  useEffect(() => {
    if (!appId || !country) return

    let controller: AbortController | null = null

    const loadData = async () => {
      setLoading(true)
      setError(null)

      controller = new AbortController()
      const startTime = Date.now()

      try {
        const response = await fetch(
          `http://localhost:2703/tokens/app-daily-metrics-30d-country?appId=${appId}&country=${country}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data && data.metrics && Array.isArray(data.metrics)) {
          const transformedData: DailyMetric[] = data.metrics.map((item: any) => ({
            date: item.date,
            ESTIMATED_EARNINGS: item.metrics.ESTIMATED_EARNINGS || 0,
            CLICKS: item.metrics.CLICKS || 0,
            IMPRESSIONS: item.metrics.IMPRESSIONS || 0,
            IMPRESSION_CTR: item.metrics.IMPRESSION_CTR || 0,
            MATCH_RATE: item.metrics.MATCH_RATE || 0,
          }))
          setDailyData(transformedData)
          setError(null)
        } else {
          throw new Error("Invalid API response format")
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("[v0] API call was cancelled")
          return
        }

        console.error("API Error:", err)
        setError("API connection failed, using mock data")

        const mockData: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return {
            date: date.toISOString().split("T")[0],
            ESTIMATED_EARNINGS: Math.random() * 0.5 + 0.1,
            CLICKS: Math.floor(Math.random() * 50) + 10,
            IMPRESSIONS: Math.floor(Math.random() * 200) + 50,
            IMPRESSION_CTR: Math.random() * 0.4 + 0.1,
            MATCH_RATE: Math.random() * 0.3 + 0.7,
          }
        })
        setDailyData(mockData)
      } finally {
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, 2000 - elapsedTime)

        setTimeout(() => {
          setLoading(false)
        }, remainingTime)
      }
    }

    loadData()

    return () => {
      if (controller) {
        controller.abort()
      }
    }
  }, [appId, country])

  const toggleMetric = (metricValue: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricValue)) {
        if (prev.length === 1) return prev
        return prev.filter((m) => m !== metricValue)
      } else {
        return [...prev, metricValue]
      }
    })
  }

  const toggleAllMetrics = () => {
    if (selectedMetrics.length === metricOptions.length) {
      setSelectedMetrics([metricOptions[0].value])
    } else {
      setSelectedMetrics(metricOptions.map((opt) => opt.value))
    }
  }

  const getCurrentValue = (metric: string) => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) return 0
    const latest = dailyData[dailyData.length - 1]
    if (!latest) return 0
    return (latest[metric as keyof DailyMetric] as number) || 0
  }

  const getChange24h = (metric: string) => {
    if (!Array.isArray(dailyData) || dailyData.length < 2) return 0

    const current = dailyData[dailyData.length - 1]
    const previous = dailyData[dailyData.length - 2]

    if (!current || !previous) return 0

    const currentValue = current[metric as keyof DailyMetric] as number
    const previousValue = previous[metric as keyof DailyMetric] as number

    if (!currentValue || !previousValue || previousValue === 0) return 0
    return ((currentValue - previousValue) / previousValue) * 100
  }

  const formatValue = (value: number, metric: string) => {
    const option = metricOptions.find((opt) => opt.value === metric)
    return option ? option.format(value) : value.toFixed(0)
  }

  const getMetricLabel = (metric: string) => {
    const option = metricOptions.find((opt) => opt.value === metric)
    return option ? option.label : metric
  }

  const getMonthlyTotalForMetric = (metric: string) => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) return 0

    const isPercentageMetric = metric === "IMPRESSION_CTR" || metric === "MATCH_RATE"

    if (isPercentageMetric) {
      const validDays = dailyData.filter((day) => {
        const value = day[metric as keyof DailyMetric] as number
        return value !== null && value !== undefined && !isNaN(value)
      })

      if (validDays.length === 0) return 0

      const sum = validDays.reduce((total, day) => {
        const value = day[metric as keyof DailyMetric] as number
        return total + (value || 0)
      }, 0)

      return sum / validDays.length
    } else {
      return dailyData.reduce((total, day) => {
        const value = day[metric as keyof DailyMetric] as number
        return total + (value || 0)
      }, 0)
    }
  }

  const getMonthlyChangeForMetric = (metric: string) => {
    if (!Array.isArray(dailyData) || dailyData.length < 15) return 0

    const firstHalf = dailyData.slice(0, 15)
    const secondHalf = dailyData.slice(15)

    const isPercentageMetric = metric === "IMPRESSION_CTR" || metric === "MATCH_RATE"

    let firstHalfValue: number
    let secondHalfValue: number

    if (isPercentageMetric) {
      const firstHalfValidDays = firstHalf.filter((day) => {
        const value = day[metric as keyof DailyMetric] as number
        return value !== null && value !== undefined && !isNaN(value)
      })

      const secondHalfValidDays = secondHalf.filter((day) => {
        const value = day[metric as keyof DailyMetric] as number
        return value !== null && value !== undefined && !isNaN(value)
      })

      if (firstHalfValidDays.length === 0 || secondHalfValidDays.length === 0) return 0

      firstHalfValue =
        firstHalfValidDays.reduce((total, day) => {
          const value = day[metric as keyof DailyMetric] as number
          return total + (value || 0)
        }, 0) / firstHalfValidDays.length

      secondHalfValue =
        secondHalfValidDays.reduce((total, day) => {
          const value = day[metric as keyof DailyMetric] as number
          return total + (value || 0)
        }, 0) / secondHalfValidDays.length
    } else {
      firstHalfValue = firstHalf.reduce((total, day) => {
        const value = day[metric as keyof DailyMetric] as number
        return total + (value || 0)
      }, 0)

      secondHalfValue = secondHalf.reduce((total, day) => {
        const value = day[metric as keyof DailyMetric] as number
        return total + (value || 0)
      }, 0)
    }

    if (firstHalfValue === 0) return 0
    return ((secondHalfValue - firstHalfValue) / firstHalfValue) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium mb-2">Loading {country} metrics...</p>
            <p className="text-gray-500 text-sm">Fetching daily performance data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => router.push("/dashboard/app-performance")} className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold">APP METRICS</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-mono text-lg font-bold">
                {formatValue(getMonthlyTotalForMetric("ESTIMATED_EARNINGS"), "ESTIMATED_EARNINGS")} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {country?.charAt(0)}
              </div>
              <span className="font-bold text-lg">
                App Name (Country)
              </span>
            </div>
            <div className="flex space-x-6 text-sm overflow-x-auto">
              {selectedMetrics.map((metric) => {
                const currentValue = getCurrentValue(metric)
                const change24h = getChange24h(metric)
                return (
                  <div key={metric} className="flex-shrink-0">
                    <span className="text-gray-600">{getMetricLabel(metric)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono font-bold">{formatValue(currentValue, metric)}</div>
                      <div
                        className={`font-mono flex items-center text-xs ${change24h >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {change24h >= 0 ? "+" : ""}
                        {change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Demo Mode: {error}. Showing sample data for demonstration.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
          <div className="col-span-3">
            <Card className="h-220">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Chọn Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="select-all"
                      checked={selectedMetrics.length === metricOptions.length}
                      onCheckedChange={toggleAllMetrics}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Chọn tất cả
                    </label>
                  </div>
                  <div className="space-y-2">
                    {metricOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedMetrics.includes(option.value)}
                          onCheckedChange={() => toggleMetric(option.value)}
                        />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700">Thống kê nhanh</h4>
                  {selectedMetrics.map((metricValue) => {
                    const metric = metricOptions.find((opt) => opt.value === metricValue)
                    if (!metric) return null

                    const value = getCurrentValue(metricValue)
                    const change = getChange24h(metricValue)

                    return (
                      <div key={metricValue} className="p-3 rounded bg-blue-50 border border-blue-200">
                        <div className="text-xs text-gray-600">{metric.label}</div>
                        <div className="font-mono text-sm font-bold">{metric.format(value)}</div>
                        <div className={`text-xs flex items-center ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="h-220 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm">Dữ liệu hiệu suất hàng ngày</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="text-xs text-gray-600 pb-2 border-b flex flex-shrink-0">
                  <span className="w-20">Ngày</span>
                  {selectedMetrics.map((metric) => (
                    <span key={metric} className="flex-1 text-center">
                      {getMetricLabel(metric)}
                    </span>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-0">
                    {Array.isArray(dailyData) &&
                      dailyData
                        .slice()
                        .reverse()
                        .map((day, index) => (
                          <div
                            key={index}
                            className="flex py-2 text-xs font-mono hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="w-20 text-gray-600">{day.date}</span>
                            {selectedMetrics.map((metric) => {
                              const value = day[metric as keyof DailyMetric] as number
                              const prevValue =
                                index < dailyData.length - 1
                                  ? (dailyData[dailyData.length - 2 - index]?.[metric as keyof DailyMetric] as number)
                                  : value
                              const isUp = value >= prevValue

                              return (
                                <span
                                  key={metric}
                                  className={`flex-1 text-center ${isUp ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatValue(value, metric)}
                                </span>
                              )
                            })}
                          </div>
                        ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-5">
            <Card className="h-220">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Biểu đồ hiệu suất</CardTitle>
                  <div className="text-xs text-gray-600">Xu hướng 30 ngày</div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex-1 min-h-0 " style={{ height: "40%" }}>
                  <MetricChart data={dailyData} selectedMetrics={selectedMetrics} metricOptions={metricOptions} />
                </div>
                <div className="border-t bg-gray-50 p-4 flex-shrink-0" style={{ height: "50%", overflowY: "auto" }}>
                  <div className="mb-3">
                    <h4 className="text-sm font-medium">Tóm tắt hiệu suất tháng</h4>
                    <p className="text-xs text-gray-600">Tổng metrics trong 30 ngày qua</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedMetrics.map((metricValue) => {
                      const metric = metricOptions.find((opt) => opt.value === metricValue)
                      if (!metric) return null

                      const monthlyValue = getMonthlyTotalForMetric(metricValue)
                      const monthlyChange = getMonthlyChangeForMetric(metricValue)

                      const isPercentageMetric = metricValue === "IMPRESSION_CTR" || metricValue === "MATCH_RATE"
                      const labelPrefix = isPercentageMetric ? "Trung bình " : "Tổng "

                      return (
                        <div
                          key={metricValue}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <div>
                            <div className="text-xs text-gray-600">
                              {labelPrefix}
                              {metric.label}
                            </div>
                            <div className="font-mono text-sm font-bold">{metric.format(monthlyValue)}</div>
                          </div>
                          <div
                            className={`text-xs flex items-center ${monthlyChange >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {monthlyChange >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {monthlyChange >= 0 ? "+" : ""}
                            {monthlyChange.toFixed(1)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CountryAnalyticsDashboard
