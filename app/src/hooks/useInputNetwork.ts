// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains, useNetwork } from '@mimir-wallet/polkadot-core';
import { useCallback, useMemo, useState } from 'react';

/**
 * Hook for managing network selection with validation against supported/enabled networks.
 *
 * Uses derived state pattern instead of effect-based state correction to avoid
 * cascading renders and follow React best practices.
 *
 * @param defaultNetwork - Default network to use if no other is available
 * @param supportedNetworks - Optional list of allowed networks to choose from
 * @returns Tuple of [currentNetwork, setNetwork]
 */
export function useInputNetwork(
  defaultNetwork?: string,
  supportedNetworks?: string[],
) {
  const { chains, mode } = useChains();
  const { network: initialNetwork } = useNetwork();

  // Get enabled network keys as a Set for fast lookup
  const enabledNetworks = useMemo(
    () => new Set(chains.filter((c) => c.enabled).map((c) => c.key)),
    [chains],
  );

  // Helper to compute the fallback network
  const getFallbackNetwork = useCallback(() => {
    return (
      supportedNetworks?.at(0) ||
      defaultNetwork ||
      enabledNetworks.values().next().value ||
      initialNetwork
    );
  }, [supportedNetworks, defaultNetwork, enabledNetworks, initialNetwork]);

  // Store user's preferred selection (may become invalid if constraints change)
  const [preferredNetwork, setPreferredNetwork] = useState(getFallbackNetwork);

  // Derive the effective network by validating preferredNetwork against constraints
  // This avoids the need for effect-based state correction
  const network = useMemo(() => {
    if (mode !== 'omni') {
      return preferredNetwork;
    }

    // Validate against supportedNetworks if provided
    if (supportedNetworks) {
      return supportedNetworks.includes(preferredNetwork)
        ? preferredNetwork
        : supportedNetworks[0] || preferredNetwork;
    }

    // Otherwise validate against enabledNetworks
    return enabledNetworks.has(preferredNetwork)
      ? preferredNetwork
      : enabledNetworks.values().next().value || initialNetwork;
  }, [
    mode,
    preferredNetwork,
    supportedNetworks,
    enabledNetworks,
    initialNetwork,
  ]);

  // Setter with validation - only allows valid networks to be set
  const setNetwork = useCallback(
    (newNetwork: string) => {
      if (mode !== 'omni') return;

      // Only allow networks that are in supportedNetworks (if provided)
      if (!supportedNetworks || supportedNetworks.includes(newNetwork)) {
        setPreferredNetwork(newNetwork);
      }
    },
    [mode, supportedNetworks],
  );

  return [network, setNetwork] as const;
}
