'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Home, LayoutDashboard, Smartphone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function DashboardSidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Apps', href: '/dashboard/apps', icon: Smartphone },
  ]

  return (
    <div className="h-full w-64 border-r bg-background hidden md:block">
      <div className="flex h-full flex-col gap-2">
        {/* Logo / Header */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span>AdMob Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User info */}
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Demo User</p>
              <p className="text-xs text-muted-foreground">demo@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
