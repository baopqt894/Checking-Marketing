"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Clock, ChevronDown, ChevronLeft, ChevronRight, Trash2, Search, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ConfirmDeleteModal } from "./confirm-delete-modal"

interface ScheduledNotification {
  _id: string
  baseTopics: string[]
  title: string
  message: string
  sendType: "at" | "daily"
  sendAt?: string
  hour?: number
  status: "pending" | "sent" | "error"
  createdAt: string
  updatedAt: string
}

interface ScheduledListProps {
  token: string | null
}

const ITEMS_PER_PAGE = 5

export function ScheduledList({ token }: ScheduledListProps) {
  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ScheduledNotification | null>(null)

  const fetchScheduled = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL}fcm/scheduled/pending`, {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setScheduled(Array.isArray(data) ? data : [])
      setCurrentPage(1)
    } catch (e: any) {
      toast.error("Failed to load scheduled notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!/^[0-9a-f]{24}$/i.test(id)) {
      toast.error("Invalid notification ID format")
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL}fcm/scheduled/${id}`, {
        method: "DELETE",
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${res.status}`)
      }
      setScheduled(scheduled.filter((n) => n._id !== id))
      toast.success("Notification deleted")
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      toast.error("Failed to delete notification", {
        description: e.message || "Delete failed",
      })
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchScheduled()
  }, [token])

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>()
    scheduled.forEach((notif) => {
      notif.baseTopics.forEach((topic) => apps.add(topic))
    })
    return Array.from(apps).sort()
  }, [scheduled])

  const filteredScheduled = useMemo(() => {
    let result = scheduled

    // Filter by app
    if (selectedApp !== "all") {
      result = result.filter((notif) => notif.baseTopics.includes(selectedApp))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (notif) => notif.title.toLowerCase().includes(query) || notif.message.toLowerCase().includes(query),
      )
    }

    return result
  }, [scheduled, selectedApp, searchQuery])

  const formatScheduleTime = (notif: ScheduledNotification) => {
    if (notif.sendType === "daily") {
      return `Daily at ${String(notif.hour || 0).padStart(2, "0")}:00`
    } else if (notif.sendType === "at" && notif.sendAt) {
      return new Date(notif.sendAt).toLocaleString()
    }
    return "Unknown"
  }

  const totalPages = Math.ceil(filteredScheduled.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedScheduled = filteredScheduled.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Scheduled Notifications</h3>
          <Button variant="outline" onClick={fetchScheduled} disabled={loading} className="gap-2 bg-transparent">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                App: {selectedApp === "all" ? "All" : selectedApp}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedApp("all")}>All Apps</DropdownMenuItem>
              {uniqueApps.map((app) => (
                <DropdownMenuItem key={app} onClick={() => setSelectedApp(app)}>
                  {app}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
          {loading && filteredScheduled.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && filteredScheduled.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No scheduled notifications</p>
            </div>
          )}
          {paginatedScheduled.map((notif) => (
            <div
              key={notif._id}
              className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                </div>
                <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
                  {notif.sendType === "daily" ? "Daily" : "Scheduled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  <strong>Apps:</strong> {notif.baseTopics.join(", ")}
                </span>
                <span>
                  <strong>Send:</strong> {formatScheduleTime(notif)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Created: {new Date(notif.createdAt).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeleteTarget(notif)
                    setDeleteConfirmOpen(true)
                  }}
                  disabled={deleting === notif._id}
                  className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {deleting === notif._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredScheduled.length} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget._id)
          }
        }}
        title={deleteTarget?.title || ""}
        isLoading={deleting !== null}
      />
    </>
  )
}
