"use client"

import { useEffect, useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"

import { toast } from "sonner"
import type { Account } from "@/types/account"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountStatsCards } from "@/components/accountManagement/account-stats-cards"
import { AccountFilters } from "@/components/accountManagement/account-filters"
import { AccountTable } from "@/components/accountManagement/account-table"
import { AccountDetailsModal } from "@/components/accountManagement/account-details-modal"
import { CreateAccountModal } from "@/components/accountManagement/create-account-modal"
import { EditAccountModal } from "@/components/accountManagement/edit-account-modal"
import { DeleteAccountDialog } from "@/components/accountManagement/delete-account-dialog"

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [leaderFilter, setLeaderFilter] = useState("all")

  // Modal states
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

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

      const matchesLeader =
        leaderFilter === "all" ||
        (leaderFilter === "leader" && account.isLeader) ||
        (leaderFilter === "member" && !account.isLeader)

      return matchesSearch && matchesStatus && matchesLeader
    })
  }, [accounts, searchTerm, statusFilter, leaderFilter])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}accounts`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Account[] = await response.json()
      setAccounts(Array.isArray(data) ? data : [data])
      toast.success(
        `Loaded ${Array.isArray(data) ? data.length : 1} account${Array.isArray(data) && data.length !== 1 ? "s" : ""}`,
      )
    } catch (err) {
      console.error("Failed to fetch accounts:", err)
      toast.error("Failed to fetch accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    setShowCreateModal(true)
  }

  const handleEditAccount = (account: Account) => {
    setAccountToEdit(account)
    setShowEditModal(true)
  }

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account)
    setShowDeleteDialog(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setAccountToEdit(null)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setAccountToDelete(null)
  }

  const handleAccountCreated = () => {
    fetchAccounts()
  }

  const handleAccountUpdated = () => {
    fetchAccounts()
  }

  const handleAccountDeleted = () => {
    fetchAccounts()
  }

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedAccount(null)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Account Management"
        description="Manage and monitor your AdMob accounts and associated tokens"
      />
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
        leaderFilter={leaderFilter}
        onLeaderFilterChange={setLeaderFilter}
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
        <AccountTable
          accounts={filteredAccounts}
          onViewDetails={handleViewDetails}
          onEditAccount={handleEditAccount}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      <AccountDetailsModal account={selectedAccount} isOpen={showDetailsModal} onClose={handleCloseDetailsModal} />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onAccountCreated={handleAccountCreated}
      />

      <EditAccountModal
        account={accountToEdit}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onAccountUpdated={handleAccountUpdated}
      />

      <DeleteAccountDialog
        account={accountToDelete}
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  )
}
