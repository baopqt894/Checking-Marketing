"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import type { ProcessedApp } from "@/types/app"

interface AppTableProps {
  apps: ProcessedApp[]
  onViewDetails?: (app: ProcessedApp) => void
}

export function AppTable({ apps, onViewDetails }: AppTableProps) {
  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <AlertCircle className="w-3 h-3 mr-1" />
        Action Required
      </Badge>
    )
  }

  const getPlatformBadge = (platform: string) => {
    const isAndroid = platform === "ANDROID"
    return (
      <Badge variant="outline" className={isAndroid ? "text-green-600" : "text-blue-600"}>
        <Smartphone className="w-3 h-3 mr-1" />
        {platform}
      </Badge>
    )
  }

  const openAppStore = (app: ProcessedApp) => {
    if (app.linkedAppInfo?.appStoreId) {
      const url =
        app.platform === "ANDROID"
          ? `https://play.google.com/store/apps/details?id=${app.linkedAppInfo.appStoreId}`
          : `https://apps.apple.com/app/id${app.linkedAppInfo.appStoreId}`
      window.open(url, "_blank")
    }
  }

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No apps found</h3>
          <p className="text-muted-foreground text-center">
            No apps match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Apps ({apps.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">App Name</TableHead>
              <TableHead>App ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publisher ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app._id || app.appId} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{app.displayName}</span>
                    {app.linkedAppInfo?.displayName &&
                      app.linkedAppInfo.displayName !== app.displayName && (
                        <span className="text-xs text-muted-foreground">
                          Store: {app.linkedAppInfo.displayName}
                        </span>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{app.appId}</code>
                </TableCell>
                <TableCell>{getPlatformBadge(app.platform)}</TableCell>
                <TableCell>{getStatusBadge(app.approvalState)}</TableCell>
                <TableCell>
                  <code className="text-xs text-muted-foreground">{app.publisherId}</code>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {app.linkedAppInfo?.appStoreId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAppStore(app)}
                        className="h-8 w-8 p-0"
                        title="View in App Store"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {onViewDetails && (
                      <Button variant="outline" size="sm" onClick={() => onViewDetails(app)}>
                        View Details
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </CardContent>
    </Card>
  )
}
