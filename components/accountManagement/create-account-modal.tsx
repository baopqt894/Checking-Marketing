"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, Loader2, Mail, Building } from "lucide-react"
import { toast } from "sonner"

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onAccountCreated: () => void
}

interface CreateAccountData {
  name: string
  email_private: string
  email_company: string
  isLeader: boolean
  appInfos: string[]
}

export function CreateAccountModal({ isOpen, onClose, onAccountCreated }: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountData>({
    name: "",
    email_private: "",
    email_company: "",
    isLeader: false,
    appInfos: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof CreateAccountData, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email_private || !formData.email_company) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create account")
      }

      toast.success("Account created successfully!")
      onAccountCreated()
      onClose()

      // Reset form
      setFormData({
        name: "",
        email_private: "",
        email_company: "",
        isLeader: false,
        appInfos: [],
      })
    } catch (error) {
      console.error("Failed to create account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create account")
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
            <Plus className="h-5 w-5" />
            Create New Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Account Information
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email_private" className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Private Email *
                    </Label>
                    <Input
                      id="email_private"
                      type="email"
                      value={formData.email_private}
                      onChange={(e) => handleInputChange("email_private", e.target.value)}
                      placeholder="personal@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email_company" className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      Company Email *
                    </Label>
                    <Input
                      id="email_company"
                      type="email"
                      value={formData.email_company}
                      onChange={(e) => handleInputChange("email_company", e.target.value)}
                      placeholder="work@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isLeader"
                    checked={formData.isLeader}
                    onCheckedChange={(checked) => handleInputChange("isLeader", checked)}
                  />
                  <Label htmlFor="isLeader">Admin Account</Label>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
