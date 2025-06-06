// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const trimTrailingSlash = (url: string): string => {
  return url.replace(/\/$/, '');
};

export const isSameUrl = (url1: string, url2: string): boolean => {
  return trimTrailingSlash(url1) === trimTrailingSlash(url2);
};

export const isSameOrigin = (url1: string, url2: string): boolean => {
  try {
    return new URL(url1).origin === new URL(url2).origin;
  } catch {
    return false;
  }
};

// is same top domain
export const isSameTopDomain = (url1: string, url2: string): boolean => {
  try {
    return new URL(url1).host.split('.').slice(-2).join('.') === new URL(url2).host.split('.').slice(-2).join('.');
  } catch {
    return false;
  }
};
