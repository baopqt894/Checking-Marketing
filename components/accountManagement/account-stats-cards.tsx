"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Crown, CheckCircle } from "lucide-react"

// Generic lightweight shape (works with current user objects)
interface UserLike {
  role?: string
  isActive?: boolean
}

interface UserStatsCardsProps {
  users: UserLike[]
}

export function UserStatsCards({ users }: UserStatsCardsProps) {
  const total = users.length
  const active = users.filter((u) => u.isActive !== false).length
  const admins = users.filter((u) => u.role === "admin").length

  const stats = [
    {
      title: "Total Users",
      value: total,
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: active,
      icon: CheckCircle,
      description: "Currently active",
    },
    {
      title: "Admins",
      value: admins,
      icon: Crown,
      description: "Users with admin role",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-muted/60 hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Backward compatibility export (deprecated)
// NOTE: Left for legacy code paths; can be removed once all usages migrate.
export const AccountStatsCards = ({ accounts }: { accounts: any[] }) => (
  <UserStatsCards users={accounts} />
)
