"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Crown, Smartphone, Monitor, Minus, Plus } from "lucide-react"
import type { Account } from "@/types/account"
import type { PublisherApp } from "@/types/app"

// Local interface matching actual API response
interface ActualAppInfo {
  _id: string
  id: string
  Publisher_id: string
  account_id: string
  app: Array<{
    name: string
    appId: string
    platform: "ANDROID" | "IOS"
    appApprovalState: "APPROVED" | "ACTION_REQUIRED"
    manualAppInfo: {
      displayName: string
    }
    linkedAppInfo?: {
      displayName: string
      appStoreId: string
    }
  }>
  __v: number
}

interface EditAccountModalProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
  onAccountUpdated: () => void
}

export function EditAccountModal({ account, isOpen, onClose, onAccountUpdated }: EditAccountModalProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/"

  const [formData, setFormData] = useState({
    name: "",
    email_private: "",
    email_company: "",
    isLeader: false,
  })

  const [assignedAppIds, setAssignedAppIds] = useState<string[]>([])
  const [availableApps, setAvailableApps] = useState<PublisherApp[]>([])
  const [assignedApps, setAssignedApps] = useState<ActualAppInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => {
    if (account) {
      // Extract app IDs and full AppInfo objects from account.appInfos
      const currentAppIds: string[] = []
      const currentAssignedApps: ActualAppInfo[] = []
      ;(account.appInfos || []).forEach((info) => {
        if (typeof info === "string") {
          currentAppIds.push(info)
          // For string IDs, we'll skip them since we want to avoid individual fetches
        } else {
          // This is a full AppInfo object - cast to our actual structure
          const actualAppInfo = info as unknown as ActualAppInfo
          console.log("Rendering assigned app:", actualAppInfo)
          currentAppIds.push(actualAppInfo._id)
          currentAssignedApps.push(actualAppInfo)
        }
      })

      setFormData({
        name: account.name || "",
        email_private: account.email_private || "",
        email_company: account.email_company || "",
        isLeader: account.isLeader || false,
      })

      setAssignedAppIds(currentAppIds)
      setAssignedApps(currentAssignedApps)
    }
  }, [account])

  useEffect(() => {
    if (isOpen) {
      fetchAvailableApps()
    }
  }, [isOpen])

  const fetchAvailableApps = async () => {
    setLoadingApps(true)
    try {
      // Only fetch unassigned apps
      const unassignedResponse = await fetch(`${apiUrl}app-info/no-account`)
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned apps")
      const unassignedApps: PublisherApp[] = await unassignedResponse.json()
      setAvailableApps(unassignedApps)
    } catch (error) {
      console.error("Error fetching apps:", error)
      toast.error("Failed to load available apps")
    } finally {
      setLoadingApps(false)
    }
  }

  const updateAccountApps = async (appInfoIds: string[], accountId: string) => {
    try {
      // 1. First, update the account with the new app list
      const accountResponse = await fetch(`${apiUrl}accounts/${accountId}/app-infos`, {
        method: "PATCH",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appInfoIds }),
      })

      if (!accountResponse.ok) {
        throw new Error("Failed to update account apps")
      }

      // 2. Then, update each app with the account_id
      const appUpdatePromises = appInfoIds.map(async (appInfoId) => {
        const appResponse = await fetch(`${apiUrl}app-info/${appInfoId}/account`, {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ account_id: accountId }),
        })

        if (!appResponse.ok) {
          console.error(`Failed to update app ${appInfoId} with account_id`)
        }

        return appResponse
      })

      await Promise.all(appUpdatePromises)
      console.log("Successfully updated account and all apps")
    } catch (error) {
      console.error("Error in updateAccountApps:", error)
      throw error
    }
  }

  const unassignAppsFromAccount = async (appInfoIds: string[], accountId: string) => {
    try {
      const appUpdatePromises = appInfoIds.map(async (appInfoId) => {
        const appResponse = await fetch(`${apiUrl}app-info/${appInfoId}/account`, {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ account_id: null }),
        })

        if (!appResponse.ok) {
          console.error(`Failed to remove account_id from app ${appInfoId}`)
        }

        return appResponse
      })

      await Promise.all(appUpdatePromises)
      console.log("Successfully unassigned apps from account")
    } catch (error) {
      console.error("Error in unassignAppsFromAccount:", error)
      throw error
    }
  }

  const toggleAppAssignment = (appId: string) => {
    setAssignedAppIds((prev) => {
      if (prev.includes(appId)) {
        // Remove from assigned
        const newIds = prev.filter((id) => id !== appId)
        // Also remove from assignedApps
        setAssignedApps((prevApps) => prevApps.filter((app) => app._id !== appId))
        return newIds
      } else {
        // Add to assigned
        const newIds = [...prev, appId]
        // Find the app from availableApps and add to assignedApps
        const publisherApp = availableApps.find((app) => app._id === appId)
        if (publisherApp && publisherApp.app[0]) {
          // Convert PublisherApp to ActualAppInfo format
          const actualAppInfo: ActualAppInfo = {
            _id: publisherApp._id,
            id: publisherApp._id,
            Publisher_id: publisherApp.Publisher_id,
            account_id: account?.id || "",
            app: publisherApp.app.map((app) => ({
              name: app.name || `accounts/${publisherApp.Publisher_id}/apps/${app.appId}`,
              appId: app.appId,
              platform: app.platform,
              appApprovalState: app.appApprovalState,
              manualAppInfo: app.manualAppInfo,
              linkedAppInfo: app.linkedAppInfo,
            })),
            __v: publisherApp.__v || 0,
          }
          setAssignedApps((prevApps) => [...prevApps, actualAppInfo])
        }
        return newIds
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return

    setIsLoading(true)
    try {
      const originalAppIds = (account.appInfos || []).map((info) => {
        if (typeof info === "string") {
          return info
        }
        return (info as unknown as ActualAppInfo)._id
      })

      // Determine which apps to assign and unassign
      const toAssign = assignedAppIds.filter((id) => !originalAppIds.includes(id))
      const toUnassign = originalAppIds.filter((id) => !assignedAppIds.includes(id))

      // Handle unassignments first
      if (toUnassign.length > 0) {
        await unassignAppsFromAccount(toUnassign, account.id)
      }

      // Then handle assignments
      await updateAccountApps(assignedAppIds, account.id)

      toast.success("Account updated successfully!")
      onAccountUpdated()
      onClose()
    } catch (error) {
      console.error("Error updating account:", error)
      toast.error("Failed to update account")
    } finally {
      setIsLoading(false)
    }
  }

  const currentlyAvailableApps = availableApps.filter((app) => !assignedAppIds.includes(app._id))

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Account
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          {/* Left Column - Account Information */}
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4" />
                <h3 className="font-semibold">Account Information</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_private">Private Email</Label>
                  <Input
                    id="email_private"
                    type="email"
                    value={formData.email_private}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email_private: e.target.value }))}
                    placeholder="personal@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_company">Company Email</Label>
                  <Input
                    id="email_company"
                    type="email"
                    value={formData.email_company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email_company: e.target.value }))}
                    placeholder="work@company.com"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isLeader"
                    checked={formData.isLeader}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isLeader: checked }))}
                  />
                  <Label htmlFor="isLeader" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Leader Role
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Assigned Apps */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-4">
              <Minus className="h-4 w-4" />
              <h3 className="font-semibold">Assigned Apps ({assignedApps.length})</h3>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {assignedApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No apps assigned</p>
                  </div>
                ) : (
                  assignedApps.map((appInfo, index) => {
                    const app = appInfo.app?.[0]
                    if (!app) return null

                    const displayName =
                      app.linkedAppInfo?.displayName || app.manualAppInfo?.displayName || "Unknown App"

                    return (
                      <div
                        key={`${appInfo._id}-${index}`}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors bg-green-50 border-green-200"
                        onClick={() => toggleAppAssignment(appInfo._id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {app.platform === "ANDROID" ? (
                            <Smartphone className="h-4 w-4 text-green-600" />
                          ) : (
                            <Monitor className="h-4 w-4 text-blue-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate" title={displayName}>
                              {displayName.length > 25 ? `${displayName.slice(0, 25)}...` : displayName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {app.appId.length > 12 ? `...${app.appId.slice(-12)}` : app.appId}
                            </div>
                          </div>
                          <Badge
                            variant={app.appApprovalState === "APPROVED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {app.appApprovalState}
                          </Badge>
                        </div>
                        <div className="text-red-500 hover:text-red-700">
                          <Minus className="h-4 w-4" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4" />
              <h3 className="font-semibold">Available Apps ({currentlyAvailableApps.length})</h3>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {loadingApps ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p>Loading...</p>
                  </div>
                ) : currentlyAvailableApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No apps available</p>
                  </div>
                ) : (
                  currentlyAvailableApps.map((publisherApp) => {
                    const appInfo = publisherApp.app?.[0]
                    if (!appInfo) return null

                    const displayName =
                      appInfo.linkedAppInfo?.displayName || appInfo.manualAppInfo?.displayName || "Unknown App"
                    return (
                      <div
                        key={publisherApp._id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors"
                        onClick={() => toggleAppAssignment(publisherApp._id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {appInfo.platform === "ANDROID" ? (
                            <Smartphone className="h-4 w-4 text-green-600" />
                          ) : (
                            <Monitor className="h-4 w-4 text-blue-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate" title={displayName}>
                              {displayName.length > 25 ? `${displayName.slice(0, 25)}...` : displayName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {appInfo.appId.length > 12 ? `...${appInfo.appId.slice(-12)}` : appInfo.appId}
                            </div>
                          </div>
                          <Badge
                            variant={appInfo.appApprovalState === "APPROVED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {appInfo.appApprovalState}
                          </Badge>
                        </div>
                        <div className="text-green-500 hover:text-green-700">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Updating...
              </>
            ) : (
              "Update Account"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
