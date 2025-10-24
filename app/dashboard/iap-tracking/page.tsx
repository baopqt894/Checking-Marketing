"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { getAccessToken, getUserInfo } from "@/lib/auth"
import { Loader2, Search, RefreshCcw, ChevronDown, ChevronRight, Clock, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PlatformBadge from "@/components/ui/platform-badge"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface PurchaseRecord {
  _id: string
  appID: string
  purchase: string
  platform?: string
  ip?: string
  countryOrRegion?: string
  createdAt?: string
  updatedAt?: string
  appName?: string
  appIcon?: string
  [k: string]: any
}

interface GroupedIap {
  appIdentifier: string
  appName: string
  appIcon?: string
  total: number
  purchaseCounts: Record<string, number>
  records: PurchaseRecord[]
}

interface ApiResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type ViewMode = "timeline" | "byApp"

export default function IapTrackingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline")
  // Date & plan filters (new)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [planFilter, setPlanFilter] = useState("all")

  const [timelineRecords, setTimelineRecords] = useState<PurchaseRecord[]>([])
  const [timelineMeta, setTimelineMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [timelineLoading, setTimelineLoading] = useState(false)

  const [groups, setGroups] = useState<GroupedIap[]>([])
  const [groupsMeta, setGroupsMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [visibleRecords, setVisibleRecords] = useState<Record<string, number>>({})

  const [timelinePage, setTimelinePage] = useState(1)
  const [byAppPage, setByAppPage] = useState(1)

  const recordsPerPage = 10

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    if (!visibleRecords[id]) {
      setVisibleRecords((prev) => ({ ...prev, [id]: recordsPerPage }))
    }
  }

  const loadMoreRecords = (id: string) => {
    setVisibleRecords((prev) => ({ ...prev, [id]: (prev[id] || recordsPerPage) + recordsPerPage }))
  }

  const showAllRecords = (id: string, total: number) => {
    setVisibleRecords((prev) => ({ ...prev, [id]: total }))
  }

  // Derive plan options from loaded data (both modes)
  const planOptions = useMemo(() => {
    const set = new Set<string>()
    timelineRecords.forEach((r) => r.purchase && set.add(r.purchase))
    groups.forEach((g) => Object.keys(g.purchaseCounts || {}).forEach((p) => set.add(p)))
    return Array.from(set).sort()
  }, [timelineRecords, groups])

  // Reset pagination when filters change
  useEffect(() => {
    setTimelinePage(1)
    setByAppPage(1)
  }, [startDate, endDate, planFilter])

  const fetchTimelineRecords = async (page = 1) => {
    setTimelineLoading(true)
    try {
      const token = getAccessToken()
      if (!token) throw new Error("No token")
      const userId = (getUserInfo() as any)?._id || (getUserInfo() as any)?.id
      const url = new URL(
        `${(process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/").replace(/([^/])$/, "$1/")}tracking-iap/user/${userId}`,
      )
      url.searchParams.set("page", page.toString())
      url.searchParams.set("limit", "20")
      if (search.trim()) url.searchParams.set("search", search.trim())
      if (startDate) url.searchParams.set("startDate", startDate)
      if (endDate) url.searchParams.set("endDate", endDate)

      const res = await fetch(url.toString(), {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const response: ApiResponse<PurchaseRecord> = await res.json()

      setTimelineRecords(response.data)
      setTimelineMeta(response.meta)
    } catch (e: any) {
      toast.error("Failed to load timeline records", { description: e.message })
    } finally {
      setTimelineLoading(false)
    }
  }

  const fetchGroupedRecords = async (page = 1) => {
    setLoading(true)
    try {
      const token = getAccessToken()
      if (!token) throw new Error("No token")
      const userId = (getUserInfo() as any)?._id || (getUserInfo() as any)?.id
      const url = new URL(
        `${(process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/").replace(/([^/])$/, "$1/")}tracking-iap/user/${userId}/grouped`,
      )
      url.searchParams.set("page", page.toString())
      url.searchParams.set("limit", "10")
      if (search.trim()) url.searchParams.set("search", search.trim())
      if (startDate) url.searchParams.set("startDate", startDate)
      if (endDate) url.searchParams.set("endDate", endDate)

      const res = await fetch(url.toString(), {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const response: ApiResponse<GroupedIap> = await res.json()

      setGroups(response.data)
      setGroupsMeta(response.meta)
    } catch (e: any) {
      toast.error("Failed to load IAP records", { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (viewMode === "timeline") {
      fetchTimelineRecords(timelinePage)
    } else {
      fetchGroupedRecords(byAppPage)
    }
  }, [viewMode, timelinePage, byAppPage])

  const handleRefresh = () => {
    if (viewMode === "timeline") {
      fetchTimelineRecords(timelinePage)
    } else {
      fetchGroupedRecords(byAppPage)
    }
  }

  // Apply client-side plan filter after server filters/date range
  const planFilteredTimeline = useMemo(() => {
    if (planFilter === "all") return timelineRecords
    return timelineRecords.filter((r) => r.purchase === planFilter)
  }, [timelineRecords, planFilter])

  const planFilteredGroups = useMemo(() => {
    if (planFilter === "all") return groups
    return groups.filter((g) => g.purchaseCounts && g.purchaseCounts[planFilter] > 0)
  }, [groups, planFilter])

  const decorated = useMemo(
    () =>
      planFilteredGroups.map((g) => {
        const platforms = Array.from(new Set(g.records.map((r) => (r.platform || "").toLowerCase()).filter(Boolean)))
        const countries = Array.from(new Set(g.records.map((r) => r.countryOrRegion).filter(Boolean)))
        return { ...g, __platforms: platforms, __countries: countries }
      }),
    [planFilteredGroups],
  )

  const filtered = useMemo(
    () =>
      decorated.filter((g) => {
        const platOk = platformFilter === "all" || g.__platforms.includes(platformFilter)
        if (!platOk) return false
        const q = search.toLowerCase().trim()
        if (!q) return true
        const haystack: string[] = [g.appName, g.appIdentifier]
        Object.entries(g.purchaseCounts).forEach(([k]) => haystack.push(k))
        g.__countries.forEach((c) => c && haystack.push(c))
        return haystack.filter(Boolean).some((v) => v.toLowerCase().includes(q))
      }),
    [decorated, platformFilter, search],
  )

  const filteredTimeline = useMemo(
    () =>
      planFilteredTimeline.filter((r) => {
        const platOk = platformFilter === "all" || (r.platform || "").toLowerCase() === platformFilter
        if (!platOk) return false
        const q = search.toLowerCase().trim()
        if (!q) return true
        const haystack = [r.appID, r.appName, r.purchase, r.countryOrRegion, r.ip].filter(Boolean)
        return haystack.some((v) => v && v.toLowerCase().includes(q))
      }),
    [planFilteredTimeline, platformFilter, search],
  )

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="IAP Tracking"
        description={
          viewMode === "timeline" ? "Chronological purchase history" : "Grouped in-app purchase activity by application"
        }
      />

      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => {
            setViewMode("timeline")
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "timeline"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          Timeline View
        </button>
        <button
          onClick={() => {
            setViewMode("byApp")
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "byApp"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid3x3 className="h-4 w-4" />
          By App View
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* ...existing search & platform select... */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={viewMode === "timeline" ? "Search app, plan, country, IP..." : "Search app, plan, country..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setTimelinePage(1); setByAppPage(1) }}
            className="pl-8 w-60"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setTimelinePage(1); setByAppPage(1) }}
            className="h-9 rounded-md border-2 border-muted bg-background px-2 text-sm focus:border-primary outline-none"
          >
            <option value="all">All</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Plan</label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-9 rounded-md border-2 border-muted bg-background px-2 text-sm focus:border-primary outline-none min-w-[110px]"
          >
            <option value="all">All</option>
            {planOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-md border-2 border-muted bg-background px-2 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 rounded-md border-2 border-muted bg-background px-2 text-sm focus:border-primary outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={viewMode === "timeline" ? timelineLoading : loading}
          className="gap-1 ml-auto bg-transparent"
        >
          {(viewMode === "timeline" ? timelineLoading : loading) && <Loader2 className="h-4 w-4 animate-spin" />}
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {viewMode === "timeline" && (
        <>
          <div className="rounded-lg border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">App</th>
                  <th className="px-4 py-3 text-left font-medium">Purchase Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Platform</th>
                  <th className="px-4 py-3 text-left font-medium">Country</th>
                  <th className="px-4 py-3 text-left font-medium">IP Address</th>
                  <th className="px-4 py-3 text-left font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {timelineLoading && timelineRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
                      Loading timeline data...
                    </td>
                  </tr>
                )}
                {!timelineLoading && filteredTimeline.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      No purchases found.
                    </td>
                  </tr>
                )}
                {filteredTimeline.map((r) => (
                  <tr key={r._id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.appIcon ? (
                          <Image
                            src={r.appIcon || "/placeholder.svg"}
                            alt={r.appName || r.appID}
                            width={32}
                            height={32}
                            className="rounded-md border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {(r.appName || r.appID).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{r.appName || r.appID}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{r.appID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-medium">
                        {r.purchase}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.platform ? (
                        <PlatformBadge platform={r.platform.toLowerCase()} showLabel={true} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.countryOrRegion || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.ip || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{timelineMeta.page}</span> of{" "}
              <span className="font-semibold text-foreground">{timelineMeta.totalPages}</span> •{" "}
              <span className="font-semibold text-foreground">{timelineMeta.total}</span> purchase
              {timelineMeta.total !== 1 ? "s" : ""} total
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={timelineMeta.page === 1 || timelineLoading}
                onClick={() => setTimelinePage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={timelineMeta.page === timelineMeta.totalPages || timelineLoading}
                onClick={() => setTimelinePage((p) => Math.min(timelineMeta.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {viewMode === "byApp" && (
        <>
          <div className="rounded-lg border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-12"></th>
                  <th className="px-4 py-3 text-left font-medium">App</th>
                  <th className="px-4 py-3 text-center font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Purchase Plans</th>
                  <th className="px-4 py-3 text-left font-medium">Platforms</th>
                </tr>
              </thead>
              <tbody>
                {loading && groups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
                      Loading grouped data...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      No data found.
                    </td>
                  </tr>
                )}
                {filtered.map((g) => {
                  const isOpen = !!expanded[g.appIdentifier]
                  const visibleCount = visibleRecords[g.appIdentifier] || recordsPerPage
                  const displayedRecords = g.records.slice(0, visibleCount)
                  const hasMore = g.records.length > visibleCount

                  return (
                    <>
                      <tr key={g.appIdentifier} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(g.appIdentifier)}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors"
                          >
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {g.appIcon ? (
                              <Image
                                src={g.appIcon || "/placeholder.svg"}
                                alt={g.appName}
                                width={40}
                                height={40}
                                className="rounded-lg border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                {g.appName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold">{g.appName}</span>
                              <span className="font-mono text-xs text-muted-foreground">{g.appIdentifier}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {g.total}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(g.purchaseCounts).length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              Object.entries(g.purchaseCounts).map(([plan, count]) => (
                                <Badge key={plan} variant="outline" className="gap-1.5">
                                  <span className="font-medium">{plan}</span>
                                  <span className="text-muted-foreground">×{count}</span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {g.__platforms.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              g.__platforms.map((platform) => (
                                <PlatformBadge key={platform} platform={platform} showLabel={true} />
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-t bg-muted/10">
                          <td colSpan={5} className="px-8 py-5">
                            {g.records.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No purchase records available.</p>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    Showing{" "}
                                    <span className="font-semibold text-foreground">{displayedRecords.length}</span> of{" "}
                                    <span className="font-semibold text-foreground">{g.records.length}</span> purchases
                                  </span>
                                </div>

                                <div className="overflow-x-auto rounded-md border bg-background">
                                  <table className="w-full text-xs">
                                    <thead className="bg-muted/30 text-[11px] uppercase text-muted-foreground">
                                      <tr>
                                        <th className="text-left py-3 px-4 font-medium">Purchase Plan</th>
                                        <th className="text-left py-3 px-4 font-medium">Country</th>
                                        <th className="text-left py-3 px-4 font-medium">IP Address</th>
                                        <th className="text-left py-3 px-4 font-medium">Created At</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {displayedRecords.map((r) => (
                                        <tr key={r._id} className="border-t hover:bg-muted/20 transition-colors">
                                          <td className="py-3 px-4">
                                            <Badge variant="secondary" className="font-mono text-[11px] font-medium">
                                              {r.purchase}
                                            </Badge>
                                          </td>
                                          <td className="py-3 px-4 font-medium">{r.countryOrRegion || "—"}</td>
                                          <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                                            {r.ip || "—"}
                                          </td>
                                          <td className="py-3 px-4 text-muted-foreground">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {hasMore && (
                                  <div className="flex items-center justify-center gap-3 pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => loadMoreRecords(g.appIdentifier)}
                                      className="gap-2"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                      Load {Math.min(recordsPerPage, g.records.length - visibleCount)} more
                                    </Button>
                                    {g.records.length - visibleCount > recordsPerPage && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => showAllRecords(g.appIdentifier, g.records.length)}
                                        className="text-muted-foreground hover:text-foreground"
                                      >
                                        Show all {g.records.length}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{groupsMeta.page}</span> of{" "}
              <span className="font-semibold text-foreground">{groupsMeta.totalPages}</span> •{" "}
              <span className="font-semibold text-foreground">{groupsMeta.total}</span> app
              {groupsMeta.total !== 1 ? "s" : ""} total
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={groupsMeta.page === 1 || loading}
                onClick={() => setByAppPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={groupsMeta.page === groupsMeta.totalPages || loading}
                onClick={() => setByAppPage((p) => Math.min(groupsMeta.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
