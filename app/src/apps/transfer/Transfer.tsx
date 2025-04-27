// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { useAccount } from '@/accounts/useAccount';
import { useAllAccounts } from '@/accounts/useGroupAccounts';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { FormatBalance, Input, InputAddress, InputNetwork, InputToken, TxButton } from '@/components';
import { useAssetInfo } from '@/hooks/useAssets';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useQueryParam } from '@/hooks/useQueryParams';
import { formatUnits, parseUnits } from '@/utils';
import { BN, isHex } from '@polkadot/util';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, Avatar, Button, Divider, Skeleton, Switch } from '@mimir-wallet/ui';

import { useTransferBalance } from './useTransferBalances';

function Transfer({
  isPure,
  sending,
  defaultAssetId,
  network,
  setNetwork,
  setSending
}: {
  isPure: boolean;
  sending: string;
  network: string;
  defaultAssetId?: string;
  setSending: (sending: string) => void;
  setNetwork: (network: string) => void;
}) {
  const { api, chain } = useApi();
  const { networks } = useNetworks();
  const navigate = useNavigate();
  const [toParam] = useQueryParam<string>('to');
  const [recipient, setRecipient] = useState<string>(toParam || '');
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const filtered = useAllAccounts();
  const { addresses } = useAccount();
  const [token, setToken] = useState<TransferToken>();
  const [format, sendingBalances, isSendingFetched] = useTransferBalance(token, sending);
  const [keepAlive, toggleKeepAlive] = useToggle(true);
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

  const isInsufficientBalance = keepAlive
    ? sendingBalances.sub(existentialDeposit).lt(new BN(parseUnits(amount, format[0]).toString()))
    : sendingBalances.lt(new BN(parseUnits(amount, format[0]).toString()));

  useEffect(() => {
    setAmount('');
  }, [setAmount]);

  const getCall = useCallback(() => {
    if (recipient && sending && amount && token) {
      if (!isAmountValid) {
        throw new Error('Invalid amount');
      }

      if (token.isNative) {
        return keepAlive
          ? api.tx.balances.transferKeepAlive(recipient, parseUnits(amount, format[0])).method
          : api.tx.balances.transferAllowDeath(recipient, parseUnits(amount, format[0])).method;
      }

      if (api.tx.assets || api.tx.foreignAssets) {
        return keepAlive
          ? api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transferKeepAlive(
              token.assetId,
              recipient,
              parseUnits(amount, format[0])
            ).method
          : api.tx[isHex(token.assetId) ? 'foreignAssets' : 'assets'].transfer(
              token.assetId,
              recipient,
              parseUnits(amount, format[0])
            ).method;
      }

      if (api.tx.tokens) {
        return keepAlive
          ? api.tx.tokens.transferKeepAlive(recipient, token.assetId, parseUnits(amount, format[0])).method
          : api.tx.tokens.transfer(recipient, token.assetId, parseUnits(amount, format[0])).method;
      }
    }

    throw new Error('Invalid arguments');
  }, [amount, api, format, isAmountValid, keepAlive, recipient, sending, token]);

  return (
    <div className='w-full max-w-[500px] mx-auto p-4 sm:p-5'>
      <Button onPress={() => navigate(-1)} variant='ghost'>
        {'<'} Back
      </Button>
      <div className='p-4 sm:p-6 rounded-large shadow-medium mt-4 bg-content1'>
        <div className='space-y-5'>
          <h3>Transfer</h3>
          <InputAddress
            filtered={filtered}
            format={format}
            isSign
            label='Sending From'
            onChange={setSending}
            placeholder='Sender'
            value={sending}
          />
          <Divider />
          <InputAddress
            filtered={filtered.concat(addresses.map((item) => item.address))}
            format={format}
            label='Recipient'
            onChange={setRecipient}
            placeholder='Recipient'
            value={recipient}
          />

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

          <TxButton
            fullWidth
            color={isInsufficientBalance ? 'danger' : 'primary'}
            isDisabled={!(amount && recipient && isAmountValid && token)}
            accountId={sending}
            website='mimir://app/transfer'
            getCall={getCall}
          >
            {isInsufficientBalance ? `Insufficient ${format[1] || ''} balance` : 'Review'}
          </TxButton>
        </div>
      </div>
    </div>
  );
}

export default Transfer;
