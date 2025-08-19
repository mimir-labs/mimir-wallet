// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell, FormatBalance, Input, InputAddress, InputNetwork, InputToken } from '@/components';
import { MigrationTip } from '@/features/assethub-migration';
import { useAssetInfo } from '@/hooks/useAssets';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatUnits } from '@/utils';
import React, { useEffect, useMemo } from 'react';

import { remoteProxyRelations, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Avatar, Button, Chip, Skeleton, Switch } from '@mimir-wallet/ui';

import { useTransferBalance } from './useTransferBalances';

function TransferContent({
  token,
  amount,
  isAmountValid,
  sending,
  recipient,
  assetId,
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
  sending: string;
  recipient: string;
  network: string;
  keepAlive: boolean;
  disabledRecipient?: boolean;
  assetId?: string;
  filterSending?: string[];
  setSending: (sending: string) => void;
  setNetwork: (network: string) => void;
  setAmount: (amount: string) => void;
  toggleKeepAlive: (keepAlive: boolean) => void;
  setToken: (token: string) => void;
  setRecipient?: (recipient: string) => void;
}) {
  const { api, chain, genesisHash } = useApi();
  const { networks } = useNetworks();
  const upSm = useMediaQuery('sm');
  const [format, sendingBalances, isSendingFetched] = useTransferBalance(token, sending);
  const [, assetExistentialDeposit] = useAssetInfo(network, token?.isNative ? null : token?.assetId);
  const { meta: sendingMeta } = useAddressMeta(sending);
  const { meta: recipientMeta } = useAddressMeta(recipient);
  const [recipientAccount] = useQueryAccountOmniChain(recipient);
  const recipientNetwork =
    recipientAccount?.type === 'pure'
      ? networks.find((item) => item.genesisHash === recipientAccount.network)
      : undefined;

  // for migration tip

  const isRecipientSupported = useMemo(() => {
    return recipientAccount?.type === 'pure'
      ? recipientAccount.network === chain.genesisHash ||
          chain.genesisHash === remoteProxyRelations[recipientAccount.network]
      : true;
  }, [recipientAccount, chain]);

  const existentialDeposit = token?.isNative ? api.consts.balances.existentialDeposit : assetExistentialDeposit;

  useEffect(() => {
    setAmount('');
  }, [setAmount]);

  return (
    <>
      <InputAddress
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
          <div className='bg-secondary rounded-[10px] p-2'>
            <AddressCell shorten={!upSm} showType value={recipient} withCopy withAddressBook />
          </div>
        </div>
      ) : (
        <InputAddress label='Recipient' onChange={setRecipient} placeholder='Recipient' value={recipient} />
      )}

      <InputNetwork
        label='Select Network'
        network={network}
        setNetwork={setNetwork}
        endContent={
          sendingMeta && sendingMeta.isPure && remoteProxyRelations[sendingMeta.pureCreatedAt]
            ? {
                [remoteProxyRelations[sendingMeta.pureCreatedAt]]: (
                  <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
                    Remote Proxy
                  </Chip>
                )
              }
            : undefined
        }
        helper={
          !!(
            recipientMeta &&
            recipientMeta.isPure &&
            remoteProxyRelations[recipientMeta.pureCreatedAt] === genesisHash
          ) ||
          !!(sendingMeta && sendingMeta.isPure && remoteProxyRelations[sendingMeta.pureCreatedAt] === genesisHash) ? (
            <div className='text-foreground'>
              🥷✨Yep, remote proxy lets you borrow a ninja from another chain — smooth and stealthy! 🕶️
            </div>
          ) : null
        }
      />

      <InputToken network={network} label='Select an asset' address={sending} onChange={setToken} assetId={assetId} />

      <Input
        error={isAmountValid ? null : new Error('Invalid number')}
        key={token?.assetId}
        label={
          <div className='flex items-center justify-between'>
            Amount
            {!isSendingFetched ? (
              <Skeleton className='h-[14px] w-[50px] rounded-[5px]' />
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
            className='min-w-0 rounded-[5px] p-1.5 py-[1px]'
            onClick={() => {
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
        <Alert variant='destructive'>
          <AlertTitle>
            You are about to transfer to a pure account only exist on{' '}
            <Avatar
              src={recipientNetwork?.icon}
              style={{ display: 'inline-block', width: 16, height: 16, backgroundColor: 'transparent' }}
            />
            &nbsp;
            {recipientNetwork?.name}, please change to correct network.
          </AlertTitle>
        </Alert>
      )}

      <MigrationTip type='transfer' chain={network} />
    </>
  );
}

export default React.memo(TransferContent);
