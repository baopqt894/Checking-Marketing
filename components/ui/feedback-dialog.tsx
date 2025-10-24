"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle } from "lucide-react"
import React from "react"

export interface FeedbackDialogProps {
  open: boolean
  type: "success" | "error"
  title?: string
  message?: string
  onClose: () => void
  /** Optional action label (defaults to OK) */
  actionLabel?: string
}

export function FeedbackDialog({ open, type, title, message, onClose, actionLabel }: FeedbackDialogProps) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle2 : AlertCircle
  return (
    <Dialog open={open} onOpenChange={(v)=> { if(!v) onClose() }}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${isSuccess ? 'text-green-500' : 'text-destructive'}`} />
            <DialogTitle className="text-base font-semibold">{title || (isSuccess ? 'Thành công' : 'Lỗi')}</DialogTitle>
          </div>
          {message && <DialogDescription className="pt-1 leading-relaxed">{message}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button autoFocus onClick={onClose}>{actionLabel || 'OK'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
