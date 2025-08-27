"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Token } from "@/types/token"

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
    access_token: "",
    refresh_token: "",
    email: "",
    google_client_id: "",
    google_client_secret: "",
    google_redirect_uri: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (token) {
      setFormData({
        access_token: token.access_token || "",
        refresh_token: token.refresh_token || "",
        email: token.email || "",
        google_client_id: token.google_client_id || "",
        google_client_secret: token.google_client_secret || "",
        google_redirect_uri: token.google_redirect_uri || "",
      })
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

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

    if (!formData.access_token?.trim()) {
      newErrors.access_token = "Access Token is required"
    }

    if (!formData.refresh_token?.trim()) {
      newErrors.refresh_token = "Refresh Token is required"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || "https://checking-marketing-api.onrender.com"

      const response = await fetch(`${apiUrl}tokens/save-token`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: formData.access_token,
          refresh_token: formData.refresh_token,
          email: formData.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)

        if (errorData.message && Array.isArray(errorData.message)) {
          const newErrors: Record<string, string> = {}
          errorData.message.forEach((msg: string) => {
            if (msg.includes("access_token")) {
              newErrors.access_token = msg
            } else if (msg.includes("refresh_token")) {
              newErrors.refresh_token = msg
            } else if (msg.includes("email")) {
              newErrors.email = msg
            }
          })
          setErrors(newErrors)
        }
        return
      }

      const result = await response.json()
      console.log("Token saved successfully:", result)

      if (token?.id) {
        onSubmit(token.id, {
          google_client_id: formData.google_client_id,
          google_client_secret: formData.google_client_secret,
          google_redirect_uri: formData.google_redirect_uri,
        })
      }

      onClose()
    } catch (error) {
      console.error("Failed to save token:", error)
      setErrors({ general: "Failed to save token. Please try again." })
    } finally {
      setIsLoading(false)
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              name="access_token"
              type="password"
              placeholder="Enter access token"
              value={formData.access_token}
              onChange={handleChange}
              className={errors.access_token ? "border-red-500" : ""}
            />
            {errors.access_token && <p className="text-sm text-red-500">{errors.access_token}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh_token">Refresh Token</Label>
            <Input
              id="refresh_token"
              name="refresh_token"
              type="password"
              placeholder="Enter refresh token"
              value={formData.refresh_token}
              onChange={handleChange}
              className={errors.refresh_token ? "border-red-500" : ""}
            />
            {errors.refresh_token && <p className="text-sm text-red-500">{errors.refresh_token}</p>}
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
            {errors.general && <p className="text-sm text-red-500 w-full">{errors.general}</p>}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
