"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Smartphone, CheckCircle, AlertCircle, Globe, TrendingUp, TrendingDown } from "lucide-react"
import type { ProcessedApp } from "@/types/app"

interface EnhancedStatsCardsProps {
  apps: ProcessedApp[]
}

export function EnhancedStatsCards({ apps }: EnhancedStatsCardsProps) {
  const totalApps = apps.length
  const approvedApps = apps.filter((app) => app.approvalState === "APPROVED").length
  const actionRequiredApps = apps.filter((app) => app.approvalState === "ACTION_REQUIRED").length
  const androidApps = apps.filter((app) => app.platform === "ANDROID").length
  const iosApps = apps.filter((app) => app.platform === "IOS").length

  const approvalRate = totalApps > 0 ? (approvedApps / totalApps) * 100 : 0
  const androidRate = totalApps > 0 ? (androidApps / totalApps) * 100 : 0
  const iosRate = totalApps > 0 ? (iosApps / totalApps) * 100 : 0
  const actionRequiredRate = totalApps > 0 ? (actionRequiredApps / totalApps) * 100 : 0

  const getApprovalRateColor = (rate: number) => {
    if (rate >= 80) return "blue"
    if (rate >= 50) return "blue"
    return "blue"
  }

  const getApprovalRateText = (rate: number) => {
    if (rate >= 80) return { text: "Excellent approval rate", color: "text-blue-600", icon: TrendingUp }
    if (rate >= 50) return { text: "Good approval rate", color: "text-blue-600", icon: TrendingUp }
    return { text: "Needs improvement", color: "text-blue-600", icon: TrendingDown }
  }

  const approvalRateInfo = getApprovalRateText(approvalRate)
  const ApprovalIcon = approvalRateInfo.icon

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <Smartphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalApps}</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Android
              </span>
              <span className="font-medium">{androidApps}</span>
            </div>
            <Progress value={androidRate} color="blue" className="h-2" />

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                iOS
              </span>
              <span className="font-medium">{iosApps}</span>
            </div>
            <Progress value={iosRate} color="blue" className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Apps</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold ">{approvedApps}</div>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={approvalRate} color="blue" className="flex-1 h-2" />
            <span className="text-sm font-medium text-blue-600">{Math.round(approvalRate)}%</span>
          </div>
         
        </CardContent>
      </Card>

      {/* Action Required */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Action Required</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold ">{actionRequiredApps}</div>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={actionRequiredRate} color="blue" className="flex-1 h-2" />
            <span className="text-sm font-medium text-blue-600">{Math.round(actionRequiredRate)}%</span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {actionRequiredApps === 0 ? (
              <span className="text-blue-600">All apps approved!</span>
            ) : (
              <span>{actionRequiredApps} apps need attention</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Android</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{androidApps}</div>
                <div className="text-xs text-muted-foreground">{Math.round(androidRate)}%</div>
              </div>
            </div>
            <Progress value={androidRate} color="blue" className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">iOS</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{iosApps}</div>
                <div className="text-xs text-muted-foreground">{Math.round(iosRate)}%</div>
              </div>
            </div>
            <Progress value={iosRate} color="blue" className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
