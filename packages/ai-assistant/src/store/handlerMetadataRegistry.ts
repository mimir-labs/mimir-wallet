// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HandlerMetadata, RouteRequirement } from '../types/metadata.js';

/**
 * Registry for storing and querying handler metadata
 * Completely decoupled from the event system
 */
export class HandlerMetadataRegistry {
  private metadata = new Map<string, HandlerMetadata>();
  private functionNameIndex = new Map<string, Set<string>>(); // functionName -> handlerIds

  /**
   * Register handler metadata
   */
  public register(metadata: HandlerMetadata): void {
    this.metadata.set(metadata.handlerId, metadata);

    // Update function name index
    let handlers = this.functionNameIndex.get(metadata.functionName);

    if (!handlers) {
      handlers = new Set();
      this.functionNameIndex.set(metadata.functionName, handlers);
    }

    handlers.add(metadata.handlerId);
  }

  /**
   * Unregister handler metadata
   */
  public unregister(handlerId: string): void {
    const metadata = this.metadata.get(handlerId);

    if (!metadata) return;

    // Remove from function name index
    const handlers = this.functionNameIndex.get(metadata.functionName);

    if (handlers) {
      handlers.delete(handlerId);

      if (handlers.size === 0) {
        this.functionNameIndex.delete(metadata.functionName);
      }
    }

    this.metadata.delete(handlerId);
  }

  /**
   * Get metadata by handler ID
   */
  public getMetadata(handlerId: string): HandlerMetadata | undefined {
    return this.metadata.get(handlerId);
  }

  /**
   * Get all metadata for a function name
   */
  public getMetadataByFunction(functionName: string): HandlerMetadata[] {
    const handlerIds = this.functionNameIndex.get(functionName);

    if (!handlerIds) return [];

    return Array.from(handlerIds)
      .map((id) => this.metadata.get(id))
      .filter((m): m is HandlerMetadata => m !== undefined)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Get route requirement for a function name
   * Returns the first registered route requirement
   */
  public getRouteRequirement(functionName: string): RouteRequirement | undefined {
    const metadataList = this.getMetadataByFunction(functionName);

    return metadataList.find((m) => m.routeRequirement)?.routeRequirement;
  }

  /**
   * Check if a function requires a specific route
   */
  public requiresRoute(functionName: string): boolean {
    return this.getRouteRequirement(functionName) !== undefined;
  }

  /**
   * Get all registered function names
   */
  public getAllFunctionNames(): string[] {
    return Array.from(this.functionNameIndex.keys());
  }

  /**
   * Get statistics for monitoring
   */
  public getStats(): {
    totalHandlers: number;
    totalFunctions: number;
    routeDependentFunctions: number;
  } {
    const routeDependentFunctions = this.getAllFunctionNames().filter((name) => this.requiresRoute(name)).length;

    return {
      totalHandlers: this.metadata.size,
      totalFunctions: this.functionNameIndex.size,
      routeDependentFunctions
    };
  }

  /**
   * Clear all metadata
   */
  public clear(): void {
    this.metadata.clear();
    this.functionNameIndex.clear();
  }
}

// Singleton instance
export const handlerMetadataRegistry = new HandlerMetadataRegistry();
