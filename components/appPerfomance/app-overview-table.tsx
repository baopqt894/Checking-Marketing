"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
  const router = useRouter()

  const filteredApps = apiData.filter(
    (app) =>
      app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <>
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
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

      <Card className="border-gray-200 mt-4">
        <CardHeader>
          <CardTitle className="text-gray-900">App Performance Overview</CardTitle>
          <CardDescription className="text-gray-600">
            Today's performance data for all apps ({filteredApps.length} apps found)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-gray-700 font-medium">App Name</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Earnings ($)</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Clicks</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Impressions</th>
                  <th className="text-right p-3 text-gray-700 font-medium">eCPM ($)</th>
                  <th className="text-right p-3 text-gray-700 font-medium">CTR (%)</th>
                  <th className="text-right p-3 text-gray-700 font-medium">Match Rate (%)</th>
                  <th className="text-center p-3 text-gray-700 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentApps.map((app) => (
                  <tr key={app.appId} className="border-b border-gray-100">
                    <td className="p-3 font-medium text-gray-900">
                      <div>
                        <div className="font-semibold">{app.appName}</div>
                        <div className="text-xs text-gray-500">{app.appId}</div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      ${app.metrics?.ESTIMATED_EARNINGS?.toFixed(3) ?? "0.000"}
                    </td>
                    <td className="p-3 text-right font-mono">{app.metrics?.CLICKS ?? 0}</td>
                    <td className="p-3 text-right font-mono">{app.metrics?.IMPRESSIONS ?? 0}</td>
                    <td className="p-3 text-right font-mono">${app.metrics?.OBSERVED_ECPM?.toFixed(2) ?? "0.00"}</td>
                    <td className="p-3 text-right font-mono">
                      {((app.metrics?.IMPRESSION_CTR ?? 0) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right font-mono">{((app.metrics?.MATCH_RATE ?? 0) * 100).toFixed(2)}%</td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredApps.length)} of {filteredApps.length} apps
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
