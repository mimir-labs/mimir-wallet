// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import AddressRow from '@/components/AddressRow';
import { useMemo } from 'react';

import { allEndpoints, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider } from '@mimir-wallet/ui';

import AddPureProxy from '../components/AddPureProxy';
import AccountStructure from './AccountStructure';

interface Step3ReviewProps {
  name: string;
  members: string[];
  threshold: number;
  isPureProxy: boolean;
  network: string;
  onBack: () => void;
  onConfirm: () => void;
}

function Step3Review({ isPureProxy, members, name, onBack, onConfirm, threshold }: Step3ReviewProps) {
  const { chain, genesisHash } = useApi();

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );

  return (
    <div className='flex flex-col gap-4'>
      {/* Account Structure Visualization */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Account</label>
        <AccountStructure isPureProxy={isPureProxy} name={name} members={members} threshold={threshold} />
      </div>

      {/* Name Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Name</label>
        <div className='bg-secondary rounded-[10px] px-2.5 py-2'>
          <span className='text-foreground text-sm'>{name}</span>
        </div>
      </div>

      {/* Add Pure Proxy */}
      <AddPureProxy isDisabled isPureProxy={isPureProxy} />

      {/* Network */}
      {isPureProxy && (
        <div className='flex flex-col gap-1'>
          <label className='text-foreground text-sm font-bold'>Network</label>
          <div className='bg-secondary rounded-[10px] px-2.5 py-2'>
            <img src={chain.icon} className='inline h-5 w-5' alt={chain.name} />
            &nbsp;
            <span className='text-foreground text-sm'>{chain.name}</span>
            {remoteProxyChain ? (
              <>
                &nbsp; (also on{' '}
                <img src={remoteProxyChain.icon} className='inline h-5 w-5' alt={remoteProxyChain.name} />
                &nbsp;
                <span className='text-foreground text-sm'>{remoteProxyChain.name}</span> due to remote proxy)
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Multisig Signers Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Multisig Signers</label>
        <div className='border-divider-300 rounded-[10px] border p-2.5'>
          <div className='flex flex-col gap-2.5'>
            {members.map((member) => (
              <div key={member} className='bg-secondary flex items-center gap-1 rounded-[5px] px-1 py-1'>
                <AddressRow
                  className='[&_.AddressRow-Address]:text-[#949494]'
                  value={member}
                  withAddress
                  withName
                  iconSize={20}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threshold Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Threshold</label>
        <div className='bg-secondary rounded-[10px] px-2.5 py-2'>
          <span className='text-foreground text-sm'>
            {threshold} out of {members.length}
          </span>
        </div>
      </div>

      {/* Divider */}
      <Divider className='bg-secondary' />

      {/* Action Buttons */}
      <div className='flex gap-2.5'>
        <Button fullWidth size='md' variant='ghost' color='primary' radius='full' onClick={onBack}>
          Back
        </Button>
        <Button fullWidth size='md' color='primary' radius='full' onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

export default Step3Review;
