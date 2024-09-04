// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { PrepareFlexible } from './types';

import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Stack,
  SvgIcon,
  Tooltip,
  Typography
} from '@mui/material';
import keyring from '@polkadot/ui-keyring';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from 'store';

import IconQuestion from '@mimir-wallet/assets/svg/icon-question-fill.svg?react';
import { Address, AddressRow, InputAddress, LockContainer, LockItem } from '@mimir-wallet/components';
import { utm } from '@mimir-wallet/config';
import { DETECTED_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { TxToastCtx, useApi, useCall, useSelectedAccountCallback } from '@mimir-wallet/hooks';
import { addressToHex, getAddressMeta, service, signAndSend } from '@mimir-wallet/utils';

import { createMultisig } from './CreateStatic';

interface Props {
  prepare: PrepareFlexible;
  onCancel: () => void;
}

function filterDefaultAccount(who: string[]): string | undefined {
  for (const account of keyring.getAccounts()) {
    for (const address of who) {
      if (!account.meta.isMultisig && addressEq(address, account.address)) {
        return address;
      }
    }
  }

  return undefined;
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
  const [signer, setSigner] = useState(creator || filterDefaultAccount(who));
  const [pure, setPure] = useState<string | null | undefined>(pureAccount);
  const [blockNumber, setBlockNumber] = useState<number | null | undefined>(_blockNumber);
  const [extrinsicIndex, setExtrinsicIndex] = useState<number | null | undefined>(_extrinsicIndex);
  const navigate = useNavigate();
  const selectAccount = useSelectedAccountCallback();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [signer]);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const { addToast } = useContext(TxToastCtx);

  const reservedAmount = useMemo(() => {
    const baseReserve = api.consts.proxy.proxyDepositFactor.muln(3).add(api.consts.proxy.proxyDepositBase.muln(2));

    if (
      allBalances &&
      allBalances.freeBalance.add(allBalances.reservedBalance).gte(api.consts.balances.existentialDeposit)
    ) {
      baseReserve.iadd(api.consts.balances.existentialDeposit.divn(10)); // for gas
    } else {
      baseReserve.iadd(api.consts.balances.existentialDeposit.muln(1.1)); // mul 1.1 for gas
    }

    return baseReserve;
  }, [allBalances, api]);

  const createMembers = useCallback(
    (pure: string, who: string[], signer: string, threshold: number, name: string) => {
      const extrinsic = api.tx.utility.batchAll([
        api.tx.balances.transferKeepAlive(
          pure,
          api.consts.proxy.proxyDepositFactor.muln(2).add(api.consts.proxy.proxyDepositBase)
        ),
        api.tx.proxy.proxy(
          pure,
          'Any',
          api.tx.proxy.addProxy(encodeMultiAddress(who, threshold, api.registry.chainSS58), 'Any', 0)
        ),
        api.tx.proxy.proxy(pure, 'Any', api.tx.proxy.removeProxy(signer, 'Any', 0))
      ]);

      setLoadingSecond(true);
      const events = signAndSend(extrinsic, signer, { checkProxy: true });

      addToast({ events });

      events.once('inblock', () => {
        createMultisig(who, threshold, name);
        keyring.addExternal(pure, {
          isMimir: true,
          isMultisig: true,
          isFlexible: true,
          name,
          who,
          threshold,
          creator: signer,
          genesisHash: api.genesisHash.toHex(),
          isPending: true
        });

        store.set(
          DETECTED_ACCOUNT_KEY,
          Array.from([...(store.get(DETECTED_ACCOUNT_KEY) || []), u8aToHex(decodeAddress(pure))])
        );

        selectAccount(pure);

        navigate('/');
      });
      events.once('error', () => setLoadingSecond(false));
    },
    [addToast, api, navigate, selectAccount]
  );

  const createPure = useCallback(() => {
    if (!signer) return;

    const extrinsic = api.tx.proxy.createPure('Any', 0, 0);
    const events = signAndSend(extrinsic, signer, {
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

    addToast({ events });

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
        createMembers(_pure, who, signer, threshold, name);

        utm && service.utm(addressToHex(_pure), utm);
      }
    });
    events.once('error', () => {
      setLoadingFirst(false);
    });
  }, [api, addToast, createMembers, name, signer, threshold, who]);

  const killPure = useCallback(
    (pure: string, signer: string, blockNumber: number, extrinsicIndex: number) => {
      const extrinsic = api.tx.proxy.proxy(
        pure,
        'Any',
        api.tx.proxy.killPure(signer, 'Any', 0, blockNumber, extrinsicIndex)
      );

      const events = signAndSend(extrinsic, signer, { checkProxy: true });

      addToast({ events });

      setLoadingCancel(true);
      events.once('inblock', () => {
        setLoadingCancel(true);
        onCancel();
      });
      events.once('error', () => setLoadingCancel(false));
    },
    [api, addToast, onCancel]
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
            title={
              <>
                Flexible Multisig is a Pure Proxy. In <b>‘set members’</b> step, you add the multisig account as its
                proxy and remove the creator's proxy, making the multi-signature its only controller. Then transfer some
                funds to keep Flexible alive.
              </>
            }
          >
            <SvgIcon
              component={IconQuestion}
              inheritViewBox
              sx={{ marginLeft: 1, color: 'primary.main', opacity: 0.5 }}
            />
          </Tooltip>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {who.map((address) => (
              <Box key={address} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontSize='0.75rem' fontWeight={700}>
                  <AddressRow size='small' value={address} />
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
        filtered={creator ? [creator] : who.filter((address) => !getAddressMeta(address).isMultisig)}
        isSign
        onChange={setSigner}
        value={signer}
      />
      <LockContainer>
        <LockItem
          address={signer}
          tip='Flexible Multisig is a pure proxy, so it requires executing some on-chain operations to complete its creation.'
          value={reservedAmount}
        />
      </LockContainer>
      <Divider sx={{ marginY: 1.5 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {pure ? (
          <LoadingButton
            color='error'
            disabled={loadingFirst || loadingSecond}
            fullWidth
            loading={loadingCancel}
            onClick={() => {
              if (pure && signer && blockNumber && extrinsicIndex) {
                killPure(pure, signer, blockNumber, extrinsicIndex);
              }
            }}
            variant='outlined'
          >
            Delete Account
          </LoadingButton>
        ) : (
          <Button fullWidth onClick={onCancel} variant='outlined'>
            Cancel
          </Button>
        )}
        {pure ? (
          <LoadingButton
            disabled={!signer || !pure || loadingCancel}
            fullWidth
            loading={loadingSecond}
            onClick={() => {
              if (pure && who && signer) {
                createMembers(pure, who, signer, threshold, name);
              }
            }}
          >
            Set Members
          </LoadingButton>
        ) : (
          <LoadingButton disabled={!signer} fullWidth loading={loadingFirst} onClick={createPure}>
            Create
          </LoadingButton>
        )}
      </Box>
    </Stack>
  );
}

export default React.memo(CreateFlexible);
