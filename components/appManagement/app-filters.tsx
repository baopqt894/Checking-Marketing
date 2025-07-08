"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"

interface AppFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  platformFilter: string
  onPlatformFilterChange: (value: string) => void
  approvalFilter: string
  onApprovalFilterChange: (value: string) => void
  onRefresh: () => void
  isLoading: boolean
}

export function AppFilters({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  approvalFilter,
  onApprovalFilterChange,
  onRefresh,
  isLoading,
}: AppFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search apps by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Platforms</SelectItem>
          <SelectItem value="ANDROID">Android</SelectItem>
          <SelectItem value="IOS">iOS</SelectItem>
        </SelectContent>
      </Select>

      <Select value={approvalFilter} onValueChange={onApprovalFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="ACTION_REQUIRED">Action Required</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 bg-transparent"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  )
}
