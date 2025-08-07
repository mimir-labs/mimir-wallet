// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { AddressMetaContext } from '@/accounts/useAccount';
import { transformAccount } from '@/accounts/useQueryAccount';
import { AddressOverview } from '@/components';
import { toastError } from '@/components/utils';
import { type AccountData, AddressMeta, type MultisigAccountData } from '@/hooks/types';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import React, { useEffect, useState } from 'react';
import { useToggle } from 'react-use';

import { useApi, zeroAddress } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, buttonSpinner, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

interface AccountStructureProps {
  name: string;
  members: string[];
  threshold: number;
  isPureProxy: boolean;
}

function AccountStructure({ members, name, threshold, isPureProxy }: AccountStructureProps) {
  const { genesisHash, chainSS58 } = useApi();
  const [multisigAccount, setMultisigAccount] = React.useState<AccountData>();
  const [fullAccount, setFullAccount] = React.useState<AccountData>();
  const [isFetching, setIsFetching] = React.useState(false);
  const [overrideMetas, setOverrideMetas] = useState<Record<HexString, AddressMeta>>({});
  const [isOpen, toggleOpen] = useToggle(false);

  useEffect(() => {
    const multisigAddress = encodeMultiAddress(members, threshold);
    const multisigAddressHex = u8aToHex(decodeAddress(multisigAddress));

    const multisigAccount: MultisigAccountData = {
      type: 'multisig',
      name: name,
      members: members.map((member) => ({ type: 'account', address: member, delegatees: [], createdAt: 0 })),
      address: encodeMultiAddress(members, threshold),
      threshold: threshold,
      createdAt: 0,
      delegatees: []
    };

    if (isPureProxy) {
      setMultisigAccount({
        type: 'pure',
        isUnknownPure: true,
        name: name,
        address: zeroAddress,
        createdAt: 0,
        delegatees: [{ ...multisigAccount, proxyDelay: 0, proxyNetwork: genesisHash, proxyType: 'Any' }],
        createdBlock: '0',
        createdBlockHash: '0x',
        createdExtrinsicHash: '0x',
        createdExtrinsicIndex: 1,
        creator: '0x',
        disambiguationIndex: 0,
        network: genesisHash
      });
    } else {
      setMultisigAccount(multisigAccount);
    }

    setOverrideMetas({
      [multisigAddressHex]: {
        isMultisig: true,
        name: name,
        threshold: threshold,
        who: members
      }
    });
  }, [genesisHash, isPureProxy, members, name, threshold]);

  const fetchFullStructure = async () => {
    setIsFetching(true);

    try {
      const memberAccounts = await Promise.all(
        members.map((item) =>
          service.account
            .getOmniChainDetails(item)
            .then((account) => transformAccount(chainSS58, account, true, genesisHash))
        )
      );

      const multisigAccount: AccountData = {
        type: 'multisig',
        name: name,
        members: memberAccounts,
        address: encodeMultiAddress(members, threshold),
        threshold: threshold,
        createdAt: 0,
        delegatees: []
      };

      if (isPureProxy) {
        setFullAccount({
          type: 'pure',
          isUnknownPure: true,
          name: name,
          address: zeroAddress,
          createdAt: 0,
          delegatees: [{ ...multisigAccount, proxyDelay: 0, proxyNetwork: genesisHash, proxyType: 'Any' }],
          createdBlock: '0',
          createdBlockHash: '0x',
          createdExtrinsicHash: '0x',
          createdExtrinsicIndex: 1,
          creator: '0x',
          disambiguationIndex: 0,
          network: genesisHash
        });
      } else {
        setFullAccount(multisigAccount);
      }

      toggleOpen(true);
    } catch (error) {
      toastError(error);
    }

    setIsFetching(false);
  };

  return (
    <>
      <div className='bg-secondary relative h-[250px] rounded-[10px] pt-10'>
        {/* View Full Structure Button */}
        <Button
          disabled={isFetching}
          size='sm'
          variant='ghost'
          color='primary'
          radius='full'
          className='bg-content1 absolute top-2.5 left-2.5 z-10'
          onClick={fetchFullStructure}
        >
          {isFetching ? buttonSpinner : null}
          View Full Structure
        </Button>

        {/* Simple visualization - can be enhanced with actual diagram */}
        <AddressMetaContext.Provider value={overrideMetas}>
          <div className='flex h-full items-center justify-center'>
            {multisigAccount ? <AddressOverview showAddressNodeOperations={false} account={multisigAccount} /> : null}
          </div>
        </AddressMetaContext.Provider>
      </div>

      {fullAccount && (
        <Modal size='5xl' isOpen={isOpen} onClose={() => toggleOpen(false)}>
          <ModalContent>
            <ModalHeader>Full Structure</ModalHeader>
            <ModalBody>
              <div className='bg-secondary h-[50dvh] rounded-[10px]'>
                {isOpen ? <AddressOverview showAddressNodeOperations={false} account={fullAccount} /> : null}
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default AccountStructure;
