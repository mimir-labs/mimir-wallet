// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { BuildTx } from './hooks/useBuildTx';

import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Box, Divider, SvgIcon, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';

import { sign, signAndSend, TxEvents } from '@mimir-wallet/api';
import IconClock from '@mimir-wallet/assets/svg/icon-clock.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question-fill.svg?react';
import { addTxToast } from '@mimir-wallet/hooks/useTxQueue';
import { service } from '@mimir-wallet/utils';
import { useAccountSource } from '@mimir-wallet/wallet/useWallet';

import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import LockItem, { LockContainer } from '../LockItem';
import { toastError } from '../utils';

function SendTx({
  disabled,
  buildTx,
  note,
  onlySign,
  website,
  iconUrl,
  appName,
  onError,
  onFinalized,
  onResults,
  onSignature,
  beforeSend
}: {
  disabled?: boolean;
  buildTx: BuildTx;
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
  note?: string;
  onlySign?: boolean;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onError?: (error: unknown) => void;
  onSignature?: (signer: string, signature: HexString, tx: HexString, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const { txBundle, isLoading, error, hashSet, reserve, unreserve, delay } = buildTx;
  const [enoughtState, setEnoughtState] = useState<Record<string, boolean>>({});
  const source = useAccountSource(txBundle?.signer);

  const isEnought = Object.keys(reserve).reduce<boolean>((result, item) => result && !!enoughtState[item], true);

  const onConfirm = async () => {
    let events: TxEvents = new TxEvents();

    if (!txBundle) {
      return;
    }

    const { tx, signer } = txBundle;

    if (!signer) {
      return;
    }

    if (!source) {
      toastError('No available signing address.');

      return;
    }

    setLoading(true);

    try {
      for await (const item of hashSet) {
        await service.updateCalldata(item);
      }

      if (onlySign) {
        addTxToast({ events });

        const [signature, payload, extrinsicHash, signedTransaction] = await sign(tx, signer, source);

        await service.uploadWebsite(extrinsicHash.toHex(), website, appName, iconUrl, note);

        onSignature?.(signer, signature, signedTransaction, payload);
        events.emit('success', 'Sign success');
        setLoading(false);
      } else {
        events = signAndSend(tx, signer, source, {
          beforeSend
        });

        addTxToast({ events });

        events.on('inblock', (result) => {
          service.uploadWebsite(result.txHash.toHex(), website, appName, iconUrl, note);
          onResults?.(result);
        });
        events.on('error', (error) => {
          setLoading(false);
          onError?.(error);
        });

        events.on('finalized', (result) => {
          setLoading(false);
          onFinalized?.(result);
          setTimeout(() => {
            // clear all listener after 3s
            events.removeAllListeners();
          }, 3000);
        });
      }
    } catch (error) {
      onError?.(error);
      events.emit('error', error);
      setLoading(false);
    }
  };

  return (
    <>
      {(Object.keys(reserve).length > 0 || Object.keys(unreserve).length > 0 || Object.keys(delay).length > 0) && (
        <LockContainer>
          {Object.entries(delay).map(([address, delay], index) => (
            <Box
              key={`delay-${address}-${index}`}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 0.5, sm: 1 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                <SvgIcon color='primary' component={IconClock} inheritViewBox sx={{ opacity: 0.5 }} />
                <Typography>Review window</Typography>
                <Tooltip title='This transaction needs to be executed manually after review window ends.'>
                  <SvgIcon color='primary' component={IconQuestion} inheritViewBox sx={{ opacity: 0.5 }} />
                </Tooltip>
              </Box>

              <span>{delay.toString()} Blocks</span>
            </Box>
          ))}

          {Object.keys(delay).length > 0 && <Divider />}

          {Object.entries(reserve).map(([address, { value }], index) => (
            <LockItem
              key={`lock-${address}-${index}`}
              address={address}
              isUnLock={false}
              value={value}
              tip={
                <>
                  <FormatBalance value={value} /> in{' '}
                  <b>
                    <AddressName value={address} />
                  </b>{' '}
                  will be reserved for initiate transaction.
                </>
              }
              onEnoughtState={(address, isEnought) =>
                setEnoughtState((state) => ({ ...state, [address]: isEnought === true }))
              }
            />
          ))}
          {Object.entries(unreserve).map(([address, { value }], index) => (
            <LockItem
              key={`unlock-${address}-${index}`}
              address={address}
              isUnLock
              value={value}
              tip={
                <>
                  <FormatBalance value={value} /> in{' '}
                  <b>
                    <AddressName value={address} />
                  </b>{' '}
                  will be unreserved for execute transaction.
                </>
              }
            />
          ))}
        </LockContainer>
      )}

      {error ? (
        <Alert severity='error'>
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      ) : null}

      <LoadingButton
        fullWidth
        variant='contained'
        color='primary'
        onClick={error ? undefined : onConfirm}
        loading={loading || isLoading}
        disabled={!txBundle?.signer || !!error || !isEnought || disabled}
      >
        Submit
      </LoadingButton>
    </>
  );
}

export default React.memo(SendTx);
