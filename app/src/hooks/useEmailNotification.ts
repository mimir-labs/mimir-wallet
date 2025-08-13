// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EmailSubscriptionResponseDto } from '@mimir-wallet/service';

import { createEmailBindSignature, createEmailUnbindSignature, validateEmail } from '@/utils/emailSignatureUtils';
import { useWallet } from '@/wallet/useWallet';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { service } from '@mimir-wallet/service';

export interface UseEmailNotificationResult {
  // Subscription data
  subscriptions: EmailSubscriptionResponseDto[];

  // Loading states
  isLoading: boolean;
  isBinding: boolean;
  isUnbinding: boolean;

  // Error state
  error: string | null;

  // Actions
  bindEmail: (value: { email: string; signer: string }, ...args: any[]) => Promise<void>;
  unbindEmail: (value: { signer: string }) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing email notification subscriptions
 */
export function useEmailNotification(address: string | null): UseEmailNotificationResult {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { walletAccounts } = useWallet();

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Query for fetching email subscriptions using parallel queries for each signer
  const subscriptionQueries = useQueries({
    queries:
      address && walletAccounts.length > 0
        ? walletAccounts.map((account) => ({
            queryKey: ['emailSubscription', address, account.address],
            queryFn: async () => {
              const response = await service.emailNotification.getSubscriptions(address, account.address);

              return response.subscriptions;
            },
            staleTime: 2 * 60 * 1000, // 2 minutes
            retry: (failureCount: number, error: any) => {
              // Don't retry on 404 (no subscriptions found)
              if (error?.statusCode === 404) {
                return false;
              }

              return failureCount < 2;
            }
          }))
        : []
  });

  // Combine results from all queries
  const subscriptionsData = subscriptionQueries.reduce<EmailSubscriptionResponseDto[]>((acc, query) => {
    if (query.data) {
      acc.push(...query.data);
    }

    return acc;
  }, []);

  const isLoading = subscriptionQueries.some((query) => query.isLoading);

  // Bind email mutation
  const bindMutation = useMutation({
    mutationFn: async ({ email, signer }: { email: string; signer: string }) => {
      if (!address) {
        throw new Error('Address is required');
      }

      // Validate email
      const validation = validateEmail(email);

      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid email');
      }

      // Create signature data
      const signatureData = await createEmailBindSignature(address, email, signer);

      // Bind email via API
      const response = await service.emailNotification.bindEmail({
        address,
        signer,
        email,
        nonce: signatureData.nonce,
        timestamp: signatureData.timestamp,
        signature: signatureData.signature
      });

      return response;
    },
    onSuccess: () => {
      // Invalidate all email subscription queries for this address
      queryClient.invalidateQueries({
        queryKey: ['emailSubscription', address],
        exact: false // Match all queries starting with this pattern
      });
      setError(null);
    },
    onError: (error) => {
      console.error('Failed to bind email:', error);
      setError(error instanceof Error ? error.message : 'Failed to bind email');
    }
  });

  // Unbind email mutation
  const unbindMutation = useMutation({
    mutationFn: async ({ signer }: { signer: string }) => {
      if (!address) {
        throw new Error('Address is required');
      }

      // Create signature data for unbind
      const signatureData = await createEmailUnbindSignature(address, signer);

      // Unbind email via API
      const response = await service.emailNotification.unbindEmail({
        address,
        signer: signer,
        nonce: signatureData.nonce,
        timestamp: signatureData.timestamp,
        signature: signatureData.signature
      });

      return response;
    },
    onSuccess: () => {
      // Invalidate all email subscription queries for this address
      queryClient.invalidateQueries({
        queryKey: ['emailSubscription', address],
        exact: false // Match all queries starting with this pattern
      });
      setError(null);
    },
    onError: (error) => {
      console.error('Failed to unbind email:', error);
      setError(error instanceof Error ? error.message : 'Failed to unbind email');
    }
  });

  // Action functions
  const bindEmail = useCallback(
    async (value: Parameters<typeof bindMutation.mutateAsync>['0']) => {
      clearError();
      await bindMutation.mutateAsync(value);
    },
    [bindMutation, clearError]
  );

  const unbindEmail = useCallback(
    async (value: Parameters<typeof unbindMutation.mutateAsync>['0']) => {
      clearError();
      await unbindMutation.mutateAsync(value);
    },
    [unbindMutation, clearError]
  );

  return {
    // Data
    subscriptions: subscriptionsData,

    // Loading states
    isLoading,
    isBinding: bindMutation.isPending,
    isUnbinding: unbindMutation.isPending,

    // Error state
    error,

    // Actions
    bindEmail,
    unbindEmail,
    clearError
  };
}
