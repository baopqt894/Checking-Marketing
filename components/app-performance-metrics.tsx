"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppMetricChart } from "@/components/app-metric-chart"
import { AppMetricTable } from "@/components/app-metric-table"
import { generateAppData } from "@/lib/generate-app-data"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AppPerformanceMetricsProps {
  appId: string
}

export function AppPerformanceMetrics({ appId }: AppPerformanceMetricsProps) {
  const [timeframe, setTimeframe] = useState<"day" | "hour">("day")
  const [metric, setMetric] = useState<"ctr" | "impressions" | "revenue" | "ecpm">("ctr")
  const data = generateAppData(appId, timeframe)

  const metricColors = {
    ctr: "#ef4444",
    impressions: "#22c55e",
    revenue: "#3b82f6",
    ecpm: "#a855f7",
  }

  const metricTrends = {
    ctr: { trend: "decreasing", percent: "15%" },
    impressions: { trend: "increasing", percent: "8%" },
    revenue: { trend: "increasing", percent: "12%" },
    ecpm: { trend: "decreasing", percent: "5%" },
  }

  const metricLabels = {
    ctr: "CTR (Click-Through Rate)",
    impressions: "Impressions",
    revenue: "Revenue",
    ecpm: "eCPM",
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Performance Metrics</h3>
          <Select value={metric} onValueChange={(value) => setMetric(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ctr">CTR</SelectItem>
              <SelectItem value="impressions">Impressions</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="ecpm">eCPM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "hour")}>
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="hour">Hourly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{metricLabels[metric]}</CardTitle>
          <CardDescription
            className={`flex items-center ${
              metricTrends[metric].trend === "decreasing" ? "text-red-500" : "text-green-500"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
              <path
                fillRule="evenodd"
                d={
                  metricTrends[metric].trend === "decreasing"
                    ? "M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    : "M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                }
                clipRule="evenodd"
              />
            </svg>
            {metricTrends[metric].trend === "decreasing" ? "Decreasing" : "Increasing"} ({metricTrends[metric].percent}{" "}
            last 7 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <AppMetricChart
              data={data}
              dataKey={metric}
              color={metricColors[metric]}
              decreasing={metricTrends[metric].trend === "decreasing"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Data</CardTitle>
          <CardDescription>
            Raw data for {metricLabels[metric]} by {timeframe === "day" ? "day" : "hour"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppMetricTable data={data} metric={metric} timeframe={timeframe} />
        </CardContent>
      </Card>
    </div>
  )
}
