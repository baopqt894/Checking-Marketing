"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SendNotificationFormProps {
  onSubmit: (data: SendNotificationData) => void
  disabled: boolean
  onTitleChange?: (title: string) => void
  onMessageChange?: (message: string) => void
}

export interface SendNotificationData {
  title: string
  message: string
  sendType: "immediate" | "at" | "daily"
  date?: string
  hour?: number
}

export function SendNotificationForm({
  onSubmit,
  disabled,
  onTitleChange,
  onMessageChange,
}: SendNotificationFormProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [sendType, setSendType] = useState<"immediate" | "at" | "daily">("immediate")
  const [date, setDate] = useState("")
  const [hour, setHour] = useState(8)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    onTitleChange?.(value)
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    onMessageChange?.(value)
  }

  const handleSubmit = () => {
  if (title.trim() && message.trim()) {
    const data: SendNotificationData = {
      title,
      message,
      sendType,
    }

    if (sendType === "at" && date) {
      const [year, month, day] = date.split("-");
      data.date = `${day}/${month}/${year}`;
      data.hour = hour;
    } else if (sendType === "daily") {
      data.hour = hour;
    }

    onSubmit(data)
  }
}

  const isValid =
    title.trim() && message.trim() && (sendType === "immediate" || (sendType === "at" && date) || sendType === "daily")

  return (
    <div className="border border-border rounded-lg p-6 bg-card space-y-6">
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">Notification Title *</label>
        <Input
          placeholder="e.g., New Feature Available"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          maxLength={100}
          className="border-2 border-muted"
        />
        <p className="text-xs text-muted-foreground mt-2">{title.length}/100</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">Notification Content *</label>
        <textarea
          placeholder="e.g., Check out our latest features and improvements"
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          maxLength={500}
          rows={6}
          className="w-full rounded-md border-2 border-muted bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">{message.length}/500</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">Send Type *</label>
        <Tabs value={sendType} onValueChange={(v) => setSendType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="immediate">Send Now</TabsTrigger>
            <TabsTrigger value="at">Schedule Time</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {sendType === "at" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Date *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-muted"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Hour (0-23) *</label>
            <Input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(Number.parseInt(e.target.value) || 0)}
              className="border-2 border-muted"
            />
          </div>
        </div>
      )}

      {sendType === "daily" && (
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Hour (0-23) *</label>
          <Input
            type="number"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(Number.parseInt(e.target.value) || 0)}
            className="border-2 border-muted"
          />
        </div>
      )}

      <Button onClick={handleSubmit} disabled={disabled || !isValid} className="w-full gap-2" size="lg">
        <Send className="h-4 w-4" />
        {sendType === "immediate" ? "Send Now" : sendType === "at" ? "Schedule" : "Set Daily"}
      </Button>
    </div>
  )
}
