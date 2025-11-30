// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafetyLevel } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import { useToggle } from '@/hooks/useToggle';
import { useEffect, useState } from 'react';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';

export function useSafetyCheck(call: IMethod) {
  const { network } = useNetwork();
  const [safetyCheck, setSafetyCheck] = useState<SafetyLevel>();
  const [isConfirm, , setConfirm] = useToggle(false);

  useEffect(() => {
    // Use call's own registry to find metadata
    const section = call.registry.findMetaCall(call.callIndex).section;

    // Use Promise for both sync and async paths to avoid setState in effect
    const checkSafety = () => {
      if (
        [
          'system',
          'scheduler',
          'preimage',
          'babe',
          'timestamp',
          'indices',
          'balances',
          'staking',
          'session',
          'grandpa',
          'treasury',
          'convictionVoting',
          'referenda',
          'whitelist',
          'parameters',
          'claims',
          'vesting',
          'bounties',
          'childBounties',
          'electionProviderMultiPhase',
          'voterList',
          'nominationPools',
          'fastUnstake',
          'configuration',
          'initializer',
          'hrmp',
          'parasDisputes',
          'parasSlashing',
          'onDemand',
          'registrar',
          'slots',
          'auctions',
          'crowdloan',
          'coretime',
          'stateTrieMigration',
          'messageQueue',
          'assetRate',
          'beefy',
          'paraSudoWrapper',
          'sudo'
        ].includes(section)
      ) {
        return Promise.resolve({
          severity: 'none',
          title: 'Success',
          message: 'This transaction is safe to execute.'
        } as SafetyLevel);
      } else {
        return service.chain.safetyCheck(network, call.toHex());
      }
    };

    checkSafety().then((level) => {
      if (level.severity === 'none') {
        setConfirm(true);
      }

      setSafetyCheck(level);
    });
  }, [call, network, setConfirm]);

  return [safetyCheck, isConfirm, setConfirm] as const;
}
