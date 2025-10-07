"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

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
    AD_REQUESTS: number
    MATCHED_REQUESTS: number
  }
  yesterdayMetrics?: {
    ESTIMATED_EARNINGS: number
    CLICKS: number
    IMPRESSIONS: number
    OBSERVED_ECPM: number
    IMPRESSION_CTR: number
    MATCH_RATE: number
    AD_REQUESTS: number
    MATCHED_REQUESTS: number
  }
}

interface AppOverviewTableProps {
  apiData: AppCountryData[]
  onSelectApp?: (appId: string) => void
}

export function AppOverviewTable({ apiData }: AppOverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [earningsFilter, setEarningsFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const router = useRouter()

  const filteredApps = apiData.filter((app) => {
    const matchesSearch =
      app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appId.toLowerCase().includes(searchTerm.toLowerCase())

    const todayEarnings = app.metrics?.ESTIMATED_EARNINGS || 0
    const yesterdayEarnings = app.yesterdayMetrics?.ESTIMATED_EARNINGS || 0
    const earningsChange = todayEarnings - yesterdayEarnings

    let matchesEarningsFilter = true
    if (earningsFilter === "increased") matchesEarningsFilter = earningsChange > 0
    else if (earningsFilter === "decreased") matchesEarningsFilter = earningsChange < 0
    else if (earningsFilter === "high") matchesEarningsFilter = todayEarnings > 1

    let matchesPerformanceFilter = true
    if (performanceFilter === "high-ctr") matchesPerformanceFilter = (app.metrics?.IMPRESSION_CTR || 0) > 0.05
    else if (performanceFilter === "low-ctr") matchesPerformanceFilter = (app.metrics?.IMPRESSION_CTR || 0) < 0.02

    return matchesSearch && matchesEarningsFilter && matchesPerformanceFilter
  })

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApps = filteredApps.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  const ComparisonIndicator = ({
    today,
    yesterday,
    format = "number",
  }: { today: number; yesterday: number; format?: "number" | "currency" | "percentage" }) => {
    const change = today - yesterday
    const percentChange = yesterday > 0 ? (change / yesterday) * 100 : 0

    if (Math.abs(change) < 0.001) {
      return <Minus className="w-3 h-3 text-blue-400 inline ml-1" />
    }

    const isPositive = change > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? "text-blue-600" : "text-red-600"

    return (
      <div className={`inline-flex items-center ml-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs ml-1">{Math.abs(percentChange).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <>
      <div className=" p-4 rounded-lg border ">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-blue-600" />
            <Input
              placeholder="Search apps..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-white text-blue-900 placeholder-blue-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-700 font-medium">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20  focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-700 font-medium">Earnings:</span>
            <Select value={earningsFilter} onValueChange={setEarningsFilter}>
              <SelectTrigger className="w-32  focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="increased">Increased</SelectItem>
                <SelectItem value="decreased">Decreased</SelectItem>
                <SelectItem value="high">High ($1+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-700 font-medium">Performance:</span>
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-32  focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high-ctr">High CTR</SelectItem>
                <SelectItem value="low-ctr">Low CTR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className=" mt-4">
        <CardHeader>
          <CardTitle className="text-blue-900">App Performance Overview</CardTitle>
          <CardDescription className="text-blue-600">
            Today's performance data with yesterday comparison ({filteredApps.length} apps found)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b ">
                  <th className="text-left p-3 font-semibold">App Name</th>
                  <th className="text-right p-3  font-semibold">Earnings ($)</th>
                  <th className="text-right p-3  font-semibold">Clicks</th>
                  <th className="text-right p-3  font-semibold">Impressions</th>
                  <th className="text-right p-3  font-semibold">eCPM ($)</th>
                  <th className="text-right p-3  font-semibold">CTR (%)</th>
                  <th className="text-right p-3  font-semibold">Match Rate (%)</th>
                  <th className="text-right p-3  font-semibold">Ad Requests</th>
                  <th className="text-right p-3  font-semibold">Matched Requests</th>
                  <th className="text-center p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentApps.map((app) => (
                  <tr key={app.appId} className="border-b hover:bg-blue-50">
                    <td className="p-3 font-medium ">
                      <div>
                        <div className="font-semibold">{app.appName}</div>
                        <div className="text-xs ">{app.appId}</div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        ${app.metrics?.ESTIMATED_EARNINGS?.toFixed(3) ?? "0.000"}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.ESTIMATED_EARNINGS || 0}
                            yesterday={app.yesterdayMetrics.ESTIMATED_EARNINGS}
                            format="currency"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {app.metrics?.CLICKS ?? 0}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.CLICKS || 0}
                            yesterday={app.yesterdayMetrics.CLICKS}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {app.metrics?.IMPRESSIONS ?? 0}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.IMPRESSIONS || 0}
                            yesterday={app.yesterdayMetrics.IMPRESSIONS}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        ${app.metrics?.OBSERVED_ECPM?.toFixed(2) ?? "0.00"}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.OBSERVED_ECPM || 0}
                            yesterday={app.yesterdayMetrics.OBSERVED_ECPM}
                            format="currency"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {((app.metrics?.IMPRESSION_CTR ?? 0) * 100).toFixed(2)}%
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.IMPRESSION_CTR || 0}
                            yesterday={app.yesterdayMetrics.IMPRESSION_CTR}
                            format="percentage"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {((app.metrics?.MATCH_RATE ?? 0) * 100).toFixed(2)}%
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.MATCH_RATE || 0}
                            yesterday={app.yesterdayMetrics.MATCH_RATE}
                            format="percentage"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {app.metrics?.AD_REQUESTS ?? 0}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.AD_REQUESTS || 0}
                            yesterday={app.yesterdayMetrics.AD_REQUESTS}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end">
                        {app.metrics?.MATCHED_REQUESTS ?? 0}
                        {app.yesterdayMetrics && (
                          <ComparisonIndicator
                            today={app.metrics?.MATCHED_REQUESTS || 0}
                            yesterday={app.yesterdayMetrics.MATCHED_REQUESTS}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:bg-blue-100"
                        onClick={() => router.push(`/dashboard/app-performance/${encodeURIComponent(app.appId)}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t ">
              <div className="text-sm text-blue-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredApps.length)} of {filteredApps.length} apps
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className=" text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-blue-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className=" text-blue-700 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
