"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ConfirmSendModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  selectedAppCount: number
  isLoading: boolean
}

export function ConfirmSendModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  selectedAppCount,
  isLoading,
}: ConfirmSendModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Confirm Send</h2>
          <button onClick={onClose} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-foreground">
            Send notification <strong>"{title}"</strong> to <strong>{selectedAppCount} app(s)</strong>?
          </p>
          <p className="text-xs text-muted-foreground italic">"{message}"</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Sending..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  )
}
