"use client"

import { useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"

import { toast } from "sonner"
import type { PublisherApp, ProcessedApp } from "@/types/app"
import { PublisherSelector } from "@/components/appManagement/publisher-selector"
import { AppTable } from "@/components/appManagement/app-table"
import { AppFilters } from "@/components/appManagement/app-filters"
import { AppDetailsModal } from "@/components/appManagement/app-details-modal"
import { CompactPublisherSelector } from "@/components/appManagement/compact-publisher-selector"
import { AppTabs } from "@/components/appManagement/app-tabs"
import { Globe } from "lucide-react"
import { EnhancedStatsCards } from "@/components/appManagement/app-stats-cards"

export default function AppManagement() {
  const [rawApps, setRawApps] = useState<PublisherApp[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")

  // Modal states
  const [selectedApp, setSelectedApp] = useState<ProcessedApp | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Process raw API data into flat app list
  const processedApps = useMemo((): ProcessedApp[] => {
    const apps: ProcessedApp[] = []

    rawApps.forEach((publisherData) => {
      publisherData.app.forEach((appInfo) => {
        apps.push({
          _id: appInfo._id,
          appId: appInfo.appId,
          displayName: appInfo.manualAppInfo.displayName,
          platform: appInfo.platform,
          approvalState: appInfo.appApprovalState,
          publisherId: publisherData.Publisher_id,
          linkedAppInfo: appInfo.linkedAppInfo,
        })
      })
    })

    return apps
  }, [rawApps])

  // Filter apps based on search and filters
  const filteredApps = useMemo(() => {
    return processedApps.filter((app) => {
      const matchesSearch =
        app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.appId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPlatform = platformFilter === "all" || app.platform === platformFilter
      const matchesApproval = approvalFilter === "all" || app.approvalState === approvalFilter

      return matchesSearch && matchesPlatform && matchesApproval
    })
  }, [processedApps, searchTerm, platformFilter, approvalFilter])

  const fetchApps = async (publisherId: string) => {
    if (!publisherId) return

    setLoading(true)
    setSyncError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}app-info/publisher/${publisherId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PublisherApp[] = await response.json()
      setRawApps(data)
      setLastSyncTime(new Date().toISOString())

      toast.success(`Loaded ${data.length} app records for ${publisherId}`)
    } catch (err) {
      console.error("Failed to fetch apps:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setSyncError(errorMessage)
      toast.error("Failed to fetch apps")
    } finally {
      setLoading(false)
    }
  }

  const syncFromAdMob = async (publisherId: string) => {
    if (!publisherId) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}app-info/sync-from-admob?publisher_id=${publisherId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success("Successfully synced data from AdMob")
      await fetchApps(publisherId)
    } catch (err) {
      console.error("Failed to sync from AdMob:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to sync from AdMob"
      setSyncError(errorMessage)
      toast.error("Failed to sync from AdMob")
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePublisherChange = (publisherId: string) => {
    setSelectedPublisherId(publisherId)
    setRawApps([])
    setLastSyncTime(null)
    setSyncError(null)
    fetchApps(publisherId)
  }

  const handleSyncData = (publisherId: string) => {
    syncFromAdMob(publisherId)
  }

  const handleViewDetails = (app: ProcessedApp) => {
    setSelectedApp(app)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedApp(null)
  }

  const handleRefreshApps = () => {
    if (selectedPublisherId) {
      fetchApps(selectedPublisherId)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="App Management"
        description="Manage and monitor your AdMob applications across all platforms"
      />

      <CompactPublisherSelector
        selectedPublisherId={selectedPublisherId}
        onPublisherChange={handlePublisherChange}
        onSyncData={handleSyncData}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        syncError={syncError}
      />

      {selectedPublisherId && (
        <>
          <EnhancedStatsCards apps={processedApps} />

          <AppFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            approvalFilter={approvalFilter}
            onApprovalFilterChange={setApprovalFilter}
            onRefresh={handleRefreshApps}
            isLoading={loading}
          />

          {loading ? (
            <div className="text-center text-muted-foreground py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading Applications</h3>
              <p className="text-sm">Fetching apps for {selectedPublisherId}...</p>
            </div>
          ) : (
            <AppTabs apps={filteredApps} onViewDetails={handleViewDetails} />
          )}
        </>
      )}

      {!selectedPublisherId && !loading && (
        <div className="text-center text-muted-foreground py-20">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a Publisher</h3>
            <p className="text-sm">
              Choose a publisher from the dropdown above to view and manage their applications across all platforms.
            </p>
          </div>
        </div>
      )}

      <AppDetailsModal app={selectedApp} isOpen={showDetailsModal} onClose={handleCloseDetailsModal} />
    </div>
  )
}