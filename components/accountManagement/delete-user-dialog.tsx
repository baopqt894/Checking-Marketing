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
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { getAccessToken } from "@/lib/auth"

interface User {
  _id: string
  googleId: string
  email: string
  name: string
  role: "admin" | "user"
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

interface DeleteUserDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onUserDeleted: () => void
}

export function DeleteUserDialog({ user, isOpen, onClose, onUserDeleted }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const accessToken = getAccessToken()
      
      if (!accessToken) {
        throw new Error("No access token found")
      }

      const response = await fetch(`${apiUrl}users/${user._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete user")
      }

      toast.success("User deleted successfully!")
      onUserDeleted()
      onClose()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user{" "}
            <span className="font-semibold">{user.name}</span> ({user.email}) from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
