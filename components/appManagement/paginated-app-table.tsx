"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ExternalLink, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import { usePagination } from "@/hooks/use-pagination"
import type { ProcessedApp } from "@/types/app"

interface PaginatedAppTableProps {
  apps: ProcessedApp[]
  onViewDetails?: (app: ProcessedApp) => void
  title?: string
  emptyMessage?: string
}

export function PaginatedAppTable({ apps, onViewDetails, title, emptyMessage }: PaginatedAppTableProps) {
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
  } = usePagination({ data: apps, itemsPerPage: 10 })

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <AlertCircle className="w-3 h-3 mr-1" />
        Action Required
      </Badge>
    )
  }

  const getPlatformBadge = (platform: string) => {
    const isAndroid = platform === "ANDROID"
    return (
      <Badge variant="outline" className={isAndroid ? "text-green-600" : "text-blue-600"}>
        <Smartphone className="w-3 h-3 mr-1" />
        {platform}
      </Badge>
    )
  }

  const openAppStore = (app: ProcessedApp) => {
    if (app.linkedAppInfo?.appStoreId) {
      const url =
        app.platform === "ANDROID"
          ? `https://play.google.com/store/apps/details?id=${app.linkedAppInfo.appStoreId}`
          : `https://apps.apple.com/app/id${app.linkedAppInfo.appStoreId}`
      window.open(url, "_blank")
    }
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
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
      // Show first page
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

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show pages around current page
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

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show last page
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

  if (apps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No apps found</h3>
          <p className="text-muted-foreground text-center">
            {emptyMessage || "No apps match your current filters. Try adjusting your search criteria."}
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
              <Smartphone className="h-5 w-5" />
              {title || `Apps (${totalItems})`}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex}-{endIndex} of {totalItems} apps
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">App Name</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publisher ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((app) => (
                <TableRow key={app._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{app.displayName}</span>
                      {app.linkedAppInfo && app.linkedAppInfo.displayName !== app.displayName && (
                        <span className="text-xs text-muted-foreground">Store: {app.linkedAppInfo.displayName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{app.appId}</code>
                  </TableCell>
                  <TableCell>{getPlatformBadge(app.platform)}</TableCell>
                  <TableCell>{getStatusBadge(app.approvalState)}</TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground">{app.publisherId}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {app.linkedAppInfo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAppStore(app)}
                          className="h-8 w-8 p-0"
                          title="View in App Store"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {onViewDetails && (
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(app)}>
                          View Details
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
            Page {currentPage} of {totalPages} ({totalItems} total apps)
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
