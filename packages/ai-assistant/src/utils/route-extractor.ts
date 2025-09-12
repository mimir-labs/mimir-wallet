// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Utility to extract route information from the main app routes configuration
 */

interface RouteConfig {
  path?: string;
  index?: boolean;
  description?: string;
  search?: Record<string, string>;
  children?: RouteConfig[];
  element?: any;
}

interface ExtractedRoute {
  path: string;
  description: string;
  search?: Record<string, string>;
}

/**
 * Extract all routes with descriptions from nested route configuration
 */
export function extractRoutesFromConfig(routes: RouteConfig[]): ExtractedRoute[] {
  const extractedRoutes: ExtractedRoute[] = [];

  function extractRoutes(config: RouteConfig | RouteConfig[], parentPath = ''): void {
    const configs = Array.isArray(config) ? config : [config];

    for (const route of configs) {
      if (route.description) {
        const routePath = route.index ? '/' : route.path || '';
        const fullPath = parentPath + routePath;

        extractedRoutes.push({
          path: fullPath || '/',
          description: route.description,
          ...(route.search && Object.keys(route.search).length > 0 && { search: route.search })
        });
      }

      if (route.children) {
        extractRoutes(route.children, parentPath);
      }
    }
  }

  extractRoutes(routes);

  return extractedRoutes.sort((a, b) => {
    // Sort routes: index route first, then by path
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;

    return a.path.localeCompare(b.path);
  });
}

/**
 * Generate AI-friendly routing context from extracted routes
 */
export function generateRoutingContext(routes: ExtractedRoute[]): string {
  return routes
    .map((route) => {
      let routeInfo = `Path: ${route.path}\nDescription: ${route.description}`;

      if (route.search) {
        routeInfo += '\nSearch Parameters:';
        Object.entries(route.search).forEach(([key, description]) => {
          routeInfo += `\n  - ${key}: ${description}`;
        });
      }

      return routeInfo;
    })
    .join('\n\n');
}
