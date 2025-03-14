// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { BuildTx } from './hooks/useBuildTx';

import { sign, signAndSend, TxEvents } from '@/api';
import IconClock from '@/assets/svg/icon-clock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { addTxToast } from '@/hooks/useTxQueue';
import { service } from '@/utils';
import { useAccountSource } from '@/wallet/useWallet';
import React, { useState } from 'react';

import { Alert, Button, Divider, Tooltip } from '@mimir-wallet/ui';

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
  relatedBatches,
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
  relatedBatches?: number[];
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

        await service.uploadWebsite(extrinsicHash.toHex(), website, appName, iconUrl, note, relatedBatches);

        onSignature?.(signer, signature, signedTransaction, payload);
        events.emit('success', 'Sign success');
        setLoading(false);
      } else {
        events = signAndSend(tx, signer, source, {
          beforeSend
        });

        addTxToast({ events });

        events.on('signed', (_, extrinsic) => {
          service.uploadWebsite(extrinsic.hash.toHex(), website, appName, iconUrl, note, relatedBatches);
        });
        events.on('inblock', (result) => {
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
            <div key={`delay-${address}-${index}`} className='flex items-center justify-between gap-[5px] sm:gap-2.5'>
              <div className='flex items-center gap-[5px] sm:gap-2.5'>
                <IconClock className='text-primary opacity-50' />
                <p>Review window</p>
                <Tooltip
                  content='This transaction needs to be executed manually after review window ends.'
                  closeDelay={0}
                >
                  <IconQuestion className='text-primary' />
                </Tooltip>
              </div>

              <span>{delay.toString()} Blocks</span>
            </div>
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

      {error ? <Alert color='danger' title={<p className='break-all'>{error.message}</p>} /> : null}

      <Button
        fullWidth
        variant='solid'
        color='primary'
        onPress={error ? undefined : onConfirm}
        isLoading={loading || isLoading}
        isDisabled={!txBundle?.signer || !!error || !isEnought || disabled}
      >
        Submit
      </Button>
    </>
  );
}

export default React.memo(SendTx);
