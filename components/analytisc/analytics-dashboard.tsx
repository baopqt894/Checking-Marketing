"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ComprehensiveAnalyticsDashboard } from "./comprehensive-analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, RefreshCw, Download, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { AnalyticsSummary } from "@/types/daily-analytics"
import { useSearchParams } from "next/navigation"

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPublisher, setSelectedPublisher] = useState<string>("")
  const [dateRange, setDateRange] = useState<string>("30") // Last 30 days
  const [publishers, setPublishers] = useState<Array<{ id: string; name: string }>>([])

  const searchParams = useSearchParams()
  const publisherIdFromUrl = searchParams.get("publisher_id")

  const fetchAnalyticsData = async () => {
    if (!selectedPublisher) return

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(
        `${apiUrl}analytics/comprehensive-summary?publisher_id=${selectedPublisher}&days=${dateRange}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AnalyticsSummary = await response.json()
      setAnalyticsData(data)
      toast.success(`Loaded comprehensive analytics for ${data.appData.length} apps`)
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      // Mock data for demonstration
      const mockData: AnalyticsSummary = {
        totalEarnings: 1200000000, // 1200 USD in micro USD
        totalClicks: 15420,
        totalImpressions: 892340,
        averageEcpm: 1340000, // 1.34 USD in micro USD
        averageCtr: 0.0173,
        dateRange: getDateRangeLabel(),
        appData: [
          {
            app_id: "1",
            app_name: "PlantZ - Plant Identification",
            platform: "IOS",
            total_earnings: 550000000,
            total_impressions: 234000,
            total_clicks: 3700,
            average_ecpm: 2350000,
            average_ctr: 0.0158,
            daily_data: generateMockDailyData(),
          },
          {
            app_id: "2",
            app_name: "Remote for Vizio TV",
            platform: "IOS",
            total_earnings: 329000000,
            total_impressions: 210000,
            total_clicks: 2100,
            average_ecpm: 1565000,
            average_ctr: 0.01,
            daily_data: generateMockDailyData(),
          },
          {
            app_id: "3",
            app_name: "Mod Addon for Melon Playground",
            platform: "IOS",
            total_earnings: 128000000,
            total_impressions: 234000,
            total_clicks: 4278,
            average_ecpm: 547000,
            average_ctr: 0.0183,
            daily_data: generateMockDailyData(),
          },
          {
            app_id: "4",
            app_name: "PlantId - Plant Identification",
            platform: "ANDROID",
            total_earnings: 130000000,
            total_impressions: 629000,
            total_clicks: 2070,
            average_ecpm: 207000,
            average_ctr: 0.0033,
            daily_data: generateMockDailyData(),
          },
          {
            app_id: "5",
            app_name: "Maps for COC",
            platform: "IOS",
            total_earnings: 50000000,
            total_impressions: 22770,
            total_clicks: 4278,
            average_ecpm: 2196000,
            average_ctr: 0.188,
            daily_data: generateMockDailyData(),
          },
        ],
        countryData: [
          { country: "US", earnings: 450000000, clicks: 5200, impressions: 320000, ctr: 0.0163 },
          { country: "GB", earnings: 180000000, clicks: 2100, impressions: 145000, ctr: 0.0145 },
          { country: "CA", earnings: 120000000, clicks: 1800, impressions: 98000, ctr: 0.0184 },
          { country: "AU", earnings: 95000000, clicks: 1200, impressions: 67000, ctr: 0.0179 },
          { country: "DE", earnings: 85000000, clicks: 980, impressions: 54000, ctr: 0.0181 },
          { country: "FR", earnings: 75000000, clicks: 890, impressions: 48000, ctr: 0.0185 },
          { country: "JP", earnings: 65000000, clicks: 750, impressions: 42000, ctr: 0.0179 },
          { country: "NL", earnings: 55000000, clicks: 620, impressions: 35000, ctr: 0.0177 },
        ],
      }
      setAnalyticsData(mockData)
      toast.success("Loaded mock analytics data")
    } finally {
      setLoading(false)
    }
  }

  const generateMockDailyData = () => {
    const days = Number.parseInt(dateRange)
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        date: date.toISOString().split("T")[0],
        estimated_earnings: Math.random() * 50000000 + 10000000, // 10-60 USD in micro USD
        impressions: Math.random() * 5000 + 1000,
        observed_ecpm: Math.random() * 3000000 + 500000, // 0.5-3.5 USD in micro USD
        clicks: Math.random() * 100 + 20,
        requests: Math.random() * 8000 + 2000,
        ctr: Math.random() * 0.03 + 0.005, // 0.5% - 3.5%
      }
    })
  }

  const fetchPublishers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}tokens/publishers`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const publisherOptions = data.flatMap(
        (publisher: any) =>
          publisher.publisher_ids?.map((pubId: string) => ({
            id: pubId,
            name: `${pubId} (${publisher.email})`,
          })) || [],
      )

      setPublishers(publisherOptions)
      if (publisherOptions.length > 0 && !selectedPublisher) {
        setSelectedPublisher(publisherOptions[0].id)
      }
    } catch (err) {
      console.error("Failed to fetch publishers:", err)
      // Mock publishers for demo
      const mockPublishers = [{ id: "pub-1234567890123456", name: "pub-1234567890123456 (demo@example.com)" }]
      setPublishers(mockPublishers)
      setSelectedPublisher(mockPublishers[0].id)
      toast.success("Loaded mock publishers")
    }
  }

  const syncAnalyticsData = async () => {
    if (!selectedPublisher) return

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(
        `${apiUrl}analytics/sync-daily-data?publisher_id=${selectedPublisher}&days=${dateRange}`,
        { method: "POST" },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success("Analytics data synced successfully")
      await fetchAnalyticsData()
    } catch (err) {
      console.error("Failed to sync analytics:", err)
      toast.error("Failed to sync analytics data")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}analytics/export?publisher_id=${selectedPublisher}&days=${dateRange}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `analytics-${selectedPublisher}-${dateRange}days.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Analytics data exported successfully")
    } catch (err) {
      console.error("Failed to export analytics:", err)
      toast.error("Failed to export analytics data")
    }
  }

  useEffect(() => {
    fetchPublishers()
  }, [])

  useEffect(() => {
    if (publisherIdFromUrl && publishers.length > 0) {
      const publisherExists = publishers.find((p) => p.id === publisherIdFromUrl)
      if (publisherExists) {
        setSelectedPublisher(publisherIdFromUrl)
      }
    } else if (publishers.length > 0 && !selectedPublisher) {
      setSelectedPublisher(publishers[0].id)
    }
  }, [publisherIdFromUrl, publishers])

  useEffect(() => {
    if (selectedPublisher) {
      fetchAnalyticsData()
    }
  }, [selectedPublisher, dateRange])

  const getDateRangeLabel = () => {
    const days = Number.parseInt(dateRange)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Analytics Dashboard"
        description="Monitor your AdMob performance with comprehensive insights and trends"
      />
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={exportData}
          disabled={!selectedPublisher || loading}
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          onClick={syncAnalyticsData}
          disabled={!selectedPublisher || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sync Data
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Publisher</label>
              <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent>
                  {publishers.map((publisher) => (
                    <SelectItem key={publisher.id} value={publisher.id}>
                      {publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[200px]">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Analytics Dashboard */}
      {selectedPublisher && analyticsData && (
        <ComprehensiveAnalyticsDashboard data={analyticsData} dateRange={getDateRangeLabel()} isLoading={loading} />
      )}

      {/* Empty State */}
      {!selectedPublisher && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Publisher</h3>
            <p className="text-muted-foreground text-center">
              Choose a publisher from the dropdown above to view comprehensive analytics data and insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
