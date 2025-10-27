"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Loader2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { getUserInfo, getAccessToken } from "@/lib/auth"
import { SendNotificationForm, type SendNotificationData } from "@/components/notifications/send-notification-form"
import { NotificationPreview } from "@/components/notifications/notification-preview"
import { ConfirmSendModal } from "@/components/notifications/confirm-send-modal"
import { ScheduledList } from "@/components/notifications/scheduled-list"
import { HistoryList } from "@/components/notifications/history-list"

interface AppRecord {
  _id: string
  projectCode: string
  projectName?: string
  projectImage?: string
  fileName?: string
  createdAt: string
  updatedAt: string
}

export default function NotificationsPage() {
  const userInfo = getUserInfo()
  const isAdmin = userInfo?.role === "admin"

  const [apps, setApps] = useState<AppRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState<"android" | "ios" | "all">("all")
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("send")
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingData, setPendingData] = useState<SendNotificationData | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formMessage, setFormMessage] = useState("")

  const apiBase = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:2710/"
  const token = getAccessToken()

  const fetchApps = async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      if (!token) throw new Error("No token")
      const res = await fetch(`${apiBase}settings`, {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: AppRecord[] = await res.json()
      setApps(Array.isArray(data) ? data : [])
    } catch (e: any) {
      toast.error(e.message || "Load apps failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchApps()
    }
  }, [isAdmin])

  const filteredApps = apps.filter((a) => {
    const name = a.projectName?.toLowerCase() || ""
    const code = a.projectCode?.toLowerCase() || ""
    const mSearch = name.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
    return mSearch
  })

  const handleSelectAll = () => {
    if (selectedApps.size === filteredApps.length) {
      setSelectedApps(new Set())
    } else {
      setSelectedApps(new Set(filteredApps.map((a) => a._id)))
    }
  }

  const handleToggleApp = (appId: string) => {
    const newSelected = new Set(selectedApps)
    if (newSelected.has(appId)) {
      newSelected.delete(appId)
    } else {
      newSelected.add(appId)
    }
    setSelectedApps(newSelected)
  }

  const handleFormSubmit = (data: SendNotificationData) => {
    if (selectedApps.size === 0) {
      toast.error("Please select at least one app")
      return
    }
    setPendingData(data)
    setConfirmModalOpen(true)
  }

  const handleConfirmSend = async () => {
    if (!pendingData) return
    setIsSending(true)
    try {
      if (!token) throw new Error("No token")

      const baseTopics = Array.from(selectedApps).map((appId) => {
        const app = apps.find((a) => a._id === appId)
        return app?.projectCode || appId
      })

      const payload: any = {
        baseTopics,
        title: pendingData.title,
        message: pendingData.message,
        sendType: pendingData.sendType,
      }

      if (pendingData.sendType === "at" && pendingData.date && pendingData.hour !== undefined) {
        payload.date = pendingData.date
        payload.hour = pendingData.hour
        payload.minute = pendingData.minute 
      } else if (pendingData.sendType === "daily" && pendingData.hour !== undefined) {
        payload.hour = pendingData.hour
        payload.minute = pendingData.minute
      }

      const res = await fetch(`${apiBase}fcm/topic/multilang-multiapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${res.status}`)
      }

      const sendTypeLabel =
        pendingData.sendType === "immediate" ? "sent" : pendingData.sendType === "at" ? "scheduled" : "set to daily"
      toast.success(`Notification ${sendTypeLabel}`, {
        description: `"${pendingData.title}" has been ${sendTypeLabel} to ${selectedApps.size} app(s).`,
      })

      setConfirmModalOpen(false)
      setPendingData(null)
      setSelectedApps(new Set())
      setFormTitle("")
      setFormMessage("")
    } catch (e: any) {
      toast.error("Failed to send notification", {
        description: e.message || "Send failed",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Notifications" description="Send notifications to your apps" />
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          You are not authorized to view this page.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title="Notifications" description="Send notifications to your apps" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <SendNotificationForm
                onSubmit={handleFormSubmit}
                disabled={false}
                onTitleChange={setFormTitle}
                onMessageChange={setFormMessage}
              />
              <NotificationPreview title={formTitle} message={formMessage} />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search app..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button variant="outline" onClick={fetchApps} disabled={loading} className="gap-2 bg-transparent">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <RefreshCcw className="h-4 w-4" />
                  Reload
                </Button>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 flex items-center gap-3 border-b">
                  <input
                    type="checkbox"
                    checked={selectedApps.size === filteredApps.length && filteredApps.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm font-medium">
                    {selectedApps.size > 0 ? `${selectedApps.size} selected` : `Select All (${filteredApps.length})`}
                  </span>
                </div>

                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {loading && filteredApps.length === 0 && (
                    <div className="px-4 py-10 text-center text-muted-foreground">Loading...</div>
                  )}
                  {!loading && filteredApps.length === 0 && (
                    <div className="px-4 py-10 text-center text-muted-foreground">No apps found</div>
                  )}
                  {filteredApps.map((app) => (
                    <label
                      key={app._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedApps.has(app._id)}
                        onChange={() => handleToggleApp(app._id)}
                        className="h-4 w-4 rounded"
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {app.projectImage && (
                          <img
                            src={app.projectImage || "/placeholder.svg"}
                            alt={app.projectName}
                            className="h-8 w-8 rounded object-cover border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{app.projectName || app.projectCode}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.projectCode}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6 mt-6">
          <ScheduledList token={token} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <HistoryList token={token} />
        </TabsContent>
      </Tabs>

      <ConfirmSendModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSend}
        title={pendingData?.title || ""}
        message={pendingData?.message || ""}
        selectedAppCount={selectedApps.size}
        isLoading={isSending}
      />
    </div>
  )
}
