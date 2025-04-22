// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGroupAccounts } from '@/accounts/useGroupAccounts';
import { CONNECT_ORIGIN } from '@/constants';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useNativeBalances } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { parseUnits } from '@/utils';
import { useAccountSource } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import React, { useCallback, useEffect, useState } from 'react';

import { signAndSend, SubApiRoot, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from '@mimir-wallet/ui';

import AddressCell from './AddressCell';
import Input from './Input';
import InputAddress from './InputAddress';
import InputNetwork from './InputNetwork';

interface Props {
  defaultNetwork?: string;
  open: boolean;
  defaultValue?: string | { toString: () => string };
  receipt?: string;
  onClose: () => void;
}

function Content({
  receipt,
  sending,
  setSending,
  setValue,
  value,
  network,
  setNetwork
}: {
  sending?: string;
  setSending: React.Dispatch<string>;
  value?: string;
  setValue: React.Dispatch<string>;
  receipt?: string;
  network: string;
  setNetwork: React.Dispatch<string>;
}) {
  const [balances] = useNativeBalances(sending);
  const { injected } = useGroupAccounts();

  return (
    <ModalBody>
      <div className='flex flex-col gap-5'>
        <InputAddress
          withBalance
          balance={balances?.transferrable}
          filtered={injected}
          isSign
          label='Sending From'
          onChange={setSending}
          value={sending}
        />
        <div className='flex flex-col gap-2'>
          <p className='font-bold'>To</p>
          <div className='rounded-md bg-secondary p-2'>
            <AddressCell shorten showType value={receipt} withCopy withAddressBook />
          </div>
        </div>

        <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

        <Input label='Amount' onChange={setValue} value={value} />
      </div>
    </ModalBody>
  );
}

function Action({
  onClose,
  receipt,
  sending,
  value
}: {
  receipt?: string;
  value?: string;
  sending?: string;
  onClose: () => void;
}) {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const source = useAccountSource(sending);
  const handleClick = useCallback(() => {
    if (receipt && sending && value) {
      setLoading(true);

      if (source) {
        const events = signAndSend(
          api,
          api.tx.balances.transferKeepAlive(receipt, parseUnits(value, api.registry.chainDecimals[0])),
          sending,
          () => enableWallet(source, CONNECT_ORIGIN)
        );

        events.on('inblock', () => {
          setLoading(false);
          onClose();
        });
        events.on('error', () => {
          setLoading(false);
        });
      }
    }
  }, [source, api, onClose, receipt, sending, value]);

  return (
    <ModalFooter>
      <Button fullWidth onPress={onClose} variant='ghost'>
        Cancel
      </Button>
      <Button isLoading={loading} isDisabled={!(receipt && sending && value)} fullWidth onPress={handleClick}>
        Submit
      </Button>
    </ModalFooter>
  );
}

function Fund({ defaultValue, defaultNetwork, onClose, open, receipt }: Props) {
  const [sending, setSending] = useState<string>();
  const { enableNetwork } = useNetworks();
  const [[value], setValue] = useInputNumber(defaultValue?.toString() || '0', false, 0);
  const supportedNetworks = useAddressSupportedNetworks(receipt);
  const [network, setNetwork] = useInputNetwork(
    defaultNetwork,
    supportedNetworks?.map((item) => item.key)
  );

  useEffect(() => {
    if (open) enableNetwork(network);
  }, [enableNetwork, network, open]);

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={
        open
          ? ({ apiState: { chain } }) => (
              <Modal size='lg' onClose={onClose} isOpen={open}>
                <ModalContent>
                  <ModalBody>
                    <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
                  </ModalBody>
                </ModalContent>
              </Modal>
            )
          : undefined
      }
    >
      <Modal size='lg' onClose={onClose} isOpen={open}>
        <ModalContent>
          <ModalHeader>Fund</ModalHeader>
          <Content
            receipt={receipt}
            sending={sending}
            setSending={setSending}
            setValue={setValue}
            value={value}
            network={network}
            setNetwork={setNetwork}
          />
          <Action onClose={onClose} receipt={receipt} sending={sending} value={value} />
        </ModalContent>
      </Modal>
    </SubApiRoot>
  );
}

export default React.memo(Fund);
