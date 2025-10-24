"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Eye, Pencil, Trash2 } from "lucide-react"
import { toast } from 'sonner'
import PlatformBadge from '@/components/ui/platform-badge'
import { getAccessToken } from '@/lib/auth'

interface Store {
  _id: string
  platform: string
  name: string
  createdAt: string
  updatedAt: string
}

// Added minimal app interface
interface AppInfoLite {
  _id: string
  appName: string
  appIcon?: string
  storeId?: string | { _id: string }
}

const PLATFORM_OPTIONS = [
  { label: "Android", value: "android" },
  { label: "iOS", value: "ios" }
]

export default function StoreManagementPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [apps, setApps] = useState<AppInfoLite[]>([]) // new state
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [platform, setPlatform] = useState("android")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [detailStore, setDetailStore] = useState<Store | null>(null)
  const [editStore, setEditStore] = useState<Store | null>(null)
  const [deleteStore, setDeleteStore] = useState<Store | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false) // track app loading

  const apiBase = process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/"

  const fetchStores = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}stores`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Store[] = await res.json()
      setStores(Array.isArray(data) ? data : [])
    } catch (e: any) {
      const msg = e.message || 'Failed to load stores'
      setError(msg)
      toast.error('Tải dữ liệu thất bại', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  // New: fetch apps to display icons per store
  const fetchApps = async () => {
    setLoadingApps(true)
    try {
      const token = getAccessToken()
      if(!token) return
      const res = await fetch(`${apiBase}app-info`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: any[] = await res.json()
      const mapped: AppInfoLite[] = (Array.isArray(data)? data: []).map(a => ({
        _id: a._id,
        appName: a.appName,
        appIcon: a.appIcon,
        storeId: typeof a.storeId === 'object' && a.storeId?._id ? a.storeId._id : a.storeId
      }))
      setApps(mapped)
    } catch(e:any){ /* optional toast */ }
    finally { setLoadingApps(false) }
  }

  useEffect(() => { fetchStores(); fetchApps() }, [])

  const resetForm = () => { setPlatform("android"); setName("") }

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify({ platform, name })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created: Store = await res.json()
      setStores(prev => [created, ...prev])
      setOpenModal(false)
      resetForm()
      toast.success('Tạo store thành công', { description: `Store "${created.name}" đã được tạo.` })
    } catch (e: any) {
      const msg = e.message || 'Create failed'
      setError(msg)
      toast.error('Tạo store thất bại', { description: msg })
    } finally {
      setCreating(false)
    }
  }

  const openDetail = (s: Store) => setDetailStore(s)
  const openEdit = (s: Store) => { setEditStore(s); setPlatform(s.platform); setName(s.name) }
  const openDelete = (s: Store) => setDeleteStore(s)

  const handleUpdate = async () => {
    if(!editStore) return
    if(!name.trim()) { toast.error('Name required'); return }
    setUpdating(true)
    try {
      const res = await fetch(`${apiBase}stores/${editStore._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify({ name: name.trim(), platform })
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated: Store = await res.json()
      setStores(prev => prev.map(s => s._id === updated._id ? updated : s))
      toast.success('Cập nhật store thành công', { description: `"${updated.name}" đã được cập nhật.` })
      setEditStore(null)
      resetForm()
    } catch(e:any){ toast.error('Cập nhật store thất bại', { description: e.message || 'Update failed' }) } finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if(!deleteStore) return
    setDeleting(true)
    try {
      const res = await fetch(`${apiBase}stores/${deleteStore._id}`, { method: 'DELETE', headers: { accept: '*/*' } })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      setStores(prev => prev.filter(s => s._id !== deleteStore._id))
      toast.success('Xóa store thành công', { description: `"${deleteStore.name}" đã bị xóa.` })
      setDeleteStore(null)
    } catch(e:any){ toast.error('Xóa store thất bại', { description: e.message || 'Delete failed' }) } finally { setDeleting(false) }
  }

  const filteredStores = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.platform.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platformFilter === 'all' || s.platform === platformFilter
    return matchSearch && matchPlatform
  })

  // Helper: get apps for a store
  const storeApps = (storeId: string) => apps.filter(a => (typeof a.storeId === 'string' ? a.storeId : (a.storeId as any)?._id) === storeId)

  return (
    <div className="flex flex-col gap-6 py-8 px-4">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={()=> { fetchStores(); fetchApps(); }} disabled={loading || loadingApps} className="gap-2">
            {(loading || loadingApps) && <Loader2 className="h-4 w-4 animate-spin" />}
            Reload
          </Button>
          <Button onClick={() => { setOpenModal(true); resetForm(); }} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Store
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col min-w-[220px] flex-1">
          <label className="text-xs font-medium mb-1 text-muted-foreground">Search</label>
          <input
            className="h-10 rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
            placeholder="Search name or platform..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-[160px]">
          <label className="text-xs font-medium mb-1 text-muted-foreground">Platform</label>
          <select
            className="h-10 rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All</option>
            {PLATFORM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          {filteredStores.length} / {stores.length} shown
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Platform</th>
              <th className="px-4 py-2 font-medium">Apps</th>{/* new column */}
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Updated</th>
              <th className="px-4 py-2 font-medium text-center w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && stores.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading...</td></tr>
            )}
            {!loading && filteredStores.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No stores found</td></tr>
            )}
            {filteredStores.map(store => {
              const related = storeApps(store._id)
              const maxIcons = 5
              const extra = related.length - maxIcons
              return (
                <tr key={store._id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{store.name}</td>
                  <td className="px-4 py-2 capitalize">{store.platform ? <PlatformBadge platform={store.platform} /> : '—'}</td>
                  <td className="px-4 py-2">
                    {related.length === 0 ? (
                      <span className='text-xs text-muted-foreground'>—</span>
                    ) : (
                      <div className='flex items-center gap-1 flex-wrap'>
                        {related.slice(0, maxIcons).map(app => (
                          app.appIcon ? (
                            <img key={app._id} src={app.appIcon} alt={app.appName} title={app.appName} className='h-6 w-6 rounded object-cover border' />
                          ) : (
                            <div key={app._id} title={app.appName} className='h-6 w-6 rounded bg-muted text-[10px] flex items-center justify-center border'>{app.appName.charAt(0)}</div>
                          )
                        ))}
                        {extra > 0 && <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted border text-muted-foreground'>+{extra}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(store.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(store.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button size='icon' variant='outline' className='h-7 w-7 p-0' title='View details' onClick={()=> openDetail(store)}>
                        <Eye className='h-3.5 w-3.5' />
                      </Button>
                      <Button size='icon' variant='outline' className='h-7 w-7 p-0' title='Edit store' onClick={()=> openEdit(store)}>
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                      <Button size='icon' variant='outline' className='h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:border-red-300' title='Remove store' onClick={()=> openDelete(store)}>
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ...existing modals remain unchanged below */}
      {/* Create Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Create Store</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Platform</label>
                <select
                  className="h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {PLATFORM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  className="h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="Store name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" disabled={creating} onClick={() => { setOpenModal(false); resetForm(); }}>Cancel</Button>
                <Button type="button" className="flex-1" disabled={creating || !name.trim()} onClick={handleCreate}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">Store Details</h2>
            <div className='space-y-2 text-sm'>
              <p><span className='text-muted-foreground'>ID:</span> {detailStore._id}</p>
              <p><span className='text-muted-foreground'>Name:</span> {detailStore.name}</p>
              <p><span className='text-muted-foreground'>Platform:</span> <PlatformBadge platform={detailStore.platform} /></p>
              <p><span className='text-muted-foreground'>Created:</span> {new Date(detailStore.createdAt).toLocaleString()}</p>
              <p><span className='text-muted-foreground'>Updated:</span> {new Date(detailStore.updatedAt).toLocaleString()}</p>
              {/* Show related app icons here too */}
              <div>
                <p className='text-muted-foreground'>Apps:</p>
                <div className='flex flex-wrap gap-1 mt-1'>
                  {storeApps(detailStore._id).length === 0 && <span className='text-xs text-muted-foreground'>None</span>}
                  {storeApps(detailStore._id).map(a => a.appIcon ? <img key={a._id} src={a.appIcon} className='h-6 w-6 rounded object-cover border' title={a.appName} alt={a.appName} /> : <div key={a._id} className='h-6 w-6 rounded bg-muted text-[10px] flex items-center justify-center border' title={a.appName}>{a.appName.charAt(0)}</div>)}
                </div>
              </div>
            </div>
            <div className='flex gap-2 pt-6'>
              <Button variant='outline' className='flex-1' onClick={()=> setDetailStore(null)}>Close</Button>
              <Button className='flex-1' onClick={()=> { const s = detailStore; setDetailStore(null); if(s) openEdit(s) }}>Edit</Button>
            </div>
          </div>
        </div>
      )}

      {editStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">Edit Store</h2>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>Platform</label>
                <select className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={platform} onChange={e=> setPlatform(e.target.value)}>
                  {PLATFORM_OPTIONS.map(p=> <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>Name</label>
                <input className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={name} onChange={e=> setName(e.target.value)} placeholder='Store name' />
              </div>
            </div>
            <div className='flex gap-2 pt-5'>
              <Button variant='outline' className='flex-1' disabled={updating} onClick={()=> { setEditStore(null); resetForm() }}>Cancel</Button>
              <Button className='flex-1' disabled={updating || !name.trim()} onClick={handleUpdate}>{updating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}Save</Button>
            </div>
          </div>
        </div>
      )}

      {deleteStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg">
            <h2 className='text-lg font-semibold mb-2 text-center'>Remove Store</h2>
            <p className='text-sm text-muted-foreground'>Bạn có chắc muốn xóa "{deleteStore.name}"? Hành động này không thể hoàn tác.</p>
            <div className='flex gap-2 pt-6'>
              <Button variant='outline' className='flex-1' disabled={deleting} onClick={()=> setDeleteStore(null)}>Cancel</Button>
              <Button variant='destructive' className='flex-1' disabled={deleting} onClick={handleDelete}>{deleting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
