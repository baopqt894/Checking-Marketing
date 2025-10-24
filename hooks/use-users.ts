import { useEffect, useState, useCallback } from 'react';
import { UserService, User } from '@/lib/userService';

export function useUsers(isAdmin: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setError('Only admins can view users');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await UserService.getAllUsers();
      setUsers(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = useCallback(async (userData: Partial<User>) => {
    if (!isAdmin) {
      throw new Error('Only admins can create users');
    }

    try {
      const newUser = await UserService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create user');
    }
  }, [isAdmin]);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
    if (!isAdmin) {
      throw new Error('Only admins can update users');
    }

    try {
      const updatedUser = await UserService.updateUser(userId, data);
      setUsers(prev => 
        prev.map(user => user._id === userId ? updatedUser : user)
      );
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update user');
    }
  }, [isAdmin]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Only admins can delete users');
    }

    try {
      await UserService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete user');
    }
  }, [isAdmin]);

  return {
    users,
    loading,
    error,
    reload: loadUsers,
    createUser,
    updateUser,
    deleteUser
  };
}
