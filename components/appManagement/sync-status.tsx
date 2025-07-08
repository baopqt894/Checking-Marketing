"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Database } from "lucide-react"

interface SyncStatusProps {
  lastSyncTime: string | null
  isSyncing: boolean
  syncError: string | null
  totalApps: number
}

export function SyncStatus({ lastSyncTime, isSyncing, syncError, totalApps }: SyncStatusProps) {
  const formatSyncTime = (time: string | null) => {
    if (!time) return "Never"
    return new Date(time).toLocaleString()
  }

  const getSyncStatusBadge = () => {
    if (isSyncing) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1 animate-spin" />
          Syncing...
        </Badge>
      )
    }

    if (syncError) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Sync Failed
        </Badge>
      )
    }

    if (lastSyncTime) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      )
    }

    return (
      <Badge variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Not Synced
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {getSyncStatusBadge()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Sync</span>
          <span className="text-sm font-medium">{formatSyncTime(lastSyncTime)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Apps</span>
          <span className="text-sm font-medium">{totalApps}</span>
        </div>

        {syncError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Sync Error</p>
                <p className="text-xs text-red-600 mt-1">{syncError}</p>
              </div>
            </div>
          </div>
        )}

        {isSyncing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-800">Syncing data from AdMob...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
