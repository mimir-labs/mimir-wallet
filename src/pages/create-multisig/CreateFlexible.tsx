// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { PrepareFlexible } from './types';

import { LoadingButton } from '@mui/lab';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import keyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as IconQuestion } from '@mimirdev/assets/svg/icon-question.svg';
import { Address, AddressRow, InputAddress, LockContainer, LockItem, useToastPromise } from '@mimirdev/components';
import { useApi } from '@mimirdev/hooks';
import { getAddressMeta, service, signAndSend } from '@mimirdev/utils';

interface Props {
  prepare: PrepareFlexible;
  onCancel: () => void;
}

function filterDefaultAccount(who: string[]): string | undefined {
  for (const account of keyring.getAccounts()) {
    for (const address of who) {
      if (addressEq(address, account.address)) {
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

function CreateFlexible({ onCancel, prepare: { creator, name, pure: pureAccount, threshold, who } }: Props) {
  const { api } = useApi();
  const [signer, setSigner] = useState(creator || filterDefaultAccount(who));
  const [pure, setPure] = useState<string | null | undefined>(pureAccount);
  const navigate = useNavigate();

  const reservedAmount = useMemo(() => api.consts.proxy.proxyDepositFactor.muln(2).iadd(api.consts.proxy.proxyDepositBase), [api]);

  const [loadingSecond, createMembers] = useToastPromise(
    useCallback(
      async (pure: string, who: string[], signer: string, threshold: number) => {
        const extrinsic = api.tx.utility.batchAll([
          api.tx.balances.transferKeepAlive(pure, api.consts.proxy.proxyDepositFactor.muln(2)),
          api.tx.proxy.proxy(pure, 'Any', api.tx.proxy.addProxy(encodeMultiAddress(who, threshold), 'Any', 0)),
          api.tx.proxy.proxy(pure, 'Any', api.tx.proxy.removeProxy(signer, 'Any', 0))
        ]);

        await signAndSend(extrinsic, signer, { checkProxy: true });

        navigate('/');
      },
      [api, navigate]
    ),
    { pending: 'Set Members...', success: 'Set Members success!' }
  );

  const [loadingFirst, createPure] = useToastPromise(
    useCallback(async () => {
      if (!signer) return;

      const extrinsic = api.tx.proxy.createPure('Any', 0, 0);

      const result = await signAndSend(extrinsic, signer, {
        beforeSend: async (extrinsic) => {
          if (!name) throw new Error('Please provide account name');

          await service.prepareMultisig(
            u8aToHex(decodeAddress(extrinsic.signer.toString())),
            extrinsic.hash.toHex(),
            name,
            threshold,
            who.map((address) => u8aToHex(decodeAddress(address)))
          );
        }
      });

      const _pure = filterPureAccount(api, result.events);

      setPure(_pure);

      if (_pure) {
        createMembers(_pure, who, signer, threshold);
      }
    }, [api, createMembers, name, signer, threshold, who]),
    { pending: 'Creating Pure Account...', success: 'Create Pure success!' }
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
      <Accordion expanded={true}>
        <AccordionSummary>
          <ItemStep disabled={!pure}>2</ItemStep>
          Set Members ({threshold}/{who.length})
          <Tooltip
            title={
              <>
                Flexible Multisig is a Pure Proxy. In <b>‘set members’</b> step, you add the multisig account as its proxy and remove the {"creator's"} proxy, making the multi-signature its only
                controller. Then transfer some funds to keep Flexible alive.
              </>
            }
          >
            <SvgIcon component={IconQuestion} inheritViewBox sx={{ marginLeft: 1, color: 'primary.main', opacity: 0.5 }} />
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
      <InputAddress filtered={creator ? [creator] : who.filter((address) => !getAddressMeta(address).isMultisig)} onChange={setSigner} value={signer} />
      <LockContainer>
        <LockItem address={signer} value={reservedAmount} />
      </LockContainer>
      <Divider sx={{ marginY: 1.5 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {pure ? (
          <LoadingButton
            disabled={!signer || !pure}
            fullWidth
            loading={loadingSecond}
            onClick={() => {
              if (pure && who && signer) {
                createMembers(pure, who, signer, threshold);
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
        <LoadingButton fullWidth onClick={onCancel} variant='outlined'>
          Cancel
        </LoadingButton>
      </Box>
    </Stack>
  );
}

export default React.memo(CreateFlexible);
