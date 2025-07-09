"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Crown, Mail, Building, Smartphone } from "lucide-react"
import { toast } from "sonner"
import type { Account } from "@/types/account"

interface DeleteAccountDialogProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
  onAccountDeleted: () => void
}

export function DeleteAccountDialog({ account, isOpen, onClose, onAccountDeleted }: DeleteAccountDialogProps) {
  if (!account) return null

  const handleDelete = async () => {
    try {
      // API call would go here
      console.log("Deleting account:", account.id)

      toast.success("Account deleted successfully!")
      onAccountDeleted()
      onClose()
    } catch (error) {
      toast.error("Failed to delete account")
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Are you sure you want to delete this account? This action cannot be undone.</p>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{account.name}</h4>
                  {account.isLeader && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{account.email_private}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span>{account.email_company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                    <span>{account.appInfos?.length || 0} apps configured</span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
