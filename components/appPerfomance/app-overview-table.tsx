"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Eye, Search, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
interface AppCountryData {
  appId: string
  country: string
  today: any
  yesterday: any
  avg7: any
  avg30: any
}

interface AppOverviewTableProps {
  apiData: AppCountryData[]
  onSelectApp?: (appId: string) => void // Made optional since we'll use router
}

export function AppOverviewTable({ apiData, onSelectApp }: AppOverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("earnings")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter() // Added Next.js router

  const apps = [...new Set(apiData.map((item) => item.appId))]

  const handleAppClick = (appId: string) => {
    const encodedAppId = encodeURIComponent(appId)
    router.push(`/dashboard/app-performance/${encodedAppId}`)
  }

  const getAppHealthStatus = (appId: string) => {
    const appCountries = apiData.filter((item) => item.appId === appId)

    let hasAlert = false
    let hasWarning = false

    appCountries.forEach((item) => {
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
        }

        Object.entries(changes).forEach(([key, change]) => {
          if (change < -20) hasAlert = true
          else if (change < -10) hasWarning = true
        })
      }
    })

    return hasAlert ? "danger" : hasWarning ? "warning" : "normal"
  }

  const getAppSummary = (appId: string) => {
    const appCountries = apiData.filter((item) => item.appId === appId)

    const countries = appCountries.map((item) => item.country)

    const totalEarnings = appCountries.reduce((sum, item) => {
      const data = Object.keys(item.today).length > 0 ? item.today : item.avg7
      return sum + (data.ESTIMATED_EARNINGS || 0)
    }, 0)

    const totalClicks = appCountries.reduce((sum, item) => {
      const data = Object.keys(item.today).length > 0 ? item.today : item.avg7
      return sum + (data.CLICKS || 0)
    }, 0)

    const totalImpressions = appCountries.reduce((sum, item) => {
      const data = Object.keys(item.today).length > 0 ? item.today : item.avg7
      return sum + (data.IMPRESSIONS || 0)
    }, 0)

    const avgCtr =
      appCountries.reduce((sum, item) => {
        const data = Object.keys(item.today).length > 0 ? item.today : item.avg7
        return sum + (data.IMPRESSION_CTR || 0)
      }, 0) / appCountries.length

    const avgMatchRate =
      appCountries.reduce((sum, item) => {
        const data = Object.keys(item.today).length > 0 ? item.today : item.avg7
        return sum + (data.MATCH_RATE || 0)
      }, 0) / appCountries.length

    return {
      countries,
      totalEarnings,
      totalClicks,
      totalImpressions,
      avgCtr,
      avgMatchRate,
      countryCount: countries.length,
    }
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

  const sortedAndFilteredApps = apps
    .filter((app) => app.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const summaryA = getAppSummary(a)
      const summaryB = getAppSummary(b)

      let valueA, valueB
      switch (sortBy) {
        case "earnings":
          valueA = summaryA.totalEarnings
          valueB = summaryB.totalEarnings
          break
        case "clicks":
          valueA = summaryA.totalClicks
          valueB = summaryB.totalClicks
          break
        case "ctr":
          valueA = summaryA.avgCtr
          valueB = summaryB.avgCtr
          break
        case "countries":
          valueA = summaryA.countryCount
          valueB = summaryB.countryCount
          break
        default:
          valueA = summaryA.totalEarnings
          valueB = summaryB.totalEarnings
      }

      return sortOrder === "desc" ? valueB - valueA : valueA - valueB
    })

  return (
    <>
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 rounded px-3 py-2 text-sm"
          >
            <option value="earnings">Sort by Earnings</option>
            <option value="clicks">Sort by Clicks</option>
            <option value="ctr">Sort by CTR</option>
            <option value="countries">Sort by Countries</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="text-gray-600 hover:text-gray-900"
          >
            {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">App Performance Overview</CardTitle>
          <CardDescription className="text-gray-600">
            Click on any app to view detailed country breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-gray-700 font-medium">App Name</th>
                  <th className="text-center p-3 text-gray-700 font-medium">Markets</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Total Earnings ($)</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Total Clicks</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Avg CTR (%)</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Match Rate (%)</th>
                  <th className="text-center p-3 text-gray-700 font-medium">Status</th>
                  <th className="text-center p-3 text-gray-700 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredApps.map((app) => {
                  const healthStatus = getAppHealthStatus(app)
                  const summary = getAppSummary(app)

                  return (
                    <tr
                      key={app}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${getRowStyle(healthStatus)}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleAppClick(app) // Use new router-based handler
                      }}
                    >
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2 text-gray-900">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              healthStatus === "danger"
                                ? "bg-red-500"
                                : healthStatus === "warning"
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                            }`}
                          />
                          {app}
                          {healthStatus === "danger" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {healthStatus === "warning" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                          {summary.countryCount}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                        ${summary.totalEarnings.toFixed(3)}
                      </td>
                      <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                        {summary.totalClicks.toFixed(1)}
                      </td>
                      <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                        {(summary.avgCtr * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-gray-900 font-mono font-semibold">
                        {(summary.avgMatchRate * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          className={
                            healthStatus === "danger"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : healthStatus === "warning"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {healthStatus === "danger" ? "Critical" : healthStatus === "warning" ? "Warning" : "Healthy"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAppClick(app) // Use new router-based handler
                          }}
                        >
                          <Eye className="w-4 h-4" />
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
    </>
  )
}
