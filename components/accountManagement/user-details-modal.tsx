"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shield, User as UserIcon, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"

interface User {
  _id: string
  googleId: string
  email: string
  name: string
  role: "admin" | "user"
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.role === "admin" ? (
              <Shield className="h-5 w-5 text-amber-500" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-base font-mono text-sm">{user._id}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Email
              </label>
              <p className="text-base">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {user.isActive !== false ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <Badge variant="secondary">Inactive</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{format(new Date(user.createdAt), "PPpp")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{format(new Date(user.updatedAt), "PPpp")}</p>
              </div>
            </div>
          </div>

          {/* Google ID */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Google Account</h4>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Google ID</label>
              <p className="text-sm font-mono">{user.googleId}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
