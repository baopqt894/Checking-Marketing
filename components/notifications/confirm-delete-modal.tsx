"use client"

import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  isLoading: boolean
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, isLoading }: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Delete Notification</h2>
          <button onClick={onClose} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Are you sure?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Delete notification <strong>"{title}"</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
