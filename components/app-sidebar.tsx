"use client"

import * as React from "react"
import {
    BarChart3,
  BookOpen,
  Bot,
  Command,
  Frame,
  LayoutDashboard,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  Smartphone,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"


import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavProjects } from "./nav-project"
import { NavSecondary } from "./nav-secondary"
import Image from "next/image"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Apps",
      url: "/dashboard/apps",
      icon: Smartphone,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image 
                    src="/logo.webp"
                    alt="Fox Code Studio"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg"
                    />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Fox Code Studio</span>
                  <span className="truncate text-xs">Backend Team</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
