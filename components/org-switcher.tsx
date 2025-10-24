'use client';

import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

interface Tenant {
  id: string;
  name: string;
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch
}: {
  tenants: Tenant[];
  defaultTenant: Tenant;
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const [selectedTenant, setSelectedTenant] = React.useState<
    Tenant | undefined
  >(defaultTenant || (tenants.length > 0 ? tenants[0] : undefined));

  const handleTenantSwitch = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
  };

  if (!selectedTenant) {
    return null;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <img
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw2yXWeH54wjZ3pQnk-k9cCm7wvVNqvU1MIA&s'
                alt='Logo'
                className='h-10 w-10 border-2 border-gray-500 rounded-full'
              />

              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>Limgrow</span>
                <span className=''>tracking platform</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => handleTenantSwitch(tenant)}
              >
                {tenant.name}{' '}
                {tenant.id === selectedTenant.id && (
                  <Check className='ml-auto' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
