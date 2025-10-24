"use client"

import { useEffect, useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserStatsCards } from "@/components/accountManagement/account-stats-cards"
import { UserDetailsModal } from "@/components/accountManagement/user-details-modal"
import { CreateUserModal } from "@/components/accountManagement/create-user-modal"
import { EditUserModal } from "@/components/accountManagement/edit-user-modal"
import { DeleteUserDialog } from "@/components/accountManagement/delete-user-dialog"
import { UserTable } from "@/components/accountManagement/user-table"
import { getUserInfo, getAccessToken } from "@/lib/auth"

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

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && u.role === "admin") ||
        (roleFilter === "user" && u.role === "user")

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const token = getAccessToken()
      if (!token) throw new Error("No token")
      const res = await fetch(`${apiUrl}users`, {
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: User[] = await res.json()
      setUsers(Array.isArray(data) ? data : [data])
    } catch (e) {
      console.error(e)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // Handlers
  const handleCreateUser = () => setShowCreateUserModal(true)
  const handleViewDetails = (user: User) => { setSelectedUser(user); setShowDetailsModal(true) }
  const handleEditUser = (user: User) => { setUserToEdit(user); setShowEditModal(true) }
  const handleDeleteUser = (user: User) => { setUserToDelete(user); setShowDeleteDialog(true) }

  const closeDetails = () => { setShowDetailsModal(false); setSelectedUser(null) }
  const closeCreate = () => setShowCreateUserModal(false)
  const closeEdit = () => { setShowEditModal(false); setUserToEdit(null) }
  const closeDelete = () => { setShowDeleteDialog(false); setUserToDelete(null) }

  const refreshAfterMutation = () => fetchUsers()

  useEffect(() => {
    const info = getUserInfo()
    if (info?.role === "admin") {
      setIsAdmin(true)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [isAdmin])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="User Management"
        description="Administer platform users"
      />

      {!isAdmin && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          You are not authorized to view this page.
        </div>
      )}

      {isAdmin && (
        <>
          <UserStatsCards users={users} />

          <div className="flex flex-wrap items-end gap-4 mt-2">
            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
              <input
                className="h-10 w-full rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
              <select
                className="h-10 rounded-md border-2 border-muted bg-background px-3 text-sm outline-none focus:border-primary"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <Button onClick={fetchUsers} variant="outline" disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button onClick={handleCreateUser} className="ml-auto flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
              Loading users...
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onViewDetails={handleViewDetails}
              onEditAccount={handleEditUser}
              onDeleteAccount={handleDeleteUser}
            />
          )}
        </>
      )}

      <UserDetailsModal user={selectedUser} isOpen={showDetailsModal} onClose={closeDetails} />
      <CreateUserModal isOpen={showCreateUserModal} onClose={closeCreate} onUserCreated={refreshAfterMutation} />
      <EditUserModal user={userToEdit} isOpen={showEditModal} onClose={closeEdit} onUserUpdated={refreshAfterMutation} />
      <DeleteUserDialog user={userToDelete} isOpen={showDeleteDialog} onClose={closeDelete} onUserDeleted={refreshAfterMutation} />
    </div>
  )
}
