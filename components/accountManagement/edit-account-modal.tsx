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
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

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
      const currentAppIds: string[] = []
      const currentAssignedApps: ActualAppInfo[] = []
      const seenIds = new Set<string>() 
      ;(account.appInfos || []).forEach((info) => {
        if (typeof info === "string") {
          if (!seenIds.has(info)) {
            currentAppIds.push(info)
            seenIds.add(info)
          }
        } else {
          const actualAppInfo = info as unknown as ActualAppInfo
          if (!seenIds.has(actualAppInfo._id)) {
            console.log("Rendering assigned app:", actualAppInfo)
            currentAppIds.push(actualAppInfo._id)
            currentAssignedApps.push(actualAppInfo)
            seenIds.add(actualAppInfo._id)
          }
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

  const updateAccount = async (
    accountData: {
      name: string
      email_private: string
      email_company: string
      isLeader: boolean
      appInfos: string[]
    },
    accountId: string,
  ) => {
    try {
      const response = await fetch(`${apiUrl}accounts/${accountId}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) {
        throw new Error("Failed to update account")
      }

      console.log("Successfully updated account")
    } catch (error) {
      console.error("Error in updateAccount:", error)
      throw error
    }
  }

  const toggleAppAssignment = (appId: string) => {
    setAssignedAppIds((prev) => {
      if (prev.includes(appId)) {
        const newIds = prev.filter((id) => id !== appId)
        setAssignedApps((prevApps) => prevApps.filter((app) => app._id !== appId))
        return newIds
      } else {
        const appAlreadyExists = assignedApps.some((app) => app._id === appId)
        if (appAlreadyExists) {
          console.log("App already exists in assignedApps, skipping duplicate")
          return prev
        }

        // Add to assigned
        const newIds = [...prev, appId]
        const publisherApp = availableApps.find((app) => app._id === appId)
        if (publisherApp && publisherApp.app[0]) {
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
          setAssignedApps((prevApps) => {
            const exists = prevApps.some((app) => app._id === appId)
            if (exists) {
              console.log("Preventing duplicate in setAssignedApps")
              return prevApps
            }
            return [...prevApps, actualAppInfo]
          })
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
      const accountData = {
        name: formData.name,
        email_private: formData.email_private,
        email_company: formData.email_company,
        isLeader: formData.isLeader,
        appInfos: assignedAppIds,
      }

      await updateAccount(accountData, account.id)

      const originalAppIds = (account.appInfos || []).map((info) => {
        if (typeof info === "string") {
          return info
        }
        return (info as unknown as ActualAppInfo)._id
      })

      const toAssign = assignedAppIds.filter((id) => !originalAppIds.includes(id))
      const toUnassign = originalAppIds.filter((id) => !assignedAppIds.includes(id))

      if (toAssign.length > 0) {
        const assignPromises = toAssign.map(async (appInfoId) => {
          const appResponse = await fetch(`${apiUrl}app-info/${appInfoId}/account`, {
            method: "PATCH",
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ account_id: account.id }),
          })

          if (!appResponse.ok) {
            console.error(`Failed to update app ${appInfoId} with account_id`)
          }

          return appResponse
        })

        await Promise.all(assignPromises)
      }

      // Update apps that need to be unassigned
      if (toUnassign.length > 0) {
        const unassignPromises = toUnassign.map(async (appInfoId) => {
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

        await Promise.all(unassignPromises)
      }

      console.log("Successfully updated account and all apps")
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
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Account
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
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

          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-4">
              <Minus className="h-4 w-4" />
              <h3 className="font-semibold">Assigned Apps ({assignedApps.length})</h3>
            </div>

            <ScrollArea className="h-96 pr-4">
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

            <ScrollArea className="h-96 pr-4">
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
