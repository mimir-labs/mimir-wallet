// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * LightSpell API base URL
 */
const LIGHTSPELL_BASE_URL = 'https://api.lightspell.xyz/v5';

/**
 * LightSpell API endpoints configuration
 */
export const LIGHTSPELL_ENDPOINTS = {
  TRANSFER: `${LIGHTSPELL_BASE_URL}/x-transfer`,
  XCM_FEE: `${LIGHTSPELL_BASE_URL}/xcm-fee`,
  ROUTER: `${LIGHTSPELL_BASE_URL}/router`,
  ROUTER_BEST_AMOUNT: `${LIGHTSPELL_BASE_URL}/router/best-amount-out`,
  ROUTER_DRY_RUN: `${LIGHTSPELL_BASE_URL}/router/dry-run`,
} as const;

/**
 * LightSpell API error response format
 */
interface LightSpellErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

/**
 * Custom error for LightSpell API failures
 */
export class LightSpellApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errorType?: string,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = 'LightSpellApiError';
  }
}

/**
 * JSON replacer for BigInt serialization
 */
const bigIntReplacer = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

/**
 * Parse error response from LightSpell API
 */
async function parseErrorResponse(
  response: Response,
  endpoint: string,
): Promise<LightSpellApiError> {
  try {
    const errorData: LightSpellErrorResponse = await response.json();

    return new LightSpellApiError(
      errorData.message,
      errorData.statusCode,
      errorData.error,
      endpoint,
    );
  } catch {
    // Fallback if response is not JSON
    return new LightSpellApiError(
      `LightSpell API error: ${response.statusText}`,
      response.status,
      undefined,
      endpoint,
    );
  }
}

/**
 * Unified LightSpell API client for JSON responses
 */
export async function lightSpellPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, bigIntReplacer),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response, endpoint);
  }

  return response.json();
}

/**
 * LightSpell API client for text responses (transfer call data)
 */
export async function lightSpellPostText(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body, bigIntReplacer),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response, endpoint);
  }

  return response.text();
}
