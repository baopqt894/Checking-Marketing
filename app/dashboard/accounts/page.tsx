"use client"

import { useEffect, useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"

import { toast } from "sonner"
import type { Account } from "@/types/account"

import { Plus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountStatsCards } from "@/components/accountManagement/account-stats-cards"
import { AccountFilters } from "@/components/accountManagement/account-filters"
import { AccountTable } from "@/components/accountManagement/account-table"
import { UserDetailsModal } from "@/components/accountManagement/user-details-modal"
import { CreateAccountModal } from "@/components/accountManagement/create-account-modal"
import { CreateUserModal } from "@/components/accountManagement/create-user-modal"
import { EditUserModal } from "@/components/accountManagement/edit-user-modal"
import { DeleteUserDialog } from "@/components/accountManagement/delete-user-dialog"
import { UserTable } from "@/components/accountManagement/user-table"
import { getUserInfo, getAccessToken } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"

interface User {
  _id: string
  googleId: string
  email: string
  name: string
  role: "admin" | "user"
  isActive?: boolean
  createdAt: string
  updatedAt: string
  __v?: number
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [usersLoading, setUsersLoading] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email_private.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email_company.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && account.isActive) ||
        (statusFilter === "inactive" && !account.isActive)

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "leader" && account.isLeader) ||
        (roleFilter === "member" && !account.isLeader)

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [accounts, searchTerm, statusFilter, roleFilter])

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && user.role === "admin") ||
        (roleFilter === "user" && user.role === "user")

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const accessToken = getAccessToken()
      
      if (!accessToken) {
        throw new Error("No access token found")
      }

      const response = await fetch(`${apiUrl}users`, {
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: User[] = await response.json()
      // Store users in both accounts and users state for backwards compatibility
      setAccounts(data as any)
      setUsers(Array.isArray(data) ? data : [data])
      toast.success(
        `Loaded ${Array.isArray(data) ? data.length : 1} user${Array.isArray(data) && data.length !== 1 ? "s" : ""}`,
      )
    } catch (err) {
      console.error("Failed to fetch users:", err)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const accessToken = getAccessToken()
      
      if (!accessToken) {
        throw new Error("No access token found")
      }

      const response = await fetch(`${apiUrl}users`, {
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: User[] = await response.json()
      setUsers(Array.isArray(data) ? data : [data])
      toast.success(`Loaded ${data.length} user${data.length !== 1 ? "s" : ""}`)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      toast.error("Failed to fetch users")
    } finally {
      setUsersLoading(false)
    }
  }

  const handleCreateAccount = () => {
    setShowCreateModal(true)
  }

  const handleCreateUser = () => {
    setShowCreateUserModal(true)
  }

  const handleEditAccount = (user: User) => {
    setUserToEdit(user)
    setShowEditModal(true)
  }

  const handleDeleteAccount = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseCreateUserModal = () => {
    setShowCreateUserModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setUserToEdit(null)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setUserToDelete(null)
  }

  const handleAccountCreated = () => {
    fetchAccounts()
  }

  const handleUserCreated = () => {
    // Refresh users list after creation
    fetchUsers()
    toast.success("User created successfully")
  }

  const handleAccountUpdated = () => {
    fetchAccounts()
  }

  const handleAccountDeleted = () => {
    fetchAccounts()
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedUser(null)
  }

  useEffect(() => {
    fetchAccounts()
    
    // Check if user is admin from cookie
    const userInfo = getUserInfo()
    if (userInfo && userInfo.role === "admin") {
      setIsAdmin(true)
      // Fetch users if admin
      fetchUsers()
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Account Management"
        description="Manage and monitor your AdMob accounts and associated tokens"
      />

      {isAdmin ? (
        <Tabs defaultValue="accounts" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={handleCreateAccount} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Account
              </Button>
              <Button onClick={handleCreateUser} variant="secondary" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>

          <TabsContent value="accounts" className="space-y-6">
            <AccountStatsCards accounts={accounts} />

            <AccountFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              leaderFilter={roleFilter}
              onLeaderFilterChange={setRoleFilter}
              onRefresh={fetchAccounts}
              isLoading={loading}
            />

            {loading ? (
              <div className="text-center text-muted-foreground py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Loading Accounts</h3>
                <p className="text-sm">Fetching account data...</p>
              </div>
            ) : (
              <UserTable 
                users={filteredAccounts as any}
                onViewDetails={handleViewDetails}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {usersLoading ? (
              <div className="text-center text-muted-foreground py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Loading Users</h3>
                <p className="text-sm">Fetching user data...</p>
              </div>
            ) : (
              <UserTable users={filteredUsers} />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className="mb-4">
            <Button onClick={handleCreateAccount} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Account
            </Button>
          </div>

          <AccountStatsCards accounts={accounts} />

          <AccountFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            leaderFilter={roleFilter}
            onLeaderFilterChange={setRoleFilter}
            onRefresh={fetchAccounts}
            isLoading={loading}
          />

          {loading ? (
            <div className="text-center text-muted-foreground py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading Accounts</h3>
              <p className="text-sm">Fetching account data...</p>
            </div>
          ) : (
            <UserTable 
              users={filteredAccounts as any}
              onViewDetails={handleViewDetails}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </>
      )}

      <UserDetailsModal user={selectedUser} isOpen={showDetailsModal} onClose={handleCloseDetailsModal} />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onAccountCreated={handleAccountCreated}
      />

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={handleCloseCreateUserModal}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        user={userToEdit}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUserUpdated={handleAccountUpdated}
      />

      <DeleteUserDialog
        user={userToDelete}
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onUserDeleted={handleAccountDeleted}
      />
    </div>
  )
}
