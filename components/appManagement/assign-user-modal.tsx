"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, User } from "lucide-react"
import { toast } from "sonner"
import type { AppInfo } from "@/lib/appInfoService"
import { getAccessToken } from "@/lib/auth"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface AssignUserModalProps {
  isOpen: boolean
  onClose: () => void
  app: AppInfo | (any & { user_id?: any }) | null
  onSubmit: (userIds: string[]) => Promise<void>
}

export function AssignUserModal({ isOpen, onClose, app, onSubmit }: AssignUserModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Derive currently assigned user id (supports both schemas: users[] or user_id)
  const currentAssignedUserId = useMemo(() => {
    if (!app) return null
    // If shape has users array (legacy multi)
    if (Array.isArray((app as any).users) && (app as any).users.length > 0) return (app as any).users[0] as string
    // If shape has user_id which may be string or object
    const u = (app as any).user_id
    if (!u) return null
    if (typeof u === 'string') return u
    if (typeof u === 'object' && u._id) return u._id as string
    return null
  }, [app])

  useEffect(() => {
    if (isOpen && app) {
      loadUsers()
      setSelectedUserId(currentAssignedUserId)
    }
  }, [isOpen, app, currentAssignedUserId])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703/').replace(/([^/])$/,'$1/')
      const token = getAccessToken()
      if(!token) throw new Error('Missing access token')
      const response = await fetch(`${apiBase}users`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(selectedUserId ? [selectedUserId] : [])
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setSelectedUserId(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign User to App</DialogTitle>
          <DialogDescription>
            {app ? (
              <>Select a user to assign to <strong>{(app as any).displayName || (app as any).appName}</strong></>
            ) : (
              'Loading...'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div role="radiogroup" className="space-y-2">
                {/* None option */}
                <div
                  role="radio"
                  aria-checked={selectedUserId === null}
                  tabIndex={0}
                  onClick={() => setSelectedUserId(null)}
                  onKeyDown={(e) => { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); setSelectedUserId(null) } }}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                  ${selectedUserId === null ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}
                  `}
                >
                  <RadioVisual selected={selectedUserId === null} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-none">No User</p>
                    <p className="text-xs text-muted-foreground">Leave unassigned</p>
                  </div>
                </div>
                {users.map((user) => {
                  const selected = selectedUserId === user._id
                  const previouslyAssigned = currentAssignedUserId === user._id
                  return (
                    <div
                      key={user._id}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                      ${selected ? 'border-primary bg-primary/5' : previouslyAssigned ? 'border-primary/60 bg-primary/5' : 'border-border'}
                      hover:bg-muted/40`}
                      onClick={() => setSelectedUserId(user._id)}
                      onKeyDown={(e) => { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); setSelectedUserId(user._id) } }}
                    >
                      <RadioVisual selected={selected} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      {user.role === 'admin' && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {!loading && users.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Selected: {selectedUserId ? 1 : 0} user
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Simple visual radio control (headless)
function RadioVisual({ selected }: { selected: boolean }) {
  return (
    <span className={`relative h-4 w-4 rounded-full border flex items-center justify-center
      ${selected ? 'border-primary' : 'border-muted-foreground/30'}`}>
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
    </span>
  )
}
