// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AddressRow, Empty, InputAddress } from '@/components';
import { toastError } from '@/components/utils';
import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useManageProposerFilter } from '@/hooks/useProposeFilter';
import { service } from '@/utils';
import { accountSource } from '@/wallet/useWallet';
import { useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@mimir-wallet/ui';

function AddModal({
  type,
  deleteProposer,
  account,
  isOpen,
  onClose,
  refetch
}: {
  type: 'add' | 'delete';
  deleteProposer?: string;
  account: AccountData;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}) {
  const { genesisHash } = useApi();
  const [proposer, setProposer] = useState<string | undefined>();
  const [signer, setSigner] = useState<string | undefined>();
  const filtered = useManageProposerFilter(account);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (proposer: string) => {
    if (!signer) {
      return;
    }

    const source = accountSource(signer);

    if (!source) {
      toastError('Please select a valid signer address');

      return;
    }

    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    if (!injectSigner) {
      toastError(`Please connect to the wallet: ${walletConfig[source]?.name || source}`);

      return;
    }

    if (!injectSigner.signRaw) {
      toastError(`Wallet ${walletConfig[source]?.name || source} does not support signRaw`);

      return;
    }

    try {
      setLoading(true);
      const time = new Date().toUTCString();
      const message = `${type === 'add' ? 'Setting Proposer:' : 'Removing Proposer:'}
Proposer: ${proposer}
Time: ${time}
Genesis Hash: ${genesisHash}`;

      const result = await injectSigner.signRaw({
        address: signer,
        data: message,
        type: 'bytes'
      });

      await service[type === 'add' ? 'addProposer' : 'removeProposer'](
        account.address,
        proposer,
        result.signature,
        signer,
        time
      );
      refetch();
      onClose();
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Set New Proposer</ModalHeader>
        <Divider />
        <ModalBody className='space-y-5'>
          <InputAddress
            label={type === 'add' ? 'Proposer' : 'Proposer to delete'}
            disabled={type === 'delete'}
            placeholder='Please input proposer address. e.g.5G789...'
            value={type === 'add' ? proposer : deleteProposer}
            onChange={type === 'add' ? setProposer : undefined}
            helper={
              type === 'add'
                ? 'The proposer can submit the transaction without any signatures. Once the members approve, the transaction can be initiated.'
                : 'The proposer can submit the transaction without any signatures. Once the members approve, the transaction can be initiated.'
            }
          />
          <InputAddress
            label='Select signer'
            placeholder='Please select signer address. e.g.5G789...'
            isSign
            filtered={filtered}
            value={signer}
            onChange={setSigner}
          />
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            fullWidth
            color={type === 'add' ? 'primary' : 'danger'}
            variant={type === 'add' ? 'solid' : 'flat'}
            isDisabled={!signer || (type === 'add' && !proposer)}
            isLoading={loading}
            onPress={
              type === 'add'
                ? proposer
                  ? () => handleConfirm(proposer)
                  : undefined
                : deleteProposer
                  ? () => handleConfirm(deleteProposer)
                  : undefined
            }
          >
            {type === 'add' ? 'Confirm' : 'Delete'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ProposerSet({ account, refetch }: { account: AccountData; refetch: () => void }) {
  const { genesisHash } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);
  const [type, setType] = useState<'add' | 'delete'>('add');
  const [deleteProposer, setDeleteProposer] = useState<string>();

  const proposers = useMemo(
    () => account.proposers?.filter((item) => item.network === genesisHash),
    [account.proposers, genesisHash]
  );

  return (
    <>
      <div className='space-y-5'>
        <Table
          removeWrapper
          classNames={{
            th: 'bg-transparent text-small font-bold',
            td: 'text-small'
          }}
        >
          <TableHeader>
            <TableColumn>Proposer</TableColumn>
            <TableColumn>Creator</TableColumn>
            <TableColumn align='end'>Operation</TableColumn>
          </TableHeader>

          <TableBody
            items={proposers}
            emptyContent={<Empty className='text-foreground' height='150px' label='No proposers' />}
          >
            {(item) => (
              <TableRow key={item.proposer}>
                <TableCell>
                  <AddressRow shorten withCopy iconSize={20} value={item.proposer} />
                </TableCell>
                <TableCell>
                  <AddressRow shorten withCopy iconSize={20} value={item.creator} />
                </TableCell>
                <TableCell align='right'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    color='danger'
                    onPress={() => {
                      toggleOpen(true);
                      setDeleteProposer(item.proposer);
                      setType('delete');
                    }}
                  >
                    <IconDelete />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Button
          fullWidth
          onPress={() => {
            toggleOpen(true);
            setType('add');
          }}
        >
          Add Proposer
        </Button>
      </div>

      <AddModal
        type={type}
        deleteProposer={deleteProposer}
        isOpen={isOpen}
        onClose={toggleOpen}
        account={account}
        refetch={refetch}
      />
    </>
  );
}

export default ProposerSet;
