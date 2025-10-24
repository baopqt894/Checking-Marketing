"use client"

import { useState, useEffect, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Search, Loader2, RefreshCcw, Check, Eye, UserPlus, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getUserInfo, getAccessToken } from '@/lib/auth'
import { AssignUserModal } from '@/components/appManagement/assign-user-modal'
import PlatformBadge from '@/components/ui/platform-badge'

// Added simple URL validator (protocol required)
function isValidUrl(value: string){
  if(!value) return false
  try { const u = new URL(value); return !!u.protocol && !!u.host } catch { return false }
}

interface AppRecord {
  _id: string
  appName: string
  appIdentifier: string
  appUrl?: string
  appIcon?: string
  storeId?: { _id: string; platform: string; name: string }
  // user_id from API may be populated object OR just a string id
  user_id?: string | { _id: string; email: string; name: string; role: string }
  createdAt: string
  updatedAt: string
}

interface StoreOption { _id: string; name: string; platform: string }
interface UserOption { _id: string; name: string; email: string; role: string }

export default function AppManagementPage() {
  const userInfo = getUserInfo()
  const isAdmin = userInfo?.role === 'admin'

  const [apps, setApps] = useState<AppRecord[]>([])
  const [stores, setStores] = useState<StoreOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])

  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)

  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Create form modal
  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIdentifier, setNewIdentifier] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [newStoreId, setNewStoreId] = useState('')
  const [newUserId, setNewUserId] = useState('')
  // Multi-step create flow
  const [createStep, setCreateStep] = useState(1) // 1: basic, 2: identifiers, 3: store, 4: assign
  const totalCreateSteps = 4

  // Derived validation flags (optional fields; only validate if value present)
  // const iconProvidedInvalid = newIcon.length > 0 && !isValidUrl(newIcon)
  // const appUrlProvidedInvalid = newUrl.length > 0 && !isValidUrl(newUrl)
  // Updated: required fields
  const iconInvalid = !newIcon || !isValidUrl(newIcon)
  const appUrlInvalid = !newUrl || !isValidUrl(newUrl)
  // Collect URL errors in requested array style (order: appUrl then appIcon)
  const urlErrors: string[] = []
  if (appUrlInvalid) urlErrors.push("appUrl must be a URL address")
  if (iconInvalid) urlErrors.push("appIcon must be a URL address")

  // Assign modal
  const [selectedApp, setSelectedApp] = useState<AppRecord | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  // New: detail modal state
  const [detailApp, setDetailApp] = useState<AppRecord | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703/'

  const fetchApps = async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const res = await fetch(`${apiBase}app-info`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: AppRecord[] = await res.json()
      setApps(Array.isArray(data) ? data : [])
    } catch (e:any) { toast.error(e.message || 'Load apps failed') } finally { setLoading(false) }
  }

  const fetchStores = async () => {
    try {
      const token = getAccessToken(); if(!token) return
      const res = await fetch(`${apiBase}stores`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed stores')
      const data: StoreOption[] = await res.json()
      setStores(data)
    } catch { /* ignore */ }
  }

  const fetchUsers = async () => {
    try {
      const token = getAccessToken(); if(!token) return
      const res = await fetch(`${apiBase}users`, { headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed users')
      const data: UserOption[] = await res.json()
      setUsers(data)
    } catch { /* ignore */ }
  }

  useEffect(() => { if(isAdmin){ fetchApps(); fetchStores(); fetchUsers(); } }, [isAdmin])

  const filteredApps = useMemo(() => {
    return apps.filter(a => {
      const name = a.appName?.toLowerCase() || ''
      const ident = a.appIdentifier?.toLowerCase() || ''
      const mSearch = name.includes(search.toLowerCase()) || ident.includes(search.toLowerCase())
      const platform = a.storeId?.platform?.toLowerCase() || ''
      const mPlatform = platformFilter === 'all' || platform === platformFilter
      return mSearch && mPlatform
    })
  }, [apps, search, platformFilter])

  const totalFiltered = filteredApps.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const pagedApps = useMemo(()=> filteredApps.slice((page-1)*pageSize, page*pageSize), [filteredApps, page])

  const total = apps.length
  const assigned = apps.filter(a => !!a.user_id).length

  const [feedback, setFeedback] = useState<{open:boolean; type:'success'|'error'; title?:string; message?:string}>({open:false, type:'success'})

  const handleCreate = async () => {
    if (!newName || !newIdentifier || !newStoreId) return
    if (iconInvalid || appUrlInvalid) return
    setCreating(true)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const res = await fetch(`${apiBase}app-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appName: newName,
          appUrl: newUrl,
          appIcon: newIcon,
          appIdentifier: newIdentifier,
          storeId: newStoreId,
          user_id: newUserId || undefined
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created: AppRecord = await res.json()
      setApps(prev => [created, ...prev])
      setOpenCreate(false)
      setNewName(''); setNewIdentifier(''); setNewUrl(''); setNewIcon(''); setNewStoreId(''); setNewUserId('')
      toast.success('Tạo app thành công', { description: `App "${created.appName}" đã được tạo.` })
    } catch (e:any) { toast.error('Tạo app thất bại', { description: e.message || 'Create failed' }); } finally { setCreating(false) }
  }

  const assignUsers = async (appId: string, userIds: string[]) => {
    const userId = userIds[0] || null
    setSavingAssign(true)
    try {
      const token = getAccessToken(); if(!token) throw new Error('No token')
      const res = await fetch(`${apiBase}app-info/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', accept: '*/*', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated: AppRecord = await res.json()
      setApps(prev => prev.map(a => a._id === updated._id ? updated : a))
      toast.success('Cập nhật phân công', { description: userId ? 'Đã gán người dùng thành công.' : 'Đã bỏ gán người dùng.' })
    } catch (e:any) { toast.error('Gán người dùng thất bại', { description: e.message || 'Assign failed' }); throw e } finally { setSavingAssign(false) }
  }

  const handleAssignSubmit = async (userIds: string[]) => {
    if (!selectedApp) return
    try { await assignUsers(selectedApp._id, userIds); setAssignOpen(false); setSelectedApp(null) } catch {}
  }

  if(!isAdmin){
    return <div className='flex flex-col gap-6'><DashboardHeader title='App Management' description='Assign and manage apps' /><div className='rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive'>You are not authorized to view this page.</div></div>
  }

  return (
    <div className='flex flex-col gap-6'>
      <DashboardHeader title='App Management' description='Assign and manage apps' />

      {/* Stats */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-3'>
        <div className='rounded-md border p-4 bg-card'><p className='text-xs text-muted-foreground mb-1'>Total Apps</p><p className='text-2xl font-bold'>{total}</p></div>
        <div className='rounded-md border p-4 bg-card'><p className='text-xs text-muted-foreground mb-1'>Assigned</p><p className='text-2xl font-bold'>{assigned}</p></div>
        <div className='rounded-md border p-4 bg-card'><p className='text-xs text-muted-foreground mb-1'>Unassigned</p><p className='text-2xl font-bold'>{total - assigned}</p></div>
      </div>

      {/* Filters + Actions */}
      <div className='flex flex-wrap items-end gap-4'>
        <div className='relative flex-1 min-w-[220px]'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search name or identifier...' value={search} onChange={e=> { setSearch(e.target.value); setPage(1) }} className='pl-10' />
        </div>
        <div>
          <label className='text-xs font-medium text-muted-foreground mb-1 block'>Platform</label>
          <select className='h-10 rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={platformFilter} onChange={e=> setPlatformFilter(e.target.value)}>
            <option value='all'>All</option>
            <option value='android'>Android</option>
            <option value='ios'>iOS</option>
          </select>
        </div>
        <Button variant='outline' onClick={fetchApps} disabled={loading} className='gap-2'>{loading && <Loader2 className='h-4 w-4 animate-spin' />}<RefreshCcw className='h-4 w-4' />Reload</Button>
        <Button onClick={()=> { setCreateStep(1); setOpenCreate(true) }} className='gap-2'><PlusCircle className='h-4 w-4' />New App</Button>
      </div>

      {/* Table */}
      <div className='rounded-md border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr className='text-left'>
              <th className='px-4 py-2 font-medium'>Name</th>
              <th className='px-4 py-2 font-medium'>Identifier</th>
              <th className='px-4 py-2 font-medium'>Platform</th>
              <th className='px-4 py-2 font-medium'>User</th>
              <th className='px-4 py-2 font-medium text-center w-[120px]'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && apps.length === 0 && <tr><td colSpan={5} className='px-4 py-10 text-center text-muted-foreground'>Loading...</td></tr>}
            {!loading && filteredApps.length === 0 && <tr><td colSpan={5} className='px-4 py-10 text-center text-muted-foreground'>No apps found</td></tr>}
            {pagedApps.map(a => {
              const platform = a.storeId?.platform || '—'
              // Support user_id being either string or populated object
              const userRef = a.user_id
              const userObj = typeof userRef === 'string' ? users.find(u => u._id === userRef) : userRef
              const userName = userObj?.name || '—'
              const userEmail = userObj?.email || ''
              return (
                <tr key={a._id} className='border-t hover:bg-muted/30'>
                  <td className='px-4 py-2 max-w-[220px]'>
                    <div className='flex items-center gap-2'>
                      {a.appIcon && <img src={a.appIcon} alt={a.appName} className='h-6 w-6 rounded object-cover border' />}
                      <div className='font-medium truncate' title={a.appName}>{a.appName}</div>
                    </div>
                  </td>
                  <td className='px-4 py-2 font-mono text-xs truncate max-w-[180px]' title={a.appIdentifier}>{a.appIdentifier}</td>
                  <td className='px-4 py-2 capitalize'><PlatformBadge platform={platform} /></td>
                  <td className='px-4 py-2'>
                    {userName === '—' ? <span className='text-muted-foreground'>Unassigned</span> : <div className='flex flex-col leading-tight'><span className='font-medium truncate' title={userName}>{userName}</span><span className='text-[11px] text-muted-foreground truncate' title={userEmail}>{userEmail}</span></div>}
                  </td>
                  <td className='px-4 py-2'>
                    <div className='flex items-center justify-center gap-2'>
                      <Button size='icon' variant='outline' className='h-7 w-7 p-0' aria-label={userName === '—' ? 'Assign user' : 'Reassign user'} title={userName === '—' ? 'Assign user' : 'Reassign user'} disabled={savingAssign && selectedApp?._id === a._id} onClick={()=> { setSelectedApp(a); setAssignOpen(true) }}>
                        {savingAssign && selectedApp?._id === a._id ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : (userName === '—' ? <UserPlus className='h-3.5 w-3.5' /> : <UserCheck className='h-3.5 w-3.5' />)}
                      </Button>
                      <Button size='icon' variant='outline' className='h-7 w-7 p-0' aria-label='View details' title='View details' onClick={()=> setDetailApp(a)}>
                        <Eye className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <div>Page {page} / {totalPages} • {totalFiltered} result(s)</div>
        <div className='flex gap-2'>
          <Button size='sm' variant='outline' disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))}>Prev</Button>
          <Button size='sm' variant='outline' disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))}>Next</Button>
        </div>
      </div>

      {/* Create Modal */}
      {openCreate && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md rounded-lg border bg-background p-5 shadow-lg'>
            <h2 className='text-lg font-semibold mb-2 text-center'>Create App</h2>
            {/* Step Indicator (updated to default blue theme colors) */}
            <ol className='flex items-center justify-center gap-3 mb-5 text-[11px] font-medium'>
              {[1,2,3,4].map(step => {
                const active = step === createStep
                const done = step < createStep
                return (
                  <li key={step} className='flex items-center gap-3'>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center border transition-colors shadow-sm
                      ${active ? 'bg-primary text-primary-foreground border-primary' : done ? 'bg-blue-500 text-white border-blue-500' : 'bg-muted/40 text-muted-foreground border-muted'}
                    `}
                      aria-label={done ? `Step ${step} done` : `Step ${step} ${active ? 'active' : 'pending'}`}
                    >
                      {done ? <Check className='h-3.5 w-3.5' /> : step}
                    </div>
                    {step < 4 && <div className='h-px w-8 bg-border' />}
                  </li>
                )
              })}
            </ol>
            <div className='space-y-4 min-h-[240px]'>
              {createStep === 1 && (
                <div className='space-y-4 animate-in fade-in'>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>App Name *</label>
                    <input autoFocus className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newName} onChange={e=> setNewName(e.target.value)} placeholder='My Awesome App' />
                  </div>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Icon URL *</label>
                    <input className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newIcon} onChange={e=> setNewIcon(e.target.value)} placeholder='https://.../icon.png' />
                  </div>
                </div>
              )}
              {createStep === 2 && (
                <div className='space-y-4 animate-in fade-in'>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>App Identifier *</label>
                    <input autoFocus className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newIdentifier} onChange={e=> setNewIdentifier(e.target.value)} placeholder='com.company.app' />
                  </div>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>App URL *</label>
                    <input className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newUrl} onChange={e=> setNewUrl(e.target.value)} placeholder='https://example.com' />
                  </div>
                </div>
              )}
              {createStep === 3 && (
                <div className='space-y-4 animate-in fade-in'>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Select Store *</label>
                    <select autoFocus className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newStoreId} onChange={e=> setNewStoreId(e.target.value)}>
                      <option value=''>Choose store...</option>
                      {stores.map(s => <option key={s._id} value={s._id}>{s.name} ({s.platform})</option>)}
                    </select>
                  </div>
                </div>
              )}
              {createStep === 4 && (
                <div className='space-y-4 animate-in fade-in'>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Assign User (optional)</label>
                    <select autoFocus className='h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary' value={newUserId} onChange={e=> setNewUserId(e.target.value)}>
                      <option value=''>None</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                    <p className='text-[11px] text-muted-foreground mt-1'>You can leave this empty and assign later.</p>
                  </div>
                  <div className='rounded-md border p-3 text-xs space-y-1 bg-muted/30'>
                    <p className='font-medium'>Review</p>
                    <p><span className='text-muted-foreground'>Name:</span> {newName || '(missing)'}</p>
                    <p><span className='text-muted-foreground'>Identifier:</span> {newIdentifier || '(missing)'}</p>
                    <p><span className='text-muted-foreground'>Icon URL:</span> {newIcon || '(missing)'}</p>
                    <p><span className='text-muted-foreground'>App URL:</span> {newUrl || '(missing)'}</p>
                    <p><span className='text-muted-foreground'>Store:</span> {stores.find(s=> s._id===newStoreId)?.name || '(none)'}</p>
                    <p><span className='text-muted-foreground'>User:</span> {newUserId ? users.find(u=> u._id===newUserId)?.name : '—'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className='flex gap-2 pt-4'>
              <Button type='button' variant='outline' className='flex-1' disabled={creating} onClick={()=> { setOpenCreate(false); setCreateStep(1); setNewName(''); setNewIdentifier(''); setNewUrl(''); setNewIcon(''); setNewStoreId(''); setNewUserId('') }}>Cancel</Button>
              {createStep > 1 && (
                <Button type='button' variant='outline' className='flex-1' disabled={creating} onClick={()=> setCreateStep(s => s-1)}>Back</Button>
              )}
              {createStep < totalCreateSteps && (
                <Button type='button' className='flex-1' disabled={creating || (createStep===1 && (!newName || iconInvalid)) || (createStep===2 && (!newIdentifier || appUrlInvalid)) || (createStep===3 && !newStoreId)} onClick={()=> setCreateStep(s => s+1)}>
                  Next
                </Button>
              )}
              {createStep === totalCreateSteps && (
                <Button type='button' className='flex-1' disabled={creating || !newName || !newIdentifier || !newStoreId || iconInvalid || appUrlInvalid} onClick={handleCreate}>
                  {creating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                  Create
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailApp && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4'>
          <div className='w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg relative'>
            <h2 className='text-lg font-semibold mb-4 text-center'>App Details</h2>
            <div className='grid gap-4 sm:grid-cols-2 text-sm'>
              <div className='col-span-2 flex items-center gap-4'>
                {detailApp.appIcon ? (
                  <img src={detailApp.appIcon} alt={detailApp.appName} className='h-14 w-14 rounded object-cover border' />
                ) : (
                  <div className='h-14 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground'>No Icon</div>
                )}
                <div className='min-w-0'>
                  <p className='font-medium truncate' title={detailApp.appName}>{detailApp.appName}</p>
                  {detailApp.appUrl && <a href={detailApp.appUrl} target='_blank' rel='noopener noreferrer' className='text-primary text-xs hover:underline break-all'>{detailApp.appUrl}</a>}
                  {!detailApp.appUrl && <p className='text-muted-foreground text-xs'>(no URL)</p>}
                </div>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Identifier</p>
                <p className='font-mono text-xs break-all'>{detailApp.appIdentifier}</p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Platform</p>
                <p className='capitalize'><PlatformBadge platform={detailApp.storeId?.platform} /></p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Store</p>
                <p>{detailApp.storeId?.name || '—'}</p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Store Id</p>
                <p className='font-mono text-[11px] break-all'>{detailApp.storeId?._id || '—'}</p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>App Id</p>
                <p className='font-mono text-[11px] break-all'>{detailApp._id}</p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Created</p>
                <p>{new Date(detailApp.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Updated</p>
                <p>{new Date(detailApp.updatedAt).toLocaleString()}</p>
              </div>
              <div className='col-span-2'>
                <p className='text-[11px] uppercase text-muted-foreground mb-0.5'>Assigned User</p>
                {(() => {
                  const ref = detailApp.user_id
                  const userObj = typeof ref === 'string' ? users.find(u=> u._id===ref) : ref
                  if(!userObj) return <p className='text-muted-foreground text-sm'>Unassigned</p>
                  return <div className='text-sm'><p className='font-medium'>{userObj.name}</p><p className='text-muted-foreground text-xs'>{userObj.email}</p><p className='text-[11px] mt-1'>Role: {userObj.role}</p></div>
                })()}
              </div>
            </div>
            <div className='flex gap-2 pt-6'>
              <Button variant='outline' className='flex-1' onClick={()=> setDetailApp(null)}>Close</Button>
              <Button className='flex-1' variant='secondary' onClick={()=> { setSelectedApp(detailApp); setAssignOpen(true); setDetailApp(null) }}>Assign User</Button>
            </div>
          </div>
        </div>
      )}

      <AssignUserModal isOpen={assignOpen} onClose={()=> { setAssignOpen(false); setSelectedApp(null) }} app={selectedApp as any} onSubmit={handleAssignSubmit} />
    </div>
  )
}
