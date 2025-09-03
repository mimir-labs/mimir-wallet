// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { Address, AddressName } from '@/components';
import { MIGRATION_DOCS_URL } from '@/constants';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { useMemo } from 'react';

import { addressToHex, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

import IdentityIcon from '../../components/IdentityIcon';

interface MigratedAccount {
  address: string;
  name?: string;
  tokenIcon?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceChain: string;
  destChain: string;
  accounts?: MigratedAccount[];
}

function AccountItem({ account }: { account: MigratedAccount }) {
  const { open } = useCopyAddress();

  return (
    <div className='border-divider-300 flex h-10 w-full items-center gap-[5px] rounded-[10px] border bg-white px-2.5'>
      {/* Account Icon */}
      <div className='h-5 w-5 flex-shrink-0'>
        <IdentityIcon value={account.address} size={20} />
      </div>

      {/* Account Name */}
      <div className='w-[50%]'>
        <AddressName value={account.address} />
      </div>

      {/* Address */}
      <div className='text-small min-w-0 flex-1 text-right' onClick={() => open(account.address)}>
        <Address value={account.address} shorten />
      </div>
    </div>
  );
}

function MigrationModal({ isOpen, onClose, destChain, accounts = [] }: Props) {
  const { networks } = useNetworks();
  const { accounts: localAccounts, metas } = useAccount();

  const destNetwork = useMemo(() => networks.find((network) => network.key === destChain), [networks, destChain]);

  // Filter local accounts that are proxied and have delegatees on the destChain
  const filteredAccounts = useMemo(() => {
    if (!destNetwork) return [];

    const proxiedAccounts: MigratedAccount[] = [];

    localAccounts.forEach((account) => {
      const addressHex = addressToHex(account.address);
      const meta = metas[addressHex];

      // Check if account is proxied and has delegatees
      if (meta?.isProxied && account.delegatees?.length > 0) {
        // Check if any delegatee is on the destChain
        const hasDestChainDelegatee = account.delegatees.some(
          (delegatee) => delegatee.proxyNetwork === destNetwork.genesisHash
        );

        if (hasDestChainDelegatee) {
          proxiedAccounts.push({
            address: account.address,
            name: account.name || meta.name || 'Unnamed',
            tokenIcon: destNetwork.tokenIcon
          });
        }
      }
    });

    return proxiedAccounts;
  }, [localAccounts, metas, destNetwork]);

  const displayAccounts = accounts.length > 0 ? accounts : filteredAccounts;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        <ModalHeader>
          <h2 className='text-[20px] font-extrabold'>Migrated Accounts</h2>
        </ModalHeader>

        <ModalBody className='py-0'>
          <div className='flex flex-col gap-4'>
            <p className='text-small'>
              Due to the Asset Hub Migration, the following accounts's asset migrated to Asset Hub. Please use them on{' '}
              {destNetwork?.name} instead.
            </p>

            <Divider />

            <div className='flex flex-col gap-2.5'>
              {displayAccounts.length > 0 ? (
                displayAccounts.map((account, index) => (
                  <AccountItem key={`${account.address}-${index}`} account={account} />
                ))
              ) : (
                <div className='py-8 text-center'>No migrated accounts found for {destNetwork?.name}</div>
              )}
            </div>

            <Divider />
            <a className='text-inherit underline' target='_blank' href={MIGRATION_DOCS_URL}>
              What's Assethub Migration?
            </a>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} fullWidth>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MigrationModal;
