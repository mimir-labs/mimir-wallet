// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { BaseService } from './BaseService.js';

// Type definitions based on backend API specification
export interface EmailSubscriptionResponseDto {
  id: number;
  address: string;
  signer: string;
  email: string; // Masked for privacy (e.g., "us***r@example.com")
  isActive: boolean;
  createdAt: string; // ISO 8601 format
}

export interface NonceResponseDto {
  nonce: string;
  timestamp: number;
}

export interface BindEmailRequestDto {
  address: string;
  signer: string;
  email: string;
  nonce: string;
  timestamp: number;
  signature: HexString;
}

export interface UnbindEmailRequestDto {
  address: string;
  signer: string;
  nonce: string;
  timestamp: number;
  signature: HexString;
}

export interface BindEmailSuccessResponseDto {
  success: true;
  data: EmailSubscriptionResponseDto;
  message: string;
}

export interface UnbindEmailSuccessResponseDto {
  success: true;
  message: string;
}

export interface EmailSubscriptionListResponseDto {
  subscriptions: EmailSubscriptionResponseDto[];
  count: number;
}

export interface EmailSubscriptionCountResponseDto {
  count: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

/**
 * Email Notification Service
 * Handles email notification subscription management with signature verification
 */
export class EmailNotificationService extends BaseService {
  private readonly baseUrl = 'notifications/email';

  /**
   * Generate a secure nonce required for signature operations
   */
  async generateNonce(): Promise<NonceResponseDto> {
    return this.post<NonceResponseDto>(`${this.baseUrl}/nonce`);
  }

  /**
   * Create or update an email subscription for an account
   */
  async bindEmail(dto: BindEmailRequestDto): Promise<BindEmailSuccessResponseDto> {
    return this.post<BindEmailSuccessResponseDto>(`${this.baseUrl}/bind`, dto);
  }

  /**
   * Remove an email subscription from an account
   */
  async unbindEmail(dto: UnbindEmailRequestDto): Promise<UnbindEmailSuccessResponseDto> {
    return this.delete<UnbindEmailSuccessResponseDto>(`${this.baseUrl}/unbind`, dto);
  }

  /**
   * Retrieve current email subscriptions for an account
   */
  async getSubscriptions(address: string, signer: string): Promise<EmailSubscriptionListResponseDto> {
    return this.get<EmailSubscriptionListResponseDto>(`${this.baseUrl}/subscriptions/${address}/${signer}`);
  }

  /**
   * Get the total number of active email subscriptions for an address
   */
  async getSubscriptionCount(address: string): Promise<EmailSubscriptionCountResponseDto> {
    return this.get<EmailSubscriptionCountResponseDto>(`${this.baseUrl}/count/${address}`);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Length validation (RFC 5321)
    if (email.length > 320) {
      return { isValid: false, error: 'Email address too long' };
    }

    // Check for suspicious patterns (basic XSS prevention)
    if (/[<>'"]/g.test(email)) {
      return { isValid: false, error: 'Email contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
