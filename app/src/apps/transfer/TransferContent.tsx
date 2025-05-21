// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell, FormatBalance, Input, InputAddress, InputNetwork, InputToken } from '@/components';
import { useAssetInfo } from '@/hooks/useAssets';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatUnits } from '@/utils';
import React, { useEffect, useMemo } from 'react';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, Avatar, Button, Skeleton, Switch } from '@mimir-wallet/ui';

import { useTransferBalance } from './useTransferBalances';

function TransferContent({
  isPure,
  token,
  amount,
  isAmountValid,
  sending,
  recipient,
  defaultAssetId,
  network,
  keepAlive,
  disabledRecipient,
  filterSending,
  setNetwork,
  setSending,
  setRecipient,
  setAmount,
  toggleKeepAlive,
  setToken
}: {
  amount: string;
  token?: TransferToken;
  isAmountValid: boolean;
  isPure: boolean;
  sending: string;
  recipient: string;
  network: string;
  keepAlive: boolean;
  disabledRecipient?: boolean;
  defaultAssetId?: string;
  filterSending?: string[];
  setSending: (sending: string) => void;
  setNetwork: (network: string) => void;
  setAmount: (amount: string) => void;
  toggleKeepAlive: (keepAlive: boolean) => void;
  setToken: (token: TransferToken) => void;
  setRecipient?: (recipient: string) => void;
}) {
  const { api, chain } = useApi();
  const { networks } = useNetworks();
  const upSm = useMediaQuery('sm');
  const [format, sendingBalances, isSendingFetched] = useTransferBalance(token, sending);
  const [, assetExistentialDeposit] = useAssetInfo(network, token?.isNative ? null : token?.assetId);
  const [recipientAccount] = useQueryAccountOmniChain(recipient);
  const recipientNetwork =
    recipientAccount?.type === 'pure'
      ? networks.find((item) => item.genesisHash === recipientAccount.network)
      : undefined;

  const isRecipientSupported = useMemo(() => {
    return recipientAccount?.type === 'pure' ? recipientAccount.network === chain.genesisHash : true;
  }, [recipientAccount, chain]);

  const existentialDeposit = token?.isNative ? api.consts.balances.existentialDeposit : assetExistentialDeposit;

  useEffect(() => {
    setAmount('');
  }, [setAmount]);

  return (
    <>
      <InputAddress
        format={format}
        isSign
        filtered={filterSending}
        label='Sending From'
        onChange={setSending}
        placeholder='Sender'
        value={sending}
      />

      {disabledRecipient ? (
        <div className='flex flex-col gap-2'>
          <p className='font-bold'>To</p>
          <div className='rounded-medium bg-secondary p-2'>
            <AddressCell shorten={!upSm} showType value={recipient} withCopy withAddressBook />
          </div>
        </div>
      ) : (
        <InputAddress
          format={format}
          label='Recipient'
          onChange={setRecipient}
          placeholder='Recipient'
          value={recipient}
        />
      )}

      <InputNetwork disabled={isPure} label='Select Network' network={network} setNetwork={setNetwork} />

      <InputToken
        network={network}
        label='Select an asset'
        address={sending}
        onChange={setToken}
        defaultAssetId={defaultAssetId}
      />

      <Input
        error={isAmountValid ? null : new Error('Invalid number')}
        key={token?.assetId}
        label={
          <div className='flex items-center justify-between'>
            Amount
            {!isSendingFetched ? (
              <Skeleton className='w-[50px] h-[14px] rounded-small' />
            ) : (
              <span className='opacity-50'>
                Balance: <FormatBalance format={format} value={sendingBalances} />
              </span>
            )}
          </div>
        }
        value={amount}
        onChange={setAmount}
        placeholder='Input amount'
        endAdornment={
          <Button
            size='sm'
            variant='ghost'
            className='rounded-small p-1.5 py-[1px] min-w-0'
            onPress={() => {
              setAmount(
                keepAlive
                  ? formatUnits(sendingBalances.sub(existentialDeposit), format[0])
                  : formatUnits(sendingBalances, format[0])
              );
            }}
          >
            Max
          </Button>
        }
      />

      <div className='flex justify-end'>
        <Switch size='sm' isSelected={keepAlive} onValueChange={(value) => toggleKeepAlive(value)}>
          Keep Sender Alive
        </Switch>
      </div>

      {!isRecipientSupported && (
        <Alert color='danger'>
          <div>
            You are about to transfer to a pure account only exist on{' '}
            <Avatar
              src={recipientNetwork?.icon}
              style={{ display: 'inline-block', width: 16, height: 16, backgroundColor: 'transparent' }}
            />
            &nbsp;
            {recipientNetwork?.name}, please change to correct network.
          </div>
        </Alert>
      )}
    </>
  );
}

export default React.memo(TransferContent);
