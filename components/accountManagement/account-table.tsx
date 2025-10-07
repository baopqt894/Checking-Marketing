"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Crown, CheckCircle, XCircle, Eye, Edit, Trash2, Mail, Building, Smartphone } from "lucide-react"
import { usePagination } from "@/hooks/use-pagination"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Account } from "@/types/account"

interface AccountTableProps {
  accounts: Account[]
  onViewDetails?: (account: Account) => void
  onEditAccount?: (account: Account) => void
  onDeleteAccount?: (account: Account) => void
}

export function AccountTable({ accounts, onViewDetails, onEditAccount, onDeleteAccount }: AccountTableProps) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: accounts, itemsPerPage: 10 })

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                goToPage(i)
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              goToPage(1)
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                goToPage(i)
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                goToPage(totalPages)
              }}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    }

    return items
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
          <p className="text-muted-foreground text-center">
            No accounts match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Accounts ({totalItems})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex}-{endIndex} of {totalItems} accounts
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Account Info</TableHead>
                <TableHead>Email Addresses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Apps</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-xs text-muted-foreground">ID: {(account._id || account.id)?.slice(-8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{account.email_private}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{account.email_company}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(account.isActive)}</TableCell>
                  <TableCell>
                    {account.isLeader ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Leader
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600">
                        Member
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{account.appInfos?.length || 0} apps</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(account.created_at)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(account)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEditAccount && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditAccount(account)}
                          className="h-8 w-8 p-0"
                          title="Edit Account"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDeleteAccount && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteAccount(account)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalItems} total accounts)
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goToPreviousPage()
                  }}
                  className={!canGoPrevious ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goToNextPage()
                  }}
                  className={!canGoNext ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
