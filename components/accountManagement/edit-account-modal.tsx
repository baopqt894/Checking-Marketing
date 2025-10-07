"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Crown, Smartphone, Monitor, Minus, Plus } from "lucide-react"
import type { Account } from "@/types/account"
import type { PublisherApp } from "@/types/app"

// Local interface matching actual API response
interface ActualAppInfo {
  _id: string
  id: string
  Publisher_id: string
  account_id: string
  app: Array<{
    name: string
    appId: string
    platform: "ANDROID" | "IOS"
    appApprovalState: "APPROVED" | "ACTION_REQUIRED"
    manualAppInfo: {
      displayName: string
    }
    linkedAppInfo?: {
      displayName: string
      appStoreId: string
    }
  }>
  __v: number
}

interface EditAccountModalProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
  onAccountUpdated: () => void
}

export function EditAccountModal({ account, isOpen, onClose, onAccountUpdated }: EditAccountModalProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  const [formData, setFormData] = useState({
    name: "",
    email_private: "",
    email_company: "",
    isLeader: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        email_private: account.email_private || "",
        email_company: account.email_company || "",
        isLeader: account.isLeader || false,
      })
    }
  }, [account])

  const updateAccount = async (
    accountData: {
      name: string
      email_private: string
      email_company: string
      isLeader: boolean
    },
    accountId: string,
  ) => {
    try {
      const response = await fetch(`${apiUrl}accounts/${accountId}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) {
        throw new Error("Failed to update account")
      }

      console.log("Successfully updated account")
    } catch (error) {
      console.error("Error in updateAccount:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return

    setIsLoading(true)
    try {
      const accountData = {
        name: formData.name,
        email_private: formData.email_private,
        email_company: formData.email_company,
        isLeader: formData.isLeader,
      }

      await updateAccount(accountData, account.id)

      console.log("Successfully updated account information")
      toast.success("Account information updated successfully!")
      onAccountUpdated()
      onClose()
    } catch (error) {
      console.error("Error updating account:", error)
      toast.error("Failed to update account information")
    } finally {
      setIsLoading(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Account Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_private">Private Email</Label>
              <Input
                id="email_private"
                type="email"
                value={formData.email_private}
                onChange={(e) => setFormData((prev) => ({ ...prev, email_private: e.target.value }))}
                placeholder="personal@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_company">Company Email</Label>
              <Input
                id="email_company"
                type="email"
                value={formData.email_company}
                onChange={(e) => setFormData((prev) => ({ ...prev, email_company: e.target.value }))}
                placeholder="work@company.com"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isLeader"
                checked={formData.isLeader}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isLeader: checked }))}
              />
              <Label htmlFor="isLeader" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admin Role
              </Label>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Updating...
                </>
              ) : (
                "Update Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
