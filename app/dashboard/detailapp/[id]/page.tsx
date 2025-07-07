"use client"

import axios from "axios"
import useSWR from "swr"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppOverview } from "@/components/app-overview"
import { AppPerformanceMetrics } from "@/components/app-performance-metrics"
import { AppAdUnits } from "@/components/app-ad-units"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function AppDetailsPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  console.log("API URL:", apiUrl)
  const { data: app, error, isLoading } = useSWR(
    id ? `${apiUrl}/apps/${id}` : null,
    fetcher
  )

  if (isLoading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">Failed to load app</div>
  if (!app) return <div className="text-center py-10 text-red-500">App not found</div>

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/apps">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to apps</span>
          </Link>
        </Button>
        <DashboardHeader title={app.app} description={`Performance metrics for ${app.app}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card className="sticky top-6 w-full h-fit">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src="/placeholder.svg"
                  alt={app.app}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <CardTitle>{app.app}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline">{app.platform}</Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ad Units:</span>
                  <span className="font-medium">{app.adUnits ?? "--"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">{app.revenue ?? "--"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App ID:</span>
                  <span className="font-medium">{app._id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 rounded-t-lg rounded-b-none border-b">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                  <TabsTrigger value="adunits">Ad Units</TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="overview" className="mt-0">
                    <AppOverview appId={app._id} />
                  </TabsContent>
                  <TabsContent value="metrics" className="mt-0">
                    <AppPerformanceMetrics appId={app._id} />
                  </TabsContent>
                  <TabsContent value="adunits" className="mt-0">
                    <AppAdUnits appId={app._id} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
