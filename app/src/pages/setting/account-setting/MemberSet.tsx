// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultisigAccountData, PureAccountData } from '@/hooks/types';

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Input, TxButton } from '@/components';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo, useState } from 'react';

import { allEndpoints, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Alert, Avatar, Link } from '@mimir-wallet/ui';

import AccountSelect from '../../create-multisig/AccountSelect';
import { useSetMembers } from './useSetMembers';

function checkError(
  signatories: string[],
  isThresholdValid: boolean,
  hasSoloAccount: boolean
): [Error | null, Error | null] {
  return [
    signatories.length < 2
      ? new Error('Please select at least two members')
      : hasSoloAccount
        ? null
        : new Error('You need add at least one local account'),
    isThresholdValid ? null : new Error(`Threshold must great than 1 and less equal than ${signatories.length}`)
  ];
}

function MemberSet({
  account,
  pureAccount,
  disabled
}: {
  account: MultisigAccountData;
  pureAccount?: PureAccountData;
  disabled?: boolean;
}) {
  const { api, chainSS58, genesisHash, network, chain } = useApi();
  const { hasSoloAccount, isThresholdValid, select, setThreshold, signatories, threshold, unselect, unselected } =
    useSetMembers(
      account.members.map((item) => item.address),
      account.threshold
    );
  const [[memberError, thresholdError], setErrors] = useState<[Error | null, Error | null]>([null, null]);

  const checkField = useCallback((): boolean => {
    const errors = checkError(signatories, isThresholdValid, hasSoloAccount);

    setErrors(errors);

    return !(errors[0] || errors[1]);
  }, [hasSoloAccount, isThresholdValid, signatories]);

  const _onChangeThreshold = useCallback(
    (value: string) => {
      setThreshold(Number(value));
    },
    [setThreshold]
  );
  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );

  return (
    <div className='space-y-5'>
      {!pureAccount && (
        <div className='text-warning font-bold'>Multisig account can's change threshold and members</div>
      )}
      <div
        className='space-y-5'
        style={{
          opacity: !pureAccount || disabled ? 0.5 : undefined,
          pointerEvents: !pureAccount || disabled ? 'none' : undefined
        }}
      >
        <div className='bg-secondary rounded-medium p-2.5'>
          <AccountSelect
            withSearch
            scroll
            accounts={unselected}
            ignoreAccounts={signatories}
            onClick={select}
            title='Addresss book'
            type='add'
          />
        </div>

        <div className='bg-secondary rounded-medium p-2.5'>
          <AccountSelect
            scroll={false}
            accounts={signatories}
            onClick={unselect}
            title={`Multisig Members(${signatories.length})`}
            type='delete'
          />

          {memberError && <div className='text-danger'>{memberError.message}</div>}
        </div>
        <Input
          defaultValue={String(threshold)}
          error={thresholdError}
          label='Threshold'
          onChange={_onChangeThreshold}
        />

        <Alert
          hideIconWrapper
          color='warning'
          description={
            <ul className='list-outside list-disc'>
              <li>
                <span className='inline-flex items-center'>
                  You are trying to modify memebers on&nbsp;
                  <Avatar src={chain.icon} className='h-4 w-4 bg-transparent' />
                  &nbsp;
                  {chain.name}.
                </span>
              </li>
              {remoteProxyChain ? (
                <li>
                  You can use this proxy on{' '}
                  <img
                    style={{ display: 'inline', verticalAlign: 'middle' }}
                    width={16}
                    height={16}
                    src={remoteProxyChain.icon}
                  />{' '}
                  {remoteProxyChain.name} due to{' '}
                  <Link isExternal underline='always' href='https://blog.kchr.de/ecosystem-proxy/'>
                    Remote Proxy
                  </Link>
                </li>
              ) : null}
            </ul>
          }
          classNames={{
            title: 'font-bold text-small',
            description: 'text-foreground/50 text-tiny'
          }}
          icon={<IconInfo />}
          title='Notice'
          variant='flat'
        />

        <TxButton
          fullWidth
          color='primary'
          accountId={pureAccount?.address}
          getCall={() => {
            if (!checkField()) {
              throw new Error('Please fill in all fields');
            }

            if (!pureAccount) {
              throw new Error('Account not found');
            }

            const oldMultiAddress = account.address;
            const newMultiAddress = encodeMultiAddress(signatories, threshold, chainSS58);

            return api.tx.utility.batchAll([
              api.tx.proxy.addProxy(newMultiAddress, 0, 0).method.toU8a(),
              api.tx.proxy.removeProxy(oldMultiAddress, 0, 0).method.toU8a()
            ]);
          }}
          website='mimir://internal/setup'
          beforeSend={() =>
            service.multisig.createMultisig(
              network,
              signatories.map((address) => u8aToHex(decodeAddress(address))),
              threshold,
              account.name
            )
          }
        >
          Confirm
        </TxButton>
      </div>
    </div>
  );
}

export default MemberSet;
