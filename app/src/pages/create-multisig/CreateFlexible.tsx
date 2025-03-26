// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { PrepareFlexible } from './types';

import { useSelectedAccountCallback } from '@/accounts/useSelectedAccount';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Address, AddressRow, InputAddress, LockContainer, LockItem } from '@/components';
import { utm } from '@/config';
import { CONNECT_ORIGIN, DETECTED_ACCOUNT_KEY } from '@/constants';
import { useNativeBalances } from '@/hooks/useBalances';
import { addTxToast } from '@/hooks/useTxQueue';
import { service, sleep } from '@/utils';
import { accountSource, useAccountSource, useWallet } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Stack, Typography } from '@mui/material';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addressToHex, signAndSend, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { Button, Tooltip } from '@mimir-wallet/ui';

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 2,
        marginRight: 1,
        fontSize: '0.875rem',
        fontWeight: 800,
        color: 'common.white',
        bgcolor: disabled ? 'secondary.main' : 'primary.main'
      }}
    >
      {children}
    </Box>
  );
}

function CreateFlexible({
  onCancel,
  prepare: {
    blockNumber: _blockNumber,
    creator,
    extrinsicIndex: _extrinsicIndex,
    name,
    pure: pureAccount,
    threshold,
    who
  }
}: Props) {
  const { api } = useApi();
  const { walletAccounts } = useWallet();
  const [signer, setSigner] = useState<string | undefined>(creator || walletAccounts[0].address);
  const [pure, setPure] = useState<string | null | undefined>(pureAccount);
  const [blockNumber, setBlockNumber] = useState<number | null | undefined>(_blockNumber);
  const [extrinsicIndex, setExtrinsicIndex] = useState<number | null | undefined>(_extrinsicIndex);
  const navigate = useNavigate();
  const selectAccount = useSelectedAccountCallback();
  const [allBalances] = useNativeBalances(signer);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const source = useAccountSource(signer);
  const [enoughtState, setEnoughtState] = useState<Record<string, boolean>>({});
  const isEnought = signer ? !!enoughtState[signer] : false;

  const reservedAmount = useMemo(() => {
    const baseReserve = api.consts.proxy.proxyDepositFactor.muln(3).add(api.consts.proxy.proxyDepositBase.muln(2));

    if (allBalances?.free.gte(api.consts.balances.existentialDeposit)) {
      baseReserve.iadd(api.consts.balances.existentialDeposit.divn(10)); // for gas
    } else {
      baseReserve.iadd(api.consts.balances.existentialDeposit.muln(1.1)); // mul 1.1 for gas
    }

    return baseReserve;
  }, [allBalances, api]);

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
        checkProxy: true
      });

      addTxToast({ events });

      events.once('finalized', async () => {
        while (true) {
          try {
            const data = await service.getFullAccount(pure);

            if (data) {
              break;
            }
          } catch {
            /* empty */
          }

          await sleep(3_000);
        }

        selectAccount(pure);

        navigate('/');
      });
      events.once('error', () => setLoadingSecond(false));
    },
    [api, navigate, selectAccount]
  );

  const createPure = useCallback(() => {
    if (!signer) return;
    if (!source) return;

    const extrinsic = api.tx.proxy.createPure('Any', 0, 0);
    const events = signAndSend(api, extrinsic, signer, () => enableWallet(source, CONNECT_ORIGIN), {
      beforeSend: async (extrinsic) => {
        if (!name) throw new Error('Please provide account name');

        await service.prepareMultisig(
          addressToHex(extrinsic.signer.toString()),
          extrinsic.hash.toHex(),
          name,
          threshold,
          who.map((address) => addressToHex(address))
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

        store.set(
          DETECTED_ACCOUNT_KEY,
          Array.from(
            new Set([...((store.get(DETECTED_ACCOUNT_KEY) as HexString[]) || []), u8aToHex(decodeAddress(_pure))])
          )
        );

        utm && service.utm(addressToHex(_pure), utm);
      }
    });
    events.once('error', () => {
      setLoadingFirst(false);
    });
  }, [signer, source, api, name, threshold, who, createMembers]);

  const killPure = useCallback(
    (pure: string, signer: string, blockNumber: number, extrinsicIndex: number) => {
      if (!source) return;

      const extrinsic = api.tx.proxy.proxy(
        pure,
        'Any',
        api.tx.proxy.killPure(signer, 'Any', 0, blockNumber, extrinsicIndex).toU8a()
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
    <Stack spacing={1.5}>
      <Typography variant='h3'>Create Flexible Multisig</Typography>
      <Typography>Please complete both steps to avoid unnecessary asset loss.</Typography>
      <Divider sx={{ marginY: 1.5 }} />
      <Accordion expanded={false}>
        <AccordionSummary>
          <ItemStep>1</ItemStep>
          {pure ? (
            <>
              <Box color='primary.main' component='span'>
                <Address shorten value={pure} />
              </Box>
              &nbsp; Created!
            </>
          ) : (
            <>Create Flexible Multisig Account</>
          )}
        </AccordionSummary>
      </Accordion>
      <Accordion expanded>
        <AccordionSummary>
          <ItemStep disabled={!pure}>2</ItemStep>
          Set Members ({threshold}/{who.length})
          <Tooltip
            classNames={{ content: 'max-w-[320px]' }}
            content={
              <span>
                Flexible Multisig is a Pure Proxy. In <b>‘set members’</b> step, you add the multisig account as its
                proxy and remove the creator's proxy, making the multi-signature its only controller. Then transfer some
                funds to keep Flexible alive.
              </span>
            }
            closeDelay={0}
          >
            <IconQuestion />
          </Tooltip>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {who.map((address) => (
              <Box key={address} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontSize='0.75rem' fontWeight={700}>
                  <AddressRow value={address} />
                </Typography>
                <Typography color='text.secondary' fontSize='0.75rem'>
                  <Address shorten value={address} />
                </Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Divider sx={{ marginY: 1.5 }} />
      <Typography fontWeight={700}>Transaction Initiator</Typography>
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

      <Divider sx={{ marginY: 1.5 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
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
      </Box>
    </Stack>
  );
}

export default React.memo(CreateFlexible);
