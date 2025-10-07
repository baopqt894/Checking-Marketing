"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, User as UserIcon, Eye, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"

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

interface UserTableProps {
  users: User[]
  onViewDetails?: (user: User) => void
  onEditAccount?: (user: User) => void
  onDeleteAccount?: (user: User) => void
}

export function UserTable({ users, onViewDetails, onEditAccount, onDeleteAccount }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No users found</p>
        <p className="text-sm">Users will appear here once they are created</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
            {(onViewDetails || onEditAccount || onDeleteAccount) && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.role === "admin" ? (
                    <Shield className="h-4 w-4 text-amber-500" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">ID: {user._id.slice(-8)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive !== false ? "default" : "secondary"} className={user.isActive !== false ? "bg-green-500" : ""}>
                  {user.isActive !== false ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(user.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(user.updatedAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              {(onViewDetails || onEditAccount || onDeleteAccount) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEditAccount && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAccount(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteAccount && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAccount(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
