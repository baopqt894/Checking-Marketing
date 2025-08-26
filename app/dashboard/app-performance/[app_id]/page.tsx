"use client"

import AppMetricsDashboard from "@/components/appPerfomance/app-metrics-dashboard"
import { useParams } from "next/navigation"

export default function AppDetailPage() {
  const params = useParams()
  const appId = decodeURIComponent(params.app_id as string)

  return <AppMetricsDashboard initialSelectedApp={appId} />
}
