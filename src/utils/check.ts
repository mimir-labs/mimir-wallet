// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function isValidNumber(value: unknown): boolean {
  return !Number.isNaN(Number(value));
}

export function isValidInteger(value: unknown): boolean {
  return isValidNumber(value) && Number.isInteger(value);
}

export function isPositiveNumber(value: { toString: () => string }): boolean {
  return isValidNumber(value) && Number(value) >= 0;
}

export const isValidURL = (url: string, protocolsAllowed = ['https:']): boolean => {
  try {
    const urlInfo = new URL(url);

    return protocolsAllowed.includes(urlInfo.protocol) || urlInfo.hostname.split('.').pop() === 'localhost';
  } catch {
    return false;
  }
};
