"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SendNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, message: string) => Promise<void>
  selectedAppCount: number
  platform: string
}

export function SendNotificationModal({
  isOpen,
  onClose,
  onSubmit,
  selectedAppCount,
  platform,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return

    setSubmitting(true)
    try {
      await onSubmit(title, message)
      toast.success("Gửi thông báo thành công", {
        description: `Thông báo "${title}" đã được gửi đến ${selectedAppCount} app(s).`,
      })
      setTitle("")
      setMessage("")
    } catch (e: any) {
      toast.error("Gửi thông báo thất bại", {
        description: e.message || "Send failed",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Send Notification</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform</label>
            <div className="px-3 py-2 rounded-md bg-muted text-sm capitalize">
              {platform === "all" ? "All Platforms" : platform}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Apps Selected</label>
            <div className="px-3 py-2 rounded-md bg-muted text-sm">{selectedAppCount} app(s)</div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notification Title *</label>
            <Input
              placeholder="e.g., New Feature Available"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={100}
              className="border-2 border-muted focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notification Content *</label>
            <textarea
              placeholder="e.g., Check out our latest features and improvements"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              maxLength={500}
              rows={4}
              className="w-full rounded-md border-2 border-muted bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{message.length}/500</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={submitting || !title.trim() || !message.trim()}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
