"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Calendar, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppCountryData {
  appId: string
  country: string
  today: any
  yesterday: any
  avg7: any
  avg30: any
}

interface MetricConfig {
  key: string
  label: string
  format: (val: number) => string
  visible: boolean
}

interface UnifiedMetricsTableProps {
  selectedApp: string
  apiData: AppCountryData[]
  onSelectCountry: (country: string) => void
}

export function UnifiedMetricsTable({ selectedApp, apiData, onSelectCountry }: UnifiedMetricsTableProps) {
  const router = useRouter()

  const [metrics, setMetrics] = useState<MetricConfig[]>([
    { key: "ESTIMATED_EARNINGS", label: "Earnings ($)", format: (val: number) => `$${val.toFixed(5)}`, visible: true },
    { key: "CLICKS", label: "Clicks", format: (val: number) => val.toFixed(0), visible: true },
    { key: "IMPRESSIONS", label: "Impressions", format: (val: number) => val.toFixed(0), visible: true },
    { key: "IMPRESSION_CTR", label: "CTR (%)", format: (val: number) => `${(val * 100).toFixed(2)}%`, visible: true },
    {
      key: "MATCH_RATE",
      label: "Match Rate (%)",
      format: (val: number) => `${(val * 100).toFixed(1)}%`,
      visible: true,
    },
    { key: "OBSERVED_ECPM", label: "eCPM ($)", format: (val: number) => `$${val.toFixed(2)}`, visible: true },
  ])

  const [showSelector, setShowSelector] = useState(false)

  const toggleMetric = (key: string) => {
    setMetrics((prev) => prev.map((metric) => (metric.key === key ? { ...metric, visible: !metric.visible } : metric)))
  }

  const toggleAllMetrics = (checked: boolean) => {
    setMetrics((prev) => prev.map((metric) => ({ ...metric, visible: checked })))
  }

  const getAppDetails = (appId: string) => {
    const appCountries = apiData.filter((item) => item.appId === appId)

    return appCountries.map((item) => {
      const calculateChange = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0
        return ((current - previous) / previous) * 100
      }

      const currentData = Object.keys(item.today).length > 0 ? item.today : item.avg7
      const previousData = Object.keys(item.yesterday).length > 0 ? item.yesterday : item.avg30

      return {
        appId: item.appId,
        country: item.country,
        data: {
          ESTIMATED_EARNINGS: currentData.ESTIMATED_EARNINGS || 0,
          CLICKS: currentData.CLICKS || 0,
          IMPRESSIONS: currentData.IMPRESSIONS || 0,
          IMPRESSION_CTR: currentData.IMPRESSION_CTR || 0,
          MATCH_RATE: currentData.MATCH_RATE || 0,
          OBSERVED_ECPM: currentData.OBSERVED_ECPM || 0,
        },
        changes: {
          ESTIMATED_EARNINGS: calculateChange(
            currentData.ESTIMATED_EARNINGS || 0,
            previousData.ESTIMATED_EARNINGS || 0,
          ),
          CLICKS: calculateChange(currentData.CLICKS || 0, previousData.CLICKS || 0),
          IMPRESSIONS: calculateChange(currentData.IMPRESSIONS || 0, previousData.IMPRESSIONS || 0),
          IMPRESSION_CTR: calculateChange(currentData.IMPRESSION_CTR || 0, previousData.IMPRESSION_CTR || 0),
          MATCH_RATE: calculateChange(currentData.MATCH_RATE || 0, previousData.MATCH_RATE || 0),
          OBSERVED_ECPM: calculateChange(currentData.OBSERVED_ECPM || 0, previousData.OBSERVED_ECPM || 0),
        },
      }
    })
  }

  const getAlertStatus = (changes: any) => {
    const threshold = -20
    const hasAlert = Object.values(changes).some((change: any) => change < threshold)
    const hasWarning = Object.values(changes).some((change: any) => change < -10)
    return hasAlert ? "danger" : hasWarning ? "warning" : "normal"
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-blue-600"
    if (change < -20) return "text-red-600"
    if (change < -10) return "text-blue-500"
    return "text-red-500"
  }

  const getRowStyle = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-50 border-l-4 border-red-500 hover:bg-red-100"
      case "warning":
        return "bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100"
      default:
        return "hover:bg-gray-50"
    }
  }

  const appDetails = getAppDetails(selectedApp)
  const visibleMetrics = metrics.filter((m) => m.visible)
  const allSelected = metrics.every((m) => m.visible)
  const someSelected = metrics.some((m) => m.visible)

  const handleCountryClick = (country: string) => {
    router.push(`/dashboard/app-performance/${selectedApp}/${country.toLowerCase()}`)
  }

  return (
    <div className="flex gap-6">
      <div className="w-64 flex-shrink-0">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Chỉ số</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(!showSelector)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-600">Chọn chỉ số để hiển thị</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Select All checkbox */}
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={toggleAllMetrics}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-900 cursor-pointer">
                Chọn tất cả
              </label>
            </div>

            {/* Individual metric checkboxes */}
            {metrics.map((metric) => (
              <div key={metric.key} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.key}
                  checked={metric.visible}
                  onCheckedChange={() => toggleMetric(metric.key)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor={metric.key} className="text-sm text-gray-700 cursor-pointer flex-1">
                  {metric.label}
                </label>
              </div>
            ))}

            <div className="pt-2 text-xs text-gray-500">
              Đã chọn {visibleMetrics.length} / {metrics.length} chỉ số
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Hiệu suất theo Quốc gia - Tất cả Chỉ số</CardTitle>
            <CardDescription className="text-gray-600">
              Nhấp vào quốc gia để xem chi tiết hàng ngày. Sử dụng bảng bên trái để bật/tắt chỉ số.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-gray-700 font-medium sticky left-0 bg-white">Quốc gia</th>
                    {visibleMetrics.map((metric) => (
                      <th key={metric.key} className="text-right p-3 text-gray-700 font-medium">
                        {metric.label}
                      </th>
                    ))}
                    {visibleMetrics.map((metric) => (
                      <th key={`${metric.key}-change`} className="text-right p-3 text-gray-700 font-medium">
                        {metric.label} Thay đổi
                      </th>
                    ))}
                    <th className="text-center p-3 text-gray-700 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appDetails.map((detail, index) => {
                    const status = getAlertStatus(detail.changes)

                    return (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${getRowStyle(status)}`}
                        onClick={() => handleCountryClick(detail.country)}
                      >
                        <td className="p-3 font-medium sticky left-0 bg-inherit">
                          <div className="flex items-center gap-2 text-gray-900">
                            {detail.country}
                            {status === "danger" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {status === "warning" && <AlertTriangle className="w-4 h-4 text-blue-500" />}
                          </div>
                        </td>

                        {/* Current values */}
                        {visibleMetrics.map((metric) => (
                          <td key={metric.key} className="p-3 text-right text-gray-900 font-mono font-semibold">
                            {metric.format(detail.data[metric.key as keyof typeof detail.data])}
                          </td>
                        ))}

                        {/* Change values */}
                        {visibleMetrics.map((metric) => (
                          <td
                            key={`${metric.key}-change`}
                            className={`p-3 text-right font-semibold ${getChangeColor(detail.changes[metric.key as keyof typeof detail.changes])}`}
                          >
                            {detail.changes[metric.key as keyof typeof detail.changes] > 0 ? "+" : ""}
                            {detail.changes[metric.key as keyof typeof detail.changes].toFixed(2)}%
                          </td>
                        ))}

                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCountryClick(detail.country)
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
