// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressRow } from '@/components';
import { useWallet } from '@/wallet/useWallet';
import { useMemo, useState } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import {
  Button,
  buttonSpinner,
  DialogDescription,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@mimir-wallet/ui';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAddress: string) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
  filteredAddress?: string;
}

function AccountSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Choose an Extension account',
  description = 'Select an account to finish the subscription.',
  confirmText = 'Confirm',
  isLoading = false,
  filteredAddress
}: AccountSelectionModalProps) {
  const { chainSS58 } = useApi();
  const { walletAccounts } = useWallet();

  // Filter and format wallet accounts for Select
  const accountOptions = useMemo(() => {
    const list = walletAccounts.map((account) => ({
      address: encodeAddress(account.address, chainSS58),
      name: account.name || 'Unknown Account',
      source: account.source
    }));

    return filteredAddress ? list.filter((item) => addressEq(item.address, filteredAddress)) : list;
  }, [walletAccounts, filteredAddress, chainSS58]);

  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(() => {
    return accountOptions.at(0)?.address;
  });

  const handleConfirm = () => {
    if (selectedAddress) {
      onConfirm(selectedAddress);
    }
  };

  return (
    <Modal size='md' isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <DialogDescription>{description}</DialogDescription>

        <ModalBody className='gap-y-5'>
          {/* Account Selection using Select */}
          <Select value={selectedAddress} onValueChange={setSelectedAddress}>
            <SelectTrigger className='[&>span[data-slot=select-value]]:overflow-visible'>
              <SelectValue placeholder='Select an account' />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((account) => (
                <SelectItem key={account.address} value={account.address}>
                  <AddressRow
                    className='[&_.AddressRow-Address]:text-foreground/50 [&_.AddressRow-Name]:font-normal'
                    iconSize={20}
                    withAddress
                    withName
                    shorten
                    value={account.address}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ModalBody>
        {/* Divider */}
        <Divider />
        <ModalFooter>
          {/* Confirm Button */}
          <Button fullWidth color='primary' onClick={handleConfirm} disabled={isLoading || !selectedAddress}>
            {isLoading ? buttonSpinner : null}
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AccountSelectionModal;
