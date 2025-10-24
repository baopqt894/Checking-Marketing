"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Copy, Smartphone, CheckCircle, AlertCircle, Globe, User } from "lucide-react"
import { toast } from "sonner"
import type { ProcessedApp } from "@/types/app"
import { getAccessToken } from "@/lib/auth"

interface Notification {
  _id: string
  title: string
  message: string
  sentAt: string
  status: "sent" | "pending" | "failed"
}

interface AppDetailsModalTabbedProps {
  app: ProcessedApp | null
  isOpen: boolean
  onClose: () => void
}

export function AppDetailsModalTabbed({ app, isOpen, onClose }: AppDetailsModalTabbedProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!app) return null

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const openAppStore = () => {
    if (app.linkedAppInfo?.appStoreId) {
      const url =
        app.platform === "ANDROID"
          ? `https://play.google.com/store/apps/details?id=${app.linkedAppInfo.appStoreId}`
          : `https://apps.apple.com/app/id${app.linkedAppInfo.appStoreId}`
      window.open(url, "_blank")
    }
  }

  const getStatusColor = (status: string) => {
    return status === "APPROVED" ? "text-green-600" : "text-orange-600"
  }

  const getStatusIcon = (status: string) => {
    return status === "APPROVED" ? CheckCircle : AlertCircle
  }

  const StatusIcon = getStatusIcon(app.approvalState)
  const accountInfo = app.account_id

  // Load users for assign tab
  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/").replace(/([^/])$/, "$1/")
      const token = getAccessToken()
      if (!token) throw new Error("Missing access token")
      const response = await fetch(`${apiBase}users`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load users")
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  // Load notifications for notification tab
  const loadNotifications = async () => {
    setNotificationsLoading(true)
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "App Approved",
          message: "Your app has been approved for ads",
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "sent",
        },
        {
          _id: "2",
          title: "Update Available",
          message: "A new version of your app is available",
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "sent",
        },
      ]
      setNotifications(mockNotifications)
    } catch (err: any) {
      toast.error("Failed to load notifications")
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handleSendNotification = async () => {
    setSubmitting(true)
    try {
      // Mock send notification - replace with actual API call
      toast.success("Notification sent successfully")
      // Reload notifications
      await loadNotifications()
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignUser = async () => {
    setSubmitting(true)
    try {
      // Mock assign user - replace with actual API call
      toast.success("User assigned successfully")
      setSelectedUserId(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to assign user")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full h-[600px] flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="assign" onClick={loadUsers}>
              Assign
            </TabsTrigger>
            <TabsTrigger value="notifications" onClick={loadNotifications}>
              Notifications
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{app.displayName}</h2>
                  {app.linkedAppInfo && app.linkedAppInfo?.displayName !== app.displayName && (
                    <p className="text-muted-foreground">
                      Store Name: {app.linkedAppInfo?.displayName ?? "Unknown App"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={app.platform === "ANDROID" ? "text-green-600" : "text-blue-600"}>
                    {app.platform}
                  </Badge>
                  <Badge
                    variant={app.approvalState === "APPROVED" ? "default" : "secondary"}
                    className={
                      app.approvalState === "APPROVED" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                    }
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {app.approvalState === "APPROVED" ? "Approved" : "Action Required"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">App ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{app.appId}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(app.appId, "App ID")}
                          disabled={submitting}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">App Name</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{app.displayName}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(app.displayName, "App Name")}
                          disabled={submitting}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">App Store ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {app.linkedAppInfo?.appStoreId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(app.linkedAppInfo?.appStoreId ?? "", "App Store ID")}
                          disabled={submitting}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {accountInfo && typeof accountInfo === "object" ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{accountInfo._id}</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(accountInfo._id, "Account ID")}
                              disabled={submitting}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{accountInfo.name}</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(accountInfo.name, "Account Name")}
                              disabled={submitting}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Private Email</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                              {accountInfo.email_private}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(accountInfo.email_private, "Private Email")}
                              disabled={submitting}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No account assigned</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">App Approval State</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={app.approvalState === "APPROVED" ? "default" : "secondary"}
                          className={
                            app.approvalState === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {app.approvalState === "APPROVED" ? "Approved" : "Action Required"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
