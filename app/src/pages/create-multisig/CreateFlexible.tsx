// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { PrepareFlexible } from './types';

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

import { addressToHex, signAndSend, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

import CreateSuccess from './CreateSuccess';

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

function ItemStep({ children, disabled = false }: { disabled?: boolean; children: React.ReactNode }) {
  return (
    <div
      data-disabled={disabled}
      className='flex items-center justify-center w-10 h-10 rounded-full text-small font-extrabold text-white data-[disabled=true]:bg-primary/5 bg-primary'
    >
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
  const [signer, setSigner] = useState<string>('');
  const [pure, setPure] = useState<string | null | undefined>(pureAccount);
  const [blockNumber, setBlockNumber] = useState<number | null | undefined>(_blockNumber);
  const [extrinsicIndex, setExtrinsicIndex] = useState<number | null | undefined>(_extrinsicIndex);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const source = useAccountSource(signer);
  const [enoughtState, setEnoughtState] = useState<Record<string, boolean>>({});
  const isEnought = signer ? !!enoughtState[signer] : false;
  const [isSuccess, setIsSuccess] = useState(false);

  const reservedAmount = useMemo(
    () => api.consts.proxy.proxyDepositFactor.muln(3).add(api.consts.proxy.proxyDepositBase.muln(2)),
    [api]
  );

  const createMembers = useCallback(
    (pure: string, who: string[], signer: string, source: string, threshold: number) => {
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
          service.uploadWebsite(network, extrinsic.hash.toHex(), 'mimir://internal/create-flexible', 'Create Flexible');
        }
      });

      addTxToast({ events });

      events.once('inblock', async () => {
        await sleep(3000);

        while (true) {
          try {
            const data = await service.getDetails(network, pure);

            if (data) {
              break;
            }
          } catch {
            /* empty */
          }

          await sleep(3_000);
        }

        setIsSuccess(true);
      });
      events.once('error', () => setLoadingSecond(false));
    },
    [api, network]
  );

  const createPure = useCallback(() => {
    if (!signer) return;
    if (!source) return;

    const extrinsic = api.tx.proxy.createPure('Any', 0, 0);
    const events = signAndSend(api, extrinsic, signer, () => enableWallet(source, CONNECT_ORIGIN), {
      beforeSend: async (extrinsic) => {
        if (!name) throw new Error('Please provide account name');

        await service.prepareMultisig(
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

        utm && service.utm(network, addressToHex(_pure), utm);
      }
    });
    events.once('error', () => {
      setLoadingFirst(false);
    });
  }, [signer, source, api, name, network, threshold, who, multisigName, createMembers]);

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
      <div className='space-y-4'>
        <h2>Create Flexible Multisig</h2>
        <p>Please complete both steps to avoid unnecessary asset loss.</p>
        <Divider />
        <div className='flex items-center gap-2 p-2.5 rounded-large bg-secondary shadow-small'>
          <ItemStep>1</ItemStep>
          <div className='flex items-center gap-2 justify-between'>
            {pure ? (
              <>
                <span className='text-primary'>
                  <Address shorten value={pure} />
                </span>
                &nbsp; Created!
              </>
            ) : (
              <>Create Flexible Multisig Account</>
            )}
            <div className='flex gap-1 items-center text-small'>
              <img src={chain.icon} style={{ width: 20, height: 20 }} />
              {chain.name}
            </div>
          </div>
        </div>

        <div className='p-2.5 space-y-2.5 rounded-large bg-secondary shadow-small'>
          <div className='flex items-center gap-2'>
            <ItemStep disabled={!pure}>2</ItemStep>
            Set Members ({threshold}/{who.length})
            <Tooltip
              classNames={{ content: 'max-w-[320px]' }}
              content={
                <span>
                  Flexible Multisig is a Pure Proxy. In <b>‘set members’</b> step, you add the multisig account as its
                  proxy and remove the creator's proxy, making the multi-signature its only controller. Then transfer
                  some funds to keep Flexible alive.
                </span>
              }
              closeDelay={0}
            >
              <IconQuestion />
            </Tooltip>
          </div>

          {who.map((address) => (
            <div key={address} className='flex justify-between items-center'>
              <p className='text-tiny font-bold'>
                <AddressRow value={address} />
              </p>
              <p className='text-tiny text-foreground/50'>
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
                setEnoughtState((state) => ({ ...state, [address]: isEnought === true }))
              }
            />
          </LockContainer>
        )}

        <Divider />
        <div className='flex gap-2.5'>
          {pure ? (
            <Button
              color='danger'
              isDisabled={loadingFirst || loadingSecond}
              fullWidth
              isLoading={loadingCancel}
              onPress={() => {
                if (pure && signer && blockNumber && extrinsicIndex) {
                  killPure(pure, signer, blockNumber, extrinsicIndex);
                }
              }}
              variant='ghost'
            >
              Delete Account
            </Button>
          ) : (
            <Button fullWidth onPress={onCancel} color='primary' variant='ghost'>
              Cancel
            </Button>
          )}
          {pure ? (
            <Button
              isDisabled={!(signer && pure) || loadingCancel || !source}
              fullWidth
              color='primary'
              isLoading={loadingSecond}
              onPress={() => {
                if (pure && who && signer && source) {
                  createMembers(pure, who, signer, source, threshold);
                }
              }}
            >
              Set Members
            </Button>
          ) : (
            <Button
              isDisabled={!(signer && isEnought)}
              fullWidth
              color='primary'
              isLoading={loadingFirst}
              onPress={createPure}
            >
              Create
            </Button>
          )}
        </div>
      </div>

      {pure && <CreateSuccess isOpen={isSuccess} onClose={() => setIsSuccess(false)} address={pure} />}
    </>
  );
}

export default React.memo(CreateFlexible);
