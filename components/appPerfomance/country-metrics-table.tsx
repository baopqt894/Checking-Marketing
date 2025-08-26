"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppCountryData {
  appId: string
  country: string
  today: any
  yesterday: any
  avg7: any
  avg30: any
}

interface CountryMetricsTableProps {
  selectedApp: string
  apiData: AppCountryData[]
  onSelectCountry: (country: string) => void
}

export function CountryMetricsTable({ selectedApp, apiData, onSelectCountry }: CountryMetricsTableProps) {
  const router = useRouter()
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
        estimatedEarnings: currentData.ESTIMATED_EARNINGS || 0,
        clicks: currentData.CLICKS || 0,
        impressions: currentData.IMPRESSIONS || 0,
        impressionCtr: currentData.IMPRESSION_CTR || 0,
        matchRate: currentData.MATCH_RATE || 0,
        changes: {
          ESTIMATED_EARNINGS: calculateChange(
            currentData.ESTIMATED_EARNINGS || 0,
            previousData.ESTIMATED_EARNINGS || 0,
          ),
          CLICKS: calculateChange(currentData.CLICKS || 0, previousData.CLICKS || 0),
          IMPRESSIONS: calculateChange(currentData.IMPRESSIONS || 0, previousData.IMPRESSIONS || 0),
          IMPRESSION_CTR: calculateChange(currentData.IMPRESSION_CTR || 0, previousData.IMPRESSION_CTR || 0),
          MATCH_RATE: calculateChange(currentData.MATCH_RATE || 0, previousData.MATCH_RATE || 0),
        },
      }
    })
  }

  const getAlertStatus = (change: number) => {
    const threshold = -20
    return change < threshold ? "danger" : change < -10 ? "warning" : "normal"
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < -20) return "text-red-600"
    if (change < -10) return "text-orange-500"
    return "text-red-500"
  }

  const getRowStyle = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-50 border-l-4 border-red-500 hover:bg-red-100"
      case "warning":
        return "bg-orange-50 border-l-4 border-orange-500 hover:bg-orange-100"
      default:
        return "hover:bg-gray-50"
    }
  }

  const appDetails = getAppDetails(selectedApp)

  const handleCountryClick = (country: string) => {
    router.push(`/dashboard/app-performance/${selectedApp}/${country.toLowerCase()}`)
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Country Performance</CardTitle>
        <CardDescription className="text-gray-600">Click on any country to view daily details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-gray-700 font-medium">Country</th>
                <th className="text-right p-3 text-gray-700 font-medium">Earnings ($)</th>
                <th className="text-right p-3 text-gray-700 font-medium">24h Change</th>
                <th className="text-right p-3 text-gray-700 font-medium">Clicks</th>
                <th className="text-right p-3 text-gray-700 font-medium">24h Change</th>
                <th className="text-right p-3 text-gray-700 font-medium">CTR (%)</th>
                <th className="text-right p-3 text-gray-700 font-medium">Match Rate (%)</th>
                <th className="text-center p-3 text-gray-700 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {appDetails.map((detail, index) => {
                const hasAlert = Object.entries(detail.changes).some(
                  ([key, change]) => getAlertStatus(change as number) === "danger",
                )
                const hasWarning = Object.entries(detail.changes).some(
                  ([key, change]) => getAlertStatus(change as number) === "warning",
                )
                const status = hasAlert ? "danger" : hasWarning ? "warning" : "normal"

                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${getRowStyle(status)}`}
                    onClick={() => handleCountryClick(detail.country)}
                  >
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2 text-gray-900">
                        {detail.country}
                        {status === "danger" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {status === "warning" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                      ${detail.estimatedEarnings.toFixed(5)}
                    </td>
                    <td className={`p-3 text-right font-semibold ${getChangeColor(detail.changes.ESTIMATED_EARNINGS)}`}>
                      {detail.changes.ESTIMATED_EARNINGS > 0 ? "+" : ""}
                      {detail.changes.ESTIMATED_EARNINGS.toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-gray-900 font-mono font-semibold">{detail.clicks.toFixed(2)}</td>
                    <td className={`p-3 text-right font-semibold ${getChangeColor(detail.changes.CLICKS)}`}>
                      {detail.changes.CLICKS > 0 ? "+" : ""}
                      {detail.changes.CLICKS.toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                      {(detail.impressionCtr * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                      {(detail.matchRate * 100).toFixed(1)}%
                    </td>
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
  )
}
