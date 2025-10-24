import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703';

export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  role: "admin" | "user";
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
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

export const UserService = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    return apiRequest('users');
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return apiRequest(`users/${userId}`);
  },

  /**
   * Create a new user (admin only)
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    return apiRequest('users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    return apiRequest(`users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    return apiRequest(`users/${userId}`, {
      method: 'DELETE'
    });
  }
};
