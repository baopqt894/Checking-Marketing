"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Loader2, Mail, User, Lock, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserInfo } from "@/lib/auth"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}

interface CreateUserData {
  name: string
  email: string
  password: string
  role: "admin" | "user"
  isActive: boolean
}

export function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    isActive: true, // Mặc định là active
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const userInfo = getUserInfo()
    if (userInfo && userInfo.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [isOpen])

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is admin
    if (!isAdmin) {
      toast.error("You don't have permission to create users")
      onClose()
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // Basic password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create user")
      }

      toast.success("User created successfully!")
      onUserCreated()
      onClose()

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
      })
    } catch (error) {
      console.error("Failed to create user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
        </DialogHeader>

        {!isAdmin ? (
          <div className="py-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have permission to create users. Only administrators can create new users.
                </p>
              </div>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") => handleInputChange("role", value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Admin users can create and manage other users
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
