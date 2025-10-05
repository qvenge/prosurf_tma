import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { usersClient } from '../clients/users';
import { useAuth } from '../auth';
import type { User, UserUpdateDto, UserFilters, PaginatedResponse } from '../types';

// Query key factory for users
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  cashback: (id: string) => [...usersKeys.detail(id), 'cashback'] as const,
} as const;

/**
 * Users hooks
 */

// Get list of users (ADMIN only)
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersClient.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for users list (ADMIN only)
export const useUsersInfinite = (filters?: Omit<UserFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: usersKeys.list(filters),
    queryFn: ({ pageParam }) => usersClient.getUsers({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<User>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersClient.getUserById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, photo, deletePhoto }: { id: string; data: UserUpdateDto; photo?: File; deletePhoto?: boolean }) =>
      usersClient.updateUser(id, data, photo, deletePhoto),
    onSuccess: (updatedUser, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(usersKeys.detail(variables.id), updatedUser);

      // Invalidate user lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

// Get user cashback wallet
export const useUserCashback = (userId: string) => {
  return useQuery({
    queryKey: usersKeys.cashback(userId),
    queryFn: () => usersClient.getUserCashback(userId),
    staleTime: 1 * 60 * 1000, // 1 minute (financial data should be fresh)
  });
};

// Hook for current user profile management
export const useCurrentUserProfile = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  // Get user directly from AuthContext (loaded from localStorage on init)
  const userId = auth.user?.id;

  const updateMutation = useMutation({
    mutationFn: ({ data, photo, deletePhoto }: { data: UserUpdateDto; photo?: File; deletePhoto?: boolean }) => {
      if (!userId) throw new Error('User not authenticated');
      return usersClient.updateUser(userId, data, photo, deletePhoto);
    },
    onSuccess: (updatedUser) => {
      // Update both AuthContext and query cache
      auth.updateUser(updatedUser);
      queryClient.setQueryData(usersKeys.detail(userId!), updatedUser);
    },
  });

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    error: null,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};

// Hook for current user's cashback
export const useCurrentUserCashback = () => {
  const auth = useAuth();
  const userId = auth.user?.id;

  return useQuery({
    queryKey: usersKeys.cashback(userId!),
    queryFn: () => usersClient.getUserCashback(userId!),
    enabled: Boolean(userId),
    staleTime: 1 * 60 * 1000,
  });
};