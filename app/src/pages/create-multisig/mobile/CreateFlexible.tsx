// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { PrepareFlexible } from '../types';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Address, AddressRow, InputAddress, LockContainer, LockItem } from '@/components';
import { utm } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { addTxToast } from '@/hooks/useTxQueue';
import { sleep } from '@/utils';
import { accountSource, useAccountSource } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import { u8aEq } from '@polkadot/util';
import { encodeMultiAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { addressToHex, signAndSend, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

import AccountVisibility from '../components/AccountVisibility';
import CreateSuccess from '../components/CreateSuccess';

interface Props {
  prepare: PrepareFlexible;
  onCancel: () => void;
}

function filterPureAccount(api: ApiPromise, events: EventRecord[]): string | undefined {
  for (const { event } of events) {
    if (api.events.proxy.PureCreated.is(event)) {
      return event.data.pure.toString();
    }
  }

  return undefined;
}

function ItemStep({
  children,
  step,
  disabled = false
}: {
  disabled?: boolean;
  step: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className='bg-primary/5 flex w-full items-center gap-2.5 rounded-full'>
      <div
        data-disabled={disabled}
        className='data-[disabled=true]:bg-primary/5 bg-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white'
      >
        {step}
      </div>
      {children}
    </div>
  );
}

function CreateFlexible({
  onCancel,
  prepare: {
    blockNumber: _blockNumber,
    creator,
    extrinsicIndex: _extrinsicIndex,
    name,
    multisigName,
    pure: pureAccount,
    threshold,
    who
  }
}: Props) {
  const { api, network, chain } = useApi();
  const [signer, setSigner] = useState<string>(creator || '');
  const [pure, setPure] = useState<string | null | undefined>(pureAccount);
  const [blockNumber, setBlockNumber] = useState<number | null | undefined>(_blockNumber);
  const [extrinsicIndex, setExtrinsicIndex] = useState<number | null | undefined>(_extrinsicIndex);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const source = useAccountSource(signer);
  const [enoughtState, setEnoughtState] = useState<Record<HexString, boolean | 'pending'>>({});
  const isEnought = signer ? !!enoughtState[addressToHex(signer)] : false;
  const [isOpen, toggleOpen] = useToggle(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reservedAmount = useMemo(
    () => api.consts.proxy.proxyDepositFactor.muln(3).add(api.consts.proxy.proxyDepositBase.muln(2)),
    [api]
  );

  const createMembers = (pure: string, who: string[], signer: string, source: string, threshold: number) => {
    const extrinsic = api.tx.utility.batchAll([
      api.tx.balances.transferKeepAlive(
        pure,
        api.consts.proxy.proxyDepositFactor.muln(2).add(api.consts.proxy.proxyDepositBase)
      ),
      api.tx.proxy.proxy(
        pure,
        'Any',
        api.tx.proxy.addProxy(encodeMultiAddress(who, threshold, api.registry.chainSS58), 'Any', 0).method.toU8a()
      ),
      api.tx.proxy.proxy(pure, 'Any', api.tx.proxy.removeProxy(signer, 'Any', 0).method.toU8a())
    ]);

    setLoadingSecond(true);
    const events = signAndSend(api, extrinsic, signer, () => enableWallet(source, CONNECT_ORIGIN), {
      checkProxy: true,
      beforeSend: async (extrinsic) => {
        service.transaction.uploadWebsite(
          network,
          extrinsic.hash.toHex(),
          'mimir://internal/create-flexible',
          'Create Flexible'
        );
      }
    });

    addTxToast({ events });

    events.once('inblock', async () => {
      await sleep(3000);

      while (true) {
        try {
          const data = await service.account.getDetails(network, pure);

          if (data) {
            break;
          }
        } catch {
          /* empty */
        }

        await sleep(3_000);
      }

      toggleOpen(true);
    });
    events.once('error', () => setLoadingSecond(false));
  };

  const createPure = () => {
    if (!signer) return;
    if (!source) return;

    const extrinsic = api.tx.proxy.createPure('Any', 0, 0);
    const events = signAndSend(api, extrinsic, signer, () => enableWallet(source, CONNECT_ORIGIN), {
      beforeSend: async (extrinsic) => {
        if (!name) throw new Error('Please provide account name');

        await service.multisig.prepareMultisig(
          network,
          addressToHex(extrinsic.signer.toString()),
          extrinsic.hash.toHex(),
          name,
          threshold,
          who.map((address) => addressToHex(address)),
          multisigName || undefined
        );
      }
    });

    addTxToast({ events });

    setLoadingFirst(true);
    events.once('inblock', (result) => {
      setLoadingFirst(false);

      const _pure = filterPureAccount(api, result.events);

      setPure(_pure);

      api.rpc.chain.getBlock(result.status.asInBlock).then((block) => {
        setBlockNumber(block.block.header.number.toNumber());
        setExtrinsicIndex(block.block.extrinsics.findIndex((item) => u8aEq(item.hash, extrinsic.hash)));
      });

      if (_pure) {
        createMembers(_pure, who, signer, source, threshold);

        utm && service.account.utm(network, addressToHex(_pure), utm);
      }
    });
    events.once('error', () => {
      setLoadingFirst(false);
    });
  };

  const killPure = useCallback(
    (pure: string, signer: string, blockNumber: number, extrinsicIndex: number) => {
      if (!source) return;

      const extrinsic = api.tx.proxy.proxy(
        pure,
        'Any',
        api.tx.proxy.killPure(signer, 'Any', 0, blockNumber, extrinsicIndex).method.toU8a()
      );

      const events = signAndSend(api, extrinsic, signer, () => enableWallet(source, CONNECT_ORIGIN), {
        checkProxy: true
      });

      addTxToast({ events });

      setLoadingCancel(true);
      events.once('inblock', () => {
        setLoadingCancel(true);
        onCancel();
      });
      events.once('error', () => setLoadingCancel(false));
    },
    [source, api, onCancel]
  );

  return (
    <>
      <div className='mx-auto flex w-full max-w-[500px] flex-col gap-5'>
        <Button className='self-start' onClick={onCancel} variant='ghost'>
          {'<'} Back
        </Button>

        <div className='bg-content1 border-secondary shadow-medium rounded-[20px] border-1 p-4 sm:p-5'>
          <div className='space-y-4'>
            <h2>Add Pure Proxy</h2>
            <p>Please complete both steps to avoid unnecessary asset loss.</p>
            <Divider />
            <div className='bg-secondary shadow-small flex items-center gap-2 rounded-[20px] p-2.5'>
              <ItemStep step={1}>
                <div className='flex items-center justify-between gap-2'>
                  {pure ? (
                    <b>
                      <span className='text-primary'>
                        <Address shorten value={pure} />
                      </span>
                      &nbsp; Created!
                    </b>
                  ) : (
                    <b>Add Pure Proxy</b>
                  )}
                  <div className='flex items-center gap-1 text-sm'>
                    <img src={chain.icon} style={{ width: 20, height: 20 }} />
                    {chain.name}
                  </div>
                </div>
              </ItemStep>
            </div>

            <div className='bg-secondary shadow-small space-y-2.5 rounded-[20px] p-2.5'>
              <div className='flex items-center gap-2'>
                <ItemStep disabled={!pure} step={2}>
                  <b>
                    Set Signers ({threshold}/{who.length})
                  </b>
                  <Tooltip
                    classNames={{ content: 'max-w-[320px]' }}
                    content={
                      <span>
                        Flexible Multisig is a Pure Proxy. In <b>‘set signers’</b> step, you add the multisig account as
                        its proxy and remove the creator's proxy, making the multi-signature its only controller. Then
                        transfer some funds to keep Flexible alive.
                      </span>
                    }
                  >
                    <IconQuestion className='text-primary/50' />
                  </Tooltip>
                </ItemStep>
              </div>

              {who.map((address) => (
                <div key={address} className='flex items-center justify-between'>
                  <p className='text-xs font-bold'>
                    <AddressRow value={address} />
                  </p>
                  <p className='text-foreground/50 text-xs'>
                    <Address shorten value={address} />
                  </p>
                </div>
              ))}
            </div>
            <Divider className='mt-5' />
            <p className='font-bold'>Transaction Initiator</p>
            <InputAddress
              disabled={!!pure}
              filtered={creator ? [creator] : who.filter((address) => !!accountSource(address))}
              isSign
              onChange={setSigner}
              value={signer}
            />

            {signer && (
              <LockContainer>
                <LockItem
                  address={signer}
                  tip='Flexible Multisig is a pure proxy, so it requires executing some on-chain operations to complete its creation.'
                  value={reservedAmount}
                  onEnoughtState={(address, isEnought) =>
                    setEnoughtState((state) => ({ ...state, [addressToHex(address)]: isEnought }))
                  }
                />
              </LockContainer>
            )}

            <Divider />
            <div className='flex gap-2.5'>
              {pure ? (
                <Button
                  color='danger'
                  disabled={loadingFirst || loadingSecond}
                  fullWidth
                  onClick={() => {
                    if (pure && signer && blockNumber && extrinsicIndex) {
                      killPure(pure, signer, blockNumber, extrinsicIndex);
                    }
                  }}
                  variant='ghost'
                >
                  Delete Account
                </Button>
              ) : (
                <Button fullWidth onClick={onCancel} color='primary' variant='ghost'>
                  Cancel
                </Button>
              )}
              {pure ? (
                <Button
                  disabled={!(signer && pure) || loadingCancel || !source}
                  fullWidth
                  color='primary'
                  onClick={() => {
                    if (pure && who && signer && source) {
                      createMembers(pure, who, signer, source, threshold);
                    }
                  }}
                >
                  Set Signers
                </Button>
              ) : (
                <Button disabled={!(signer && isEnought)} fullWidth color='primary' onClick={createPure}>
                  Create
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {pure && (
        <>
          <AccountVisibility
            isOpen={isOpen}
            onConfirm={() => {
              toggleOpen(false);
              setIsSuccess(true);
            }}
            pureAddress={pure}
            multisigAddress={encodeMultiAddress(who, threshold, api.registry.chainSS58)}
          />
          <CreateSuccess isOpen={isSuccess} onClose={() => setIsSuccess(false)} address={pure} />
        </>
      )}
    </>
  );
}

export default React.memo(CreateFlexible);
