// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { AddressMetaContext } from '@/accounts/useAccount';
import { transformAccount } from '@/accounts/useQueryAccount';
import { AddressOverview } from '@/components';
import { toastError } from '@/components/utils';
import React, { useEffect, useState } from 'react';
import { useToggle } from 'react-use';

import { useApi, zeroAddress } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

import { DEFAULT_PURE_ACCOUNT_NAME } from '../utils';

interface ProxyAccountStructureProps {
  proxy: string;
  proxied?: string;
  pureName?: string;
  isPureProxy: boolean;
  proxyType: string;
  hasDelay: boolean;
}

function ProxyAccountStructure({
  proxy,
  proxied,
  pureName,
  isPureProxy,
  proxyType,
  hasDelay
}: ProxyAccountStructureProps) {
  const { genesisHash, chainSS58 } = useApi();
  const [proxyAccount, setProxyAccount] = React.useState<AccountData>();
  const [fullAccount, setFullAccount] = React.useState<AccountData>();
  const [isFetching, setIsFetching] = React.useState(false);
  const [overrideMetas] = useState<Record<HexString, AddressMeta>>({});
  const [isOpen, toggleOpen] = useToggle(false);

  // Create account structure similar to AccountStructure
  useEffect(() => {
    const delegatee: AccountData = {
      type: 'account',
      name: '',
      address: proxy,
      createdAt: 0,
      delegatees: []
    };

    if (isPureProxy) {
      setProxyAccount({
        type: 'pure',
        isUnknownPure: true,
        name: pureName || DEFAULT_PURE_ACCOUNT_NAME,
        address: zeroAddress,
        createdAt: 0,
        delegatees: [
          {
            ...delegatee,
            proxyDelay: hasDelay ? 1 : 0, //mock,
            proxyNetwork: genesisHash,
            proxyType
          }
        ],
        createdBlock: '0',
        createdBlockHash: '0x',
        createdExtrinsicHash: '0x',
        createdExtrinsicIndex: 1,
        creator: '0x',
        disambiguationIndex: 0,
        network: genesisHash
      });
    } else if (proxied) {
      setProxyAccount({
        type: 'account',
        name: '',
        address: proxied,
        delegatees: [
          {
            ...delegatee,
            proxyDelay: hasDelay ? 1 : 0, //mock,
            proxyNetwork: genesisHash,
            proxyType
          }
        ],
        createdAt: 0
      });
    }
  }, [genesisHash, hasDelay, isPureProxy, proxied, proxy, proxyType, pureName]);

  const fetchFullStructure = async () => {
    setIsFetching(true);

    try {
      const proxyAccount = await service.account
        .getOmniChainDetails(proxy)
        .then((account) => transformAccount(chainSS58, account, true, genesisHash));

      if (isPureProxy) {
        setFullAccount({
          type: 'pure',
          isUnknownPure: true,
          name: pureName || DEFAULT_PURE_ACCOUNT_NAME,
          address: zeroAddress,
          createdAt: 0,
          delegatees: [
            {
              ...proxyAccount,
              proxyDelay: hasDelay ? 1 : 0, //mock,
              proxyNetwork: genesisHash,
              proxyType
            }
          ],
          createdBlock: '0',
          createdBlockHash: '0x',
          createdExtrinsicHash: '0x',
          createdExtrinsicIndex: 1,
          creator: '0x',
          disambiguationIndex: 0,
          network: genesisHash
        });
      } else if (proxied) {
        setFullAccount({
          type: 'account',
          name: '',
          address: proxied,
          delegatees: [
            {
              ...proxyAccount,
              proxyDelay: hasDelay ? 1 : 0, //mock,
              proxyNetwork: genesisHash,
              proxyType
            }
          ],
          createdAt: 0
        });
      }

      toggleOpen(true);
    } catch (error) {
      toastError(error);
    }

    setIsFetching(false);
  };

  return (
    <>
      <div className='rounded-medium bg-secondary relative h-[250px] pt-10'>
        {/* View Full Structure Button */}
        <Button
          isLoading={isFetching}
          size='sm'
          variant='ghost'
          color='primary'
          radius='full'
          className='bg-content1 absolute top-2.5 left-2.5 z-10'
          onPress={fetchFullStructure}
        >
          View Full Structure
        </Button>

        {/* Simple visualization - can be enhanced with actual diagram */}
        <AddressMetaContext.Provider value={overrideMetas}>
          <div className='flex h-full items-center justify-center'>
            {proxyAccount ? <AddressOverview showAddressNodeOperations={false} account={proxyAccount} /> : null}
          </div>
        </AddressMetaContext.Provider>
      </div>

      {fullAccount && (
        <Modal size='5xl' onClose={() => toggleOpen(false)} isOpen={isOpen}>
          <ModalContent>
            <ModalHeader>Full Structure</ModalHeader>
            <ModalBody className='pb-5'>
              <div className='rounded-medium bg-secondary h-[50dvh]'>
                {isOpen ? <AddressOverview showAddressNodeOperations={false} account={fullAccount} /> : null}
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default React.memo(ProxyAccountStructure);
