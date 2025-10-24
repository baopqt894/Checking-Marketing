"use client"

import { useEffect, useMemo, useState, Fragment } from "react"
import Image from "next/image"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PlatformBadge from "@/components/ui/platform-badge"
import { toast } from "sonner"
import { getAccessToken } from "@/lib/auth"
import { Loader2, ChevronRight, ChevronDown, RefreshCcw, Plus, X, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AppLite {
  _id: string
  appName: string
  appIdentifier?: string
  appIcon?: string
  platform?: string
  // include store name and details
  storeName?: string
  storeId?: string | { _id: string; platform?: string; name?: string }
  user_id?: string | { _id: string }
}

interface UserWithApps {
  _id: string
  name: string
  email: string
  role?: string
  apps?: AppLite[]
  // Support new API count field
  appsCount?: number
}

export default function AssignAppPage() {
  const [users, setUsers] = useState<UserWithApps[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // per-user assign modal state
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [availableApps, setAvailableApps] = useState<AppLite[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [unassigningId, setUnassigningId] = useState<string | null>(null)

  // pagination + filters for unassigned list
  const [unassignedPage, setUnassignedPage] = useState(1)
  const [unassignedLimit, setUnassignedLimit] = useState(10)
  const [unassignedTotal, setUnassignedTotal] = useState<number | null>(null)
  const [unassignedSearch, setUnassignedSearch] = useState("")
  const [unassignedPlatform, setUnassignedPlatform] = useState<"all" | "android" | "ios">("all")

  const apiBase = (process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/").replace(/([^/])$/, "$1/")

  const loadUsers = async () => {
    setLoading(true)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const res = await fetch(`${apiBase}users/with-apps`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw: any = await res.json()

      let normalized: UserWithApps[] = []

      // New format: { data: [{ user, apps, appsCount }], meta }
      if (raw && Array.isArray(raw.data)) {
        normalized = raw.data.map((item: any) => {
          const u = item.user || {}
          const apps = (item.apps || []).map((a: any) => ({
            ...a,
            platform: a.platform || (typeof a.storeId === 'object' ? a.storeId?.platform : undefined),
            storeName: a.storeName || (typeof a.storeId === 'object' ? a.storeId?.name : undefined),
          }))
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            apps,
            appsCount: typeof item.appsCount === 'number' ? item.appsCount : apps.length,
          } as UserWithApps
        })
      } else if (Array.isArray(raw)) {
        // Old format: UserWithApps[]
        normalized = (raw || []).map((u: any) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          apps: (u.apps || []).map((a: any) => ({
            ...a,
            platform: a.platform || (typeof a.storeId === 'object' ? a.storeId?.platform : undefined),
            storeName: a.storeName || (typeof a.storeId === 'object' ? a.storeId?.name : undefined),
          })),
          appsCount: (u.apps || []).length,
        }))
      }

      setUsers(normalized)
    } catch(e:any){ toast.error('Failed to load users', { description: e.message }) } finally { setLoading(false) }
  }

  // Load unassigned apps from new API with pagination and filters
  const loadAvailableApps = async (
    page = unassignedPage,
    limit = unassignedLimit,
    searchQ = unassignedSearch,
    platformQ = unassignedPlatform
  ) => {
    setAppsLoading(true)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const url = new URL(`${apiBase}app-info/unassigned`)
      url.searchParams.set('page', String(page))
      url.searchParams.set('limit', String(limit))
      if (searchQ.trim()) url.searchParams.set('search', searchQ.trim())
      if (platformQ && platformQ !== 'all') url.searchParams.set('platform', platformQ)

      const res = await fetch(url.toString(), { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw: any = await res.json()

      let list: AppLite[] = []
      let total: number | null = null

      if (raw && Array.isArray(raw.data)) {
        list = raw.data
        total = typeof raw.meta?.total === 'number' ? raw.meta.total : null
      } else if (Array.isArray(raw)) {
        list = raw
      } else if (raw && Array.isArray(raw.items)) {
        // fallback shape
        list = raw.items
        total = typeof raw.total === 'number' ? raw.total : null
      }

      const mapped = (list||[]).map((a: any) => ({
        ...a,
        platform: a.platform || (typeof a.storeId === 'object' ? (a.storeId as any)?.platform : undefined),
        storeName: a.storeName || (typeof a.storeId === 'object' ? (a.storeId as any)?.name : undefined),
      }))
      setAvailableApps(mapped)
      setUnassignedTotal(total)
      setUnassignedPage(page)
    } catch(e:any){ toast.error('Failed to load apps', { description: e.message }) } finally { setAppsLoading(false) }
  }

  const openPickerFor = async (userId: string) => {
    setPickerFor(userId)
    setUnassignedPage(1)
    setUnassignedSearch("")
    setUnassignedPlatform("all")
    await loadAvailableApps(1, unassignedLimit, "", "all")
  }

  const closePicker = () => { 
    setPickerFor(null); 
    setAvailableApps([]); 
    setUnassignedTotal(null)
    setUnassignedSearch("")
    setUnassignedPlatform("all")
  }

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const assignApp = async (userId: string, appId: string) => {
    setAssigningId(appId)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      // Use new POST assign endpoint
      const res = await fetch(`${apiBase}app-info/${appId}/assign/${userId}`, {
        method: 'POST',
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('Gán app thành công')
      closePicker()
      await loadUsers()
    } catch(e:any){ toast.error('Gán thất bại', { description: e.message }) } finally { setAssigningId(null) }
  }

  const unassignApp = async (appId: string) => {
    setUnassigningId(appId)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const res = await fetch(`${apiBase}app-info/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', accept: '*/*', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: null })
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('Bỏ gán app')
      await loadUsers()
    } catch(e:any){ toast.error('Bỏ gán thất bại', { description: e.message }) } finally { setUnassigningId(null) }
  }

  useEffect(()=> { loadUsers() }, [])

  // Debounce search/filter inside modal
  useEffect(() => {
    if (!pickerFor) return
    const t = setTimeout(() => {
      setUnassignedPage(1)
      loadAvailableApps(1, unassignedLimit)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unassignedSearch, unassignedPlatform])

  const filtered = useMemo(() => users.filter(u => {
    if(!search.trim()) return true
    const q = search.toLowerCase()
    return (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)
  }), [users, search])

  const totalPages = useMemo(()=> {
    if (!unassignedTotal || !unassignedLimit) return null
    return Math.max(1, Math.ceil(unassignedTotal / unassignedLimit))
  }, [unassignedTotal, unassignedLimit])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title="Assign Apps" description="View users and manage their assigned apps" />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col min-w-[240px]">
          <label className="text-xs font-medium text-muted-foreground mb-1">Search User</label>
          <Input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Name or email..." />
        </div>
        <Button variant="outline" onClick={loadUsers} disabled={loading} className="gap-2 ml-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <RefreshCcw className="h-4 w-4" />Reload
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10"></th>
              <th className="px-4 py-2 text-left font-medium">User</th>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Role</th>
              <th className="px-4 py-2 text-left font-medium">Total Apps</th>
              <th className="px-4 py-2 text-center font-medium w-32">Assign</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
            )}
            {filtered.map(u => {
              const isOpen = !!expanded[u._id]
              return (
                <Fragment key={u._id}>
                  <tr className="border-t hover:bg-muted/20">
                    <td className="px-2 py-2 align-top">
                      <button onClick={()=> toggleExpand(u._id)} className="h-7 w-7 inline-flex items-center justify-center rounded border bg-background hover:bg-muted">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-2 font-medium align-top">{u.name || '—'}</td>
                    <td className="px-4 py-2 align-top">{u.email}</td>
                    <td className="px-4 py-2 align-top capitalize">{u.role || 'user'}</td>
                    <td className="px-4 py-2 align-top">{u.appsCount ?? u.apps?.length ?? 0}</td>
                    <td className="px-4 py-2 align-top text-center">
                      <Button size="sm" variant="outline" onClick={()=> openPickerFor(u._id)}>
                        <Plus className="h-4 w-4 mr-1" /> Add App
                      </Button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-t bg-muted/10">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground">Apps ({u.apps?.length || 0})</p>
                          {(u.apps?.length || 0) === 0 && <div className="text-xs text-muted-foreground">No apps assigned.</div>}
                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {u.apps?.map(a => (
                              <div key={a._id} className="rounded-md border bg-background p-3 flex items-center gap-3">
                                {a.appIcon ? (
                                  <Image src={a.appIcon} alt={a.appName} width={40} height={40} className="rounded border object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-muted border flex items-center justify-center text-[10px] text-muted-foreground">No Icon</div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate" title={a.appName}>{a.appName}</p>
                                  <p className="text-[11px] font-mono text-muted-foreground truncate" title={a.appIdentifier}>{a.appIdentifier}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <PlatformBadge platform={a.platform} />
                                    <span className="text-[10px] text-muted-foreground truncate" title={a.storeName || '—'}>
                                      {a.storeName || '—'}
                                    </span>
                                  </div>
                                </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7" title="Unassign" disabled={unassigningId===a._id} onClick={()=> unassignApp(a._id)}>
                                  {unassigningId===a._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-500" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Assign Apps Modal */}
      <Dialog open={!!pickerFor} onOpenChange={(open)=> { if(!open) closePicker() }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chọn ứng dụng để gán</DialogTitle>
            <DialogDescription>
              Danh sách ứng dụng chưa được gán. Chọn một ứng dụng để gán cho người dùng.
            </DialogDescription>
          </DialogHeader>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-medium text-muted-foreground mb-1">Tìm kiếm</div>
              <div className="relative">
                <Input
                  value={unassignedSearch}
                  onChange={(e)=> setUnassignedSearch(e.target.value)}
                  placeholder="Tên, identifier, store..."
                  className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Nền tảng</div>
              <Select value={unassignedPlatform} onValueChange={(v)=> { setUnassignedPlatform(v as any) }}>
                <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Nền tảng" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {appsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Đang tải danh sách ứng dụng...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Icon</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Nền tảng</TableHead>
                    <TableHead>Cửa hàng</TableHead>
                    <TableHead className="text-right w-28">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableApps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Không có ứng dụng phù hợp.</TableCell>
                    </TableRow>
                  ) : (
                    availableApps.map(app => (
                      <TableRow key={app._id}>
                        <TableCell>
                          {app.appIcon ? (
                            <Image src={app.appIcon} alt={app.appName} width={28} height={28} className="rounded border object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded bg-muted border flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium leading-tight line-clamp-1" title={app.appName}>{app.appName}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{app.appIdentifier || '—'}</TableCell>
                        <TableCell>
                          <PlatformBadge platform={app.platform} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{app.storeName || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" disabled={assigningId===app._id} onClick={()=> pickerFor && assignApp(pickerFor, app._id)}>
                            {assigningId===app._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gán'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-3 mt-2">
            <div className="text-xs text-muted-foreground">
              {typeof unassignedTotal === 'number' ? (
                <>Trang {unassignedPage}{totalPages ? `/${totalPages}` : ''} · Tổng {unassignedTotal}</>
              ) : (
                <>Trang {unassignedPage}</>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={appsLoading || unassignedPage <= 1} onClick={()=> loadAvailableApps(unassignedPage - 1, unassignedLimit)}>Trước</Button>
              <Button variant="outline" size="sm" 
                disabled={appsLoading || (totalPages ? unassignedPage >= totalPages : false)}
                onClick={()=> loadAvailableApps(unassignedPage + 1, unassignedLimit)}>
                Tiếp
              </Button>
              <Button size="sm" variant="ghost" onClick={closePicker}>Đóng</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
