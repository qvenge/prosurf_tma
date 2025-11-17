import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsClient } from '../clients/clients';
import { useAuth } from '../auth';
import type { UserUpdateDto, CompleteProfileDto } from '../types';

/**
 * Query key factory for clients
 */
export const clientsKeys = {
  all: ['clients'] as const,
  me: () => [...clientsKeys.all, 'me'] as const,
  meCashback: () => [...clientsKeys.me(), 'cashback'] as const,
} as const;

/**
 * Get current client profile
 * GET /clients/me
 */
export const useMe = () => {
  return useQuery({
    queryKey: clientsKeys.me(),
    queryFn: () => clientsClient.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update current client profile
 * PATCH /clients/me
 *
 * Supports photo upload via multipart/form-data
 */
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: ({ data, photo, deletePhoto }: { data: UserUpdateDto; photo?: File; deletePhoto?: boolean }) =>
      clientsClient.updateMe(data, photo, deletePhoto),
    onSuccess: (updatedClient) => {
      // Update client in cache
      queryClient.setQueryData(clientsKeys.me(), updatedClient);

      // Update auth context
      auth.updateUser(updatedClient);
    },
    onError: (error) => {
      console.error('Failed to update client profile:', error);
    },
  });
};

/**
 * Get current client cashback wallet
 * GET /clients/me/cashback
 */
export const useMyCashback = () => {
  return useQuery({
    queryKey: clientsKeys.meCashback(),
    queryFn: () => clientsClient.getMyCashback(),
    staleTime: 1 * 60 * 1000, // 1 minute (financial data should be fresh)
  });
};

/**
 * Combined hook for current client profile management
 *
 * Provides unified interface for profile operations:
 * - Current user data from AuthContext
 * - Update profile mutation with automatic cache sync
 * - Loading and error states
 *
 * @example
 * ```tsx
 * const { user, isLoading, updateUser, isUpdating } = useCurrentClient();
 *
 * const handleSave = (data) => {
 *   updateUser({ data, photo: selectedFile });
 * };
 * ```
 */
export const useCurrentClient = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ data, photo, deletePhoto }: { data: UserUpdateDto; photo?: File; deletePhoto?: boolean }) =>
      clientsClient.updateMe(data, photo, deletePhoto),
    onSuccess: (updatedClient) => {
      // Update both query cache and AuthContext
      queryClient.setQueryData(clientsKeys.me(), updatedClient);
      auth.updateUser(updatedClient);
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

/**
 * Complete client profile on first login
 * POST /clients/me/complete-profile
 *
 * Used to collect required information from new users:
 * - Full name (firstName, lastName)
 * - Phone number
 * - Required consents (personal data, privacy policy, safety rules)
 *
 * After successful completion, updates client data in cache and auth context.
 *
 * @example
 * ```tsx
 * const { mutate: completeProfile, isPending } = useCompleteProfile();
 *
 * const handleSubmit = (data) => {
 *   completeProfile(data, {
 *     onSuccess: () => navigate('/'),
 *     onError: (error) => console.error(error),
 *   });
 * };
 * ```
 */
export const useCompleteProfile = () => {
  const queryClient = useQueryClient();
  const auth = useAuth();

  return useMutation({
    mutationFn: (data: CompleteProfileDto) => clientsClient.completeProfile(data),
    onSuccess: (updatedClient) => {
      // Update client in cache
      queryClient.setQueryData(clientsKeys.me(), updatedClient);

      // Update auth context
      auth.updateUser(updatedClient);
    },
    onError: (error) => {
      console.error('Failed to complete profile:', error);
    },
  });
};
