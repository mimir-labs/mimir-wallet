// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useWallet } from '@/wallet/useWallet';

import { addressEq } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';

interface EmailBindData {
  address: string;
  email: string;
  nonce: string;
  timestamp: number;
  signature: HexString;
}

interface EmailUnbindData {
  address: string;
  nonce: string;
  timestamp: number;
  signature: HexString;
}

/**
 * Create signature message for bind operation
 */
function createBindMessage(address: string, signer: string, email: string, nonce: string, timestamp: number): string {
  return `action: bind
address: ${address}
signer: ${signer}
email: ${email}
nonce: ${nonce}
timestamp: ${timestamp}`;
}

/**
 * Create signature message for unbind operation
 */
function createUnbindMessage(address: string, signer: string, nonce: string, timestamp: number): string {
  return `action: unbind
address: ${address}
signer: ${signer}
email:${' '}
nonce: ${nonce}
timestamp: ${timestamp}`;
}

/**
 * Generate signature for email bind operation
 */
export async function createEmailBindSignature(address: string, email: string, signer: string): Promise<EmailBindData> {
  try {
    const source = useWallet.getState().walletAccounts.find((item) => addressEq(item.address, signer))?.source;

    if (!source) {
      throw new Error('not signer');
    }

    // Generate nonce from server
    const nonceResponse = await service.emailNotification.generateNonce();
    const { nonce, timestamp } = nonceResponse;

    // Create message to sign
    const message = createBindMessage(address, signer, email, nonce, timestamp);

    // Get injector for signing
    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    // Sign the message
    if (!injectSigner?.signRaw) {
      throw new Error('Signer does not support raw signing');
    }

    const signResult = await injectSigner.signRaw({
      address: signer,
      data: message,
      type: 'bytes'
    });

    return {
      address,
      email,
      nonce,
      timestamp,
      signature: signResult.signature
    };
  } catch (error) {
    console.error('Failed to create email bind signature:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create signature for email binding');
  }
}

/**
 * Generate signature for email unbind operation
 */
export async function createEmailUnbindSignature(address: string, signer: string): Promise<EmailUnbindData> {
  try {
    const source = useWallet.getState().walletAccounts.find((item) => addressEq(item.address, signer))?.source;

    if (!source) {
      throw new Error('not signer');
    }

    // Generate nonce from server
    const nonceResponse = await service.emailNotification.generateNonce();
    const { nonce, timestamp } = nonceResponse;

    // Create message to sign
    const message = createUnbindMessage(address, signer, nonce, timestamp);

    // Get injector for signing
    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    // Sign the message
    if (!injectSigner?.signRaw) {
      throw new Error('Signer does not support raw signing');
    }

    const signResult = await injectSigner.signRaw({
      address: signer,
      data: message,
      type: 'bytes'
    });

    return {
      address,
      nonce,
      timestamp,
      signature: signResult.signature as HexString
    };
  } catch (error) {
    console.error('Failed to create email unbind signature:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create signature for email unbinding');
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Length validation (RFC 5321)
  if (email.length > 320) {
    return { isValid: false, error: 'Email address too long (maximum 320 characters)' };
  }

  // Check for suspicious patterns
  if (/[<>'"]/g.test(email)) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
