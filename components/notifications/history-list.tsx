"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface HistoryNotification {
  _id: string
  baseTopics: string[]
  title: string
  message: string
  sendType: "immediate" | "at" | "daily"
  status: "sent" | "error"
  createdAt: string
  updatedAt: string
  lastSentAt?: string
}

interface HistoryListProps {
  token: string | null
}

const ITEMS_PER_PAGE = 5

export function HistoryList({ token }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchHistory = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL}fcm/scheduled/history`, {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHistory(Array.isArray(data) ? data : [])
      setCurrentPage(1)
    } catch (e: any) {
      toast.error("Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [token])

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>()
    history.forEach((notif) => {
      notif.baseTopics.forEach((topic) => apps.add(topic))
    })
    return Array.from(apps).sort()
  }, [history])

  const filteredHistory = useMemo(() => {
    let result = history

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
  }, [history, selectedApp, searchQuery])

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedHistory = filteredHistory.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold">Notification History</h3>
        <Button variant="outline" onClick={fetchHistory} disabled={loading} className="gap-2 bg-transparent">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="   Search by title or message..."
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
        {loading && filteredHistory.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && filteredHistory.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No notifications found</p>
          </div>
        )}
        {paginatedHistory.map((notif) => (
          <div
            key={notif._id}
            className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notif.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  {notif.sendType}
                </Badge>
                {notif.status === "sent" && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Sent
                  </Badge>
                )}
                {notif.status === "error" && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong>Apps:</strong> {notif.baseTopics.join(", ")}
              </span>
              <span>Created: {new Date(notif.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredHistory.length} total)
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
  )
}
