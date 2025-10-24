import { useEffect, useState, useCallback } from 'react';
import { AppInfoService, AppInfo } from '@/lib/appInfoService';

interface UseAppsOptions {
  userId?: string;
  isAdmin: boolean;
  autoLoad?: boolean;
}

export function useAppInfo({ userId, isAdmin, autoLoad = true }: UseAppsOptions) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    if (!isAdmin && !userId) {
      setError('User ID is required for non-admin users');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = isAdmin 
        ? await AppInfoService.getAllApps() 
        : await AppInfoService.getUserApps(userId!);
      
      setApps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load apps');
      console.error('Error loading apps:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    if (autoLoad) {
      loadApps();
    }
  }, [loadApps, autoLoad]);

  const assignUsers = useCallback(async (appId: string, userIds: string[]) => {
    if (!isAdmin) {
      throw new Error('Only admins can assign users to apps');
    }

    try {
      const updatedApp = await AppInfoService.assignUsersToApp(appId, userIds);
      
      // Update local state
      setApps(prev => 
        prev.map(app => app._id === appId ? updatedApp : app)
      );
      
      return updatedApp;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to assign users');
    }
  }, [isAdmin]);

  const updateApp = useCallback(async (appId: string, data: Partial<AppInfo>) => {
    if (!isAdmin) {
      throw new Error('Only admins can update apps');
    }

    try {
      const updatedApp = await AppInfoService.updateApp(appId, data);
      
      // Update local state
      setApps(prev => 
        prev.map(app => app._id === appId ? updatedApp : app)
      );
      
      return updatedApp;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update app');
    }
  }, [isAdmin]);

  return {
    apps,
    loading,
    error,
    reload: loadApps,
    assignUsers,
    updateApp
  };
}
