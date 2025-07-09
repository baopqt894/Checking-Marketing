"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Crown, CheckCircle, Smartphone } from "lucide-react"
import type { Account } from "@/types/account"

interface AccountStatsCardsProps {
  accounts: Account[]
}

export function AccountStatsCards({ accounts }: AccountStatsCardsProps) {
  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter((account) => account.isActive).length
  const leaders = accounts.filter((account) => account.isLeader).length
  const totalApps = accounts.reduce((sum, account) => sum + (account.appInfos?.length || 0), 0)

  const stats = [
    {
      title: "Total Accounts",
      value: totalAccounts,
      icon: Users,
      description: "All registered accounts",
    },
    {
      title: "Active Accounts",
      value: activeAccounts,
      icon: CheckCircle,
      description: "Currently active accounts",
    },
    {
      title: "Leaders",
      value: leaders,
      icon: Crown,
      description: "Accounts with leader role",
    },
    {
      title: "Total Apps",
      value: totalApps,
      icon: Smartphone,
      description: "Apps across all accounts",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
