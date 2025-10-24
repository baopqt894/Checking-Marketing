import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703';

export interface AppInfo {
  _id: string;
  appId: string;
  displayName: string;
  platform: string;
  approvalState?: string;
  users?: string[]; // Array of user IDs assigned to this app
  publisherId?: string;
  createdAt?: string;
  updatedAt?: string;
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getAccessToken();
  
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const AppInfoService = {
  /**
   * Get apps for a specific user (user role)
   */
  getUserApps: async (userId: string): Promise<AppInfo[]> => {
    return apiRequest(`app-info/user/${userId}`);
  },

  /**
   * Get all apps (admin role)
   */
  getAllApps: async (): Promise<AppInfo[]> => {
    return apiRequest('app-info');
  },

  /**
   * Update an app (admin only)
   */
  updateApp: async (appId: string, data: Partial<AppInfo>): Promise<AppInfo> => {
    return apiRequest(`app-info/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Assign users to an app (admin only)
   */
  assignUsersToApp: async (appId: string, userIds: string[]): Promise<AppInfo> => {
    return apiRequest(`app-info/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ users: userIds })
    });
  }
};
