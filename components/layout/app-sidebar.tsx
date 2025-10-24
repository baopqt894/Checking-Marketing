'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems, adminConfigItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle,
  IconSettings,
  IconUsers,
  IconKey,
  IconApps,
  IconUserEdit
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { getUserInfo } from "@/lib/auth"
export const company = {
  name: 'Limgrow Tracking',
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw2yXWeH54wjZ3pQnk-k9cCm7wvVNqvU1MIA&s",
  plan: 'Enterprise'
};

const tenants = [
  { id: '1', name: 'Acme Inc' },
  { id: '2', name: 'Beta Corp' },
  { id: '3', name: 'Gamma Ltd' }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const router = useRouter();
  const { user } = useAuth();
  const info = getUserInfo()
  const isAdmin = info?.role === 'admin'
  
  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  const handleLogout = () => {
    // Clear all authentication data using utility function
    logout()
    
    // Redirect to login page
    router.push("/")
  };

  const activeTenant = tenants[0];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            {/* CONFIG GROUP (admin only) */}
            {isAdmin && (
              <Collapsible
                asChild
                key='config'
                defaultOpen={['/dashboard/users','/dashboard/tokens','/dashboard/apps','/dashboard/assign-app'].some(p=> pathname.startsWith(p))}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip='Configuration'
                      isActive={['/dashboard/users','/dashboard/tokens','/dashboard/apps','/dashboard/assign-app'].some(p=> pathname.startsWith(p))}
                    >
                      <IconSettings />
                      <span>Config</span>
                      <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Users */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/accounts')}
                        >
                          <Link href='/dashboard/users'>
                            <IconUsers className='mr-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-mute-foreground hover:text-white' />
                            <span>Users</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {/* Store */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith('/dashboard/store')}
                        >
                          <Link href='/dashboard/store'>
                            <IconKey className='mr-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-mute-foreground hover:text-white' />
                            <span>Store</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {/* App Management */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith('/dashboard/app-management')}
                        >
                          <Link href='/dashboard/app-management'>
                            <IconUserEdit className='mr-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-mute-foreground hover:text-white' />
                            <span>App Management</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {/* Assign Apps (new) */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith('/dashboard/assign-app')}
                        >
                          <Link href='/dashboard/assign-app'>
                            <IconApps className='mr-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-mute-foreground hover:text-white' />
                            <span>Assign Apps</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith('/dashboard/notification')}
                        >
                          <Link href='/dashboard/notification'>
                            <IconBell className='mr-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-mute-foreground hover:text-white' />
                            <span>Notifications</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}
            {/* Removed standalone Users item */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src='/placeholder.svg' alt={user?.name || 'User'} />
                    <AvatarFallback className='rounded-lg'>
                      {user?.name?.slice(0, 2)?.toUpperCase() || user?.email?.slice(0, 2)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{user?.name || 'User'}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCreditCard className='mr-2 h-4 w-4' />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBell className='mr-2 h-4 w-4' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <IconLogout className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
