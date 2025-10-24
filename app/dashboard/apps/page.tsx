"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import { getUserInfo, getAccessToken } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RawApp {
  _id: string
  appName: string
  appUrl?: string
  appIcon?: string
  appIdentifier: string
  appId?: string // AdMob app id
  // storeId may be populated object OR just the id string
  storeId?: string | { _id: string; platform: string; name: string }
  user_id?: string | { _id: string }
  createdAt?: string
  updatedAt?: string
}

interface StoreRef { _id: string; name: string; platform: string }

interface AppRow {
  _id: string
  name: string
  identifier: string
  platform: string
  store: string
  storeId?: string
  createdAt?: string
  icon?: string
  url?: string
  appId?: string
}

export default function UserAppsPage() {
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [hydratingStores, setHydratingStores] = useState(false)
  const userInfo = getUserInfo()
  const userId = (userInfo as any)?.id || (userInfo as any)?._id

  const normalize = (raw: RawApp): AppRow => {
    let platform = "-"
    let storeName = "-"
    let storeIdValue: string | undefined
    if (typeof raw.storeId === 'string') {
      storeIdValue = raw.storeId
    } else if (raw.storeId && typeof raw.storeId === 'object') {
      storeIdValue = raw.storeId._id
      platform = raw.storeId.platform || '-'
      storeName = raw.storeId.name || '-'
    }
    return {
      _id: raw._id,
      name: raw.appName || "Unnamed",
      identifier: raw.appIdentifier || "-",
      platform,
      store: storeName,
      storeId: storeIdValue,
      createdAt: raw.createdAt,
      icon: raw.appIcon,
      url: raw.appUrl,
      appId: raw.appId,
    }
  }

  const fetchUserApps = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703/').replace(/([^/])$/,'$1/')
      const token = getAccessToken()
      if (!token) throw new Error("No token")
      const res = await fetch(`${apiUrl}app-info/user/${userId}`, {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: RawApp[] = await res.json()
      const mapped = Array.isArray(data) ? data.map(normalize) : []
      setApps(mapped)
      // If any store names missing but we have storeId -> hydrate
      if (mapped.some(a => a.store === '-' && a.storeId)) {
        hydrateStoreNames(mapped)
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Failed to fetch apps")
    } finally { setLoading(false) }
  }

  const hydrateStoreNames = async (current: AppRow[]) => {
    setHydratingStores(true)
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703/').replace(/([^/])$/,'$1/')
      const token = getAccessToken(); if(!token) return
      const res = await fetch(`${apiUrl}stores`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error('Stores load failed')
      const stores: StoreRef[] = await res.json()
      const map = new Map(stores.map(s => [s._id, s]))
      setApps(prev => prev.map(a => {
        if (a.store !== '-' || !a.storeId) return a
        const s = map.get(a.storeId)
        return s ? { ...a, store: s.name, platform: s.platform } : a
      }))
    } catch (e:any) {
      console.warn('Hydrate stores failed', e.message)
    } finally { setHydratingStores(false) }
  }

  useEffect(() => { fetchUserApps() }, [userId])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return apps
    return apps.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.identifier.toLowerCase().includes(q) ||
      a.platform.toLowerCase().includes(q) ||
      a.store.toLowerCase().includes(q)
    )
  }, [apps, search])

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "-"

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title="My Apps" description="Applications assigned to you" />

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search app..." className="h-9 w-full pl-8 pr-3 rounded-md border-2 border-muted bg-background text-sm outline-none focus:border-primary" />
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={fetchUserApps}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Refresh
        </Button>
        {hydratingStores && <span className='text-xs text-muted-foreground'>Updating store names...</span>}
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} / {apps.length} apps</div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Identifier</th>
              <th className="px-3 py-2 text-left font-medium">Platform</th>
              <th className="px-3 py-2 text-left font-medium">Store</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-14 text-center text-muted-foreground"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading apps...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-14 text-center text-muted-foreground">No apps found.</td></tr>
            ) : (
              filtered.map(app => (
                <tr key={app._id} className="border-t hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-medium flex items-center gap-2">
                    {app.icon && <img src={app.icon} alt={app.name} className="h-5 w-5 rounded object-cover" />}
                    {app.appId ? (
                      <Link href={`/dashboard/apps/${encodeURIComponent(app.appId)}`} className="hover:underline" title="View AdMob metrics (30 days)">
                        {app.name}
                      </Link>
                    ) : (
                      app.url ? (
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{app.name}</a>
                      ) : (
                        app.name
                      )
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{app.identifier}</td>
                  <td className="px-3 py-2"><Badge variant={app.platform.toLowerCase() === 'android' ? 'default' : 'secondary'}>{app.platform || '-'}</Badge></td>
                  <td className="px-3 py-2">{app.store}</td>
                  <td className="px-3 py-2 text-xs">{formatDate(app.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}