"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppMetricChart } from "@/components/app-metric-chart"
import { generateAppData } from "@/lib/generate-app-data"
import { useState } from "react"

interface AppOverviewProps {
  appId: string
}

export function AppOverview({ appId }: AppOverviewProps) {
  const [timeframe, setTimeframe] = useState<"day" | "hour">("day")
  const data = generateAppData(appId, timeframe)

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Performance Overview</h3>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "hour")}>
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="hour">Hourly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">CTR (Click-Through Rate)</CardTitle>
            <CardDescription className="flex items-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                  clipRule="evenodd"
                />
              </svg>
              Decreasing (15% last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppMetricChart data={data} dataKey="ctr" color="#ef4444" decreasing />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Impressions</CardTitle>
            <CardDescription className="flex items-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                  clipRule="evenodd"
                />
              </svg>
              Increasing (8% last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppMetricChart data={data} dataKey="impressions" color="#22c55e" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription className="flex items-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                  clipRule="evenodd"
                />
              </svg>
              Increasing (12% last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppMetricChart data={data} dataKey="revenue" color="#3b82f6" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">eCPM</CardTitle>
            <CardDescription className="flex items-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                  clipRule="evenodd"
                />
              </svg>
              Decreasing (5% last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppMetricChart data={data} dataKey="ecpm" color="#a855f7" decreasing />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
