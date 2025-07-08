"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Globe } from "lucide-react"
import type { ProcessedApp } from "@/types/app"
import { PaginatedAppTable } from "./paginated-app-table"

interface AppTabsProps {
  apps: ProcessedApp[]
  onViewDetails?: (app: ProcessedApp) => void
}

export function AppTabs({ apps, onViewDetails }: AppTabsProps) {
  const totalApps = apps.length
  const androidApps = apps.filter((app) => app.platform === "ANDROID")
  const iosApps = apps.filter((app) => app.platform === "IOS")

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          All Apps
          <Badge variant="secondary" className="ml-1">
            {totalApps}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="android" className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Android
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
            {androidApps.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="ios" className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          iOS
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
            {iosApps.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Applications</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Android: {androidApps.length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              iOS: {iosApps.length}
            </span>
          </div>
        </div>
        <PaginatedAppTable
          apps={apps}
          onViewDetails={onViewDetails}
          title={`All Applications (${totalApps})`}
          emptyMessage="No applications found. Try adjusting your search criteria or sync data from AdMob."
        />
      </TabsContent>

      <TabsContent value="android" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Android Applications
          </h3>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Google Play Store
          </Badge>
        </div>
        <PaginatedAppTable
          apps={androidApps}
          onViewDetails={onViewDetails}
          title={`Android Applications (${androidApps.length})`}
          emptyMessage="No Android applications found. Try adjusting your search criteria or sync data from AdMob."
        />
      </TabsContent>

      <TabsContent value="ios" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            iOS Applications
          </h3>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Apple App Store
          </Badge>
        </div>
        <PaginatedAppTable
          apps={iosApps}
          onViewDetails={onViewDetails}
          title={`iOS Applications (${iosApps.length})`}
          emptyMessage="No iOS applications found. Try adjusting your search criteria or sync data from AdMob."
        />
      </TabsContent>
    </Tabs>
  )
}
