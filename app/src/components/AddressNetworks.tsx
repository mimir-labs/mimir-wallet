// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @fileoverview AddressNetworks component displays the proxy networks that an account supports
 *
 * @example
 * // Basic usage - shows proxy networks for an address
 * <div className="flex items-center gap-1">
 *   {AddressNetworks({ address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" })}
 * </div>
 *
 * @example
 * // Custom avatar size
 * <div className="flex items-center gap-2">
 *   {AddressNetworks({
 *     address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
 *     avatarSize: 24
 *   })}
 * </div>
 *
 * @example
 * // With tooltips disabled
 * <div className="flex items-center">
 *   {AddressNetworks({
 *     address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
 *   })}
 * </div>
 */

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useMemo } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Tooltip } from '@mimir-wallet/ui';

interface AddressNetworksProps {
  /**
   * The address to show supported proxy networks for
   */
  address: string;
  /**
   * Size of the network avatars
   * @default 20
   */
  avatarSize?: number | string;
  /**
   * Show network names in tooltip
   * @default true
   */
  showTooltip?: boolean;
}

function Icon({
  size,
  icon,
  name,
  showTooltip,
  migrationIcon,
  migrationName
}: {
  size: string | number;
  showTooltip: boolean;
  icon: string;
  name: string;
  migrationIcon?: string;
  migrationName?: string;
}) {
  const avatar = migrationIcon ? (
    <div
      className='relative'
      style={{
        width: size,
        height: size
      }}
    >
      <img
        className='animate-fade-out select-none'
        src={migrationIcon}
        alt={migrationName}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      />
      <img
        className='animate-fade-in animation absolute top-0 left-0 z-[1] select-none'
        src={icon}
        alt={name}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  ) : (
    <img
      src={icon}
      alt={name}
      draggable={false}
      style={{
        width: size,
        height: size,
        userSelect: 'none'
      }}
    />
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <Tooltip color='foreground' content={name}>
        {avatar}
      </Tooltip>
    );
  }

  return avatar;
}

/**
 * Function to get proxy network avatars for an account
 * Returns an array of Avatar components for networks where the account has proxy relationships
 * For pure accounts with migration networks, shows a gradient from migration to current network
 */
function AddressNetworks({ address, avatarSize = 20, showTooltip = true }: AddressNetworksProps) {
  const { meta } = useAddressMeta(address);
  const { networks } = useNetworks();

  // Get the networks where this address has proxy relationships
  const proxyNetworks = useMemo(() => {
    const genesisHashes = Array.from(
      new Set((meta.pureCreatedAt ? [meta.pureCreatedAt] : []).concat(...(meta.proxyNetworks || [])))
    );

    // Filter networks to only include those that exist in the proxy networks
    return networks.filter((network) => genesisHashes.includes(network.genesisHash));
  }, [meta.proxyNetworks, meta.pureCreatedAt, networks]);

  const migrationNetwork = useMemo(() => {
    if (meta.pureCreatedAt && meta.migrationNetwork) {
      return networks.find((network) => network.genesisHash === meta.migrationNetwork);
    }

    return undefined;
  }, [meta.migrationNetwork, meta.pureCreatedAt, networks]);

  // Return array of Avatar components for proxy networks
  return proxyNetworks.map((network) => {
    return (
      <Icon
        key={network.genesisHash}
        size={avatarSize}
        icon={network.icon}
        name={network.name}
        showTooltip={showTooltip}
        migrationIcon={migrationNetwork?.icon}
        migrationName={migrationNetwork?.name}
      />
    );
  });
}

export default AddressNetworks;
