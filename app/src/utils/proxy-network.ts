// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AppMetadata {
  name: string;
  description?: string;
  icon?: string;
}

/**
 * CORS proxy endpoints for cross-origin requests
 */
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
] as const;

/**
 * Fetch content through CORS proxy
 */
async function fetchThroughProxy(url: string, proxyIndex = 0): Promise<string> {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error('All proxy services failed');
  }

  const proxy = CORS_PROXIES[proxyIndex];

  try {
    let proxyUrl: string;
    let response: Response;

    if (proxy.includes('allorigins.win')) {
      // allorigins.win specific format
      proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl);
      const json = await response.json();

      if (!json.contents) {
        throw new Error('Failed to get contents from allorigins');
      }

      return json.contents;
    } else {
      // Generic proxy format
      proxyUrl = `${proxy}${url}`;
      response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status}`);
      }

      return await response.text();
    }
  } catch (error) {
    console.warn(`Proxy ${proxy} failed:`, error);

    // Try next proxy
    return fetchThroughProxy(url, proxyIndex + 1);
  }
}

/**
 * Parse app metadata from manifest.json
 */
function parseManifest(manifestData: any, baseUrl: string): AppMetadata {
  const name = manifestData.name || '';
  const description = manifestData.description || '';
  let icon: string | undefined;

  if (manifestData.iconPath) {
    icon = new URL(manifestData.iconPath, baseUrl).toString();
  } else if (manifestData.icons && Array.isArray(manifestData.icons) && manifestData.icons.length > 0) {
    icon = new URL(manifestData.icons[0].src, baseUrl).toString();
  }

  return { name, description, icon };
}

/**
 * Parse app metadata from HTML content
 */
function parseHtml(htmlContent: string, baseUrl: string): AppMetadata {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

  let icon: string | undefined;
  const iconElement =
    doc.querySelector('link[rel~="icon"]') ||
    doc.querySelector('link[rel="shortcut icon"]') ||
    doc.querySelector('link[rel="apple-touch-icon"]');

  if (iconElement) {
    const href = iconElement.getAttribute('href');

    if (href) {
      try {
        icon = new URL(href, baseUrl).toString();
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return { name: title, description, icon };
}

/**
 * Fetch app metadata with fallback strategies
 */
export async function fetchAppMetadata(url: string): Promise<ProxyResponse<AppMetadata>> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Strategy 1: Try to fetch manifest.json
    try {
      const manifestUrl = new URL('/manifest.json', parsedUrl).toString();
      const manifestContent = await fetchThroughProxy(manifestUrl);
      const manifestData = JSON.parse(manifestContent);
      const metadata = parseManifest(manifestData, url);

      if (metadata.name) {
        return { success: true, data: metadata };
      }
    } catch (error) {
      console.warn('Failed to fetch manifest.json:', error);
    }

    // Strategy 2: Try to fetch and parse HTML
    try {
      const htmlContent = await fetchThroughProxy(url);
      const metadata = parseHtml(htmlContent, url);

      if (metadata.name) {
        return { success: true, data: metadata };
      }
    } catch (error) {
      console.warn('Failed to fetch HTML:', error);
    }

    return { success: false, error: 'Unable to fetch app metadata' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return { success: false, error: errorMessage };
  }
}

export type { AppMetadata, ProxyResponse };
