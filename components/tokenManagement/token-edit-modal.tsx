"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Token } from "@/types/token"


interface TokenEditModalProps {
  isOpen: boolean
  token: Token | null
  onClose: () => void
  onSubmit: (
    id: string,
    data: {
      google_client_id: string
      google_client_secret: string
      google_redirect_uri: string
    },
  ) => void
}

export default function TokenEditModal({ isOpen, token, onClose, onSubmit }: TokenEditModalProps) {
  const [formData, setFormData] = useState({
    google_client_id: "",
    google_client_secret: "",
    google_redirect_uri: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (token) {
      setFormData({
        google_client_id: token.google_client_id || "",
        google_client_secret: token.google_client_secret || "",
        google_redirect_uri: token.google_redirect_uri || "",
      })
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.google_client_id?.trim()) {
      newErrors.google_client_id = "Google Client ID is required"
    }

    if (!formData.google_client_secret?.trim()) {
      newErrors.google_client_secret = "Google Client Secret is required"
    }

    if (!formData.google_redirect_uri?.trim()) {
      newErrors.google_redirect_uri = "Redirect URI is required"
    } else if (!/^https?:\/\//.test(formData.google_redirect_uri)) {
      newErrors.google_redirect_uri = "Redirect URI must be a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm() && token?.id) {
      onSubmit(token.id, formData)
    }
  }

  if (!token) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Google API Keys</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <div className="p-2 border rounded-md bg-muted/50">{token.email}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_client_id">Google Client ID</Label>
            <Input
              id="google_client_id"
              name="google_client_id"
              placeholder="1234567890-abcde.apps.googleusercontent.com"
              value={formData.google_client_id}
              onChange={handleChange}
              className={errors.google_client_id ? "border-red-500" : ""}
            />
            {errors.google_client_id && <p className="text-sm text-red-500">{errors.google_client_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_client_secret">Google Client Secret</Label>
            <Input
              id="google_client_secret"
              name="google_client_secret"
              type="password"
              placeholder="GOCSPX-abc123_secret_key"
              value={formData.google_client_secret}
              onChange={handleChange}
              className={errors.google_client_secret ? "border-red-500" : ""}
            />
            {errors.google_client_secret && <p className="text-sm text-red-500">{errors.google_client_secret}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_redirect_uri">Redirect URI</Label>
            <Input
              id="google_redirect_uri"
              name="google_redirect_uri"
              placeholder="https://yourapp.com/auth/google/callback"
              value={formData.google_redirect_uri}
              onChange={handleChange}
              className={errors.google_redirect_uri ? "border-red-500" : ""}
            />
            {errors.google_redirect_uri && <p className="text-sm text-red-500">{errors.google_redirect_uri}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
