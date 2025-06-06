// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayloadValue, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { BuildTx } from './hooks/useBuildTx';

import IconClock from '@/assets/svg/icon-clock.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { CONNECT_ORIGIN } from '@/constants';
import { addTxToast } from '@/hooks/useTxQueue';
import { useAccountSource } from '@/wallet/useWallet';
import { enableWallet } from '@/wallet/utils';
import React, { useState } from 'react';

import { addressToHex, sign, signAndSend, TxEvents, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Alert, Button, Divider, Tooltip } from '@mimir-wallet/ui';

import AddressName from '../AddressName';
import FormatBalance from '../FormatBalance';
import LockItem, { LockContainer } from '../LockItem';
import { toastError } from '../utils';
import { useDryRunResult } from './hooks/useDryRunResult';

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
  const { api, network } = useApi();
  const [loading, setLoading] = useState(false);
  const { txBundle, isLoading, error, hashSet, reserve, unreserve, delay } = buildTx;
  const [enoughtState, setEnoughtState] = useState<Record<HexString, boolean | 'pending'>>({});
  const source = useAccountSource(txBundle?.signer);
  const { data: dryRunResult } = useDryRunResult(txBundle);

  const isEnought = Object.keys(reserve).reduce<boolean>(
    (result, item) => result && !!enoughtState[addressToHex(item)],
    true
  );
  const isEnoughtPending = Object.keys(reserve).reduce<boolean>(
    (result, item) => result || enoughtState[addressToHex(item)] === 'pending',
    false
  );

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
        await service.updateCalldata(network, item);
      }

      if (onlySign) {
        addTxToast({ events });

        const [signature, payload, extrinsicHash, signedTransaction] = await sign(api, tx, signer, () =>
          enableWallet(source, CONNECT_ORIGIN)
        );

        await service.uploadWebsite(network, extrinsicHash.toHex(), website, appName, iconUrl, note, relatedBatches);

        onSignature?.(signer, signature, signedTransaction, payload);
        events.emit('success', 'Sign success');
        setLoading(false);
      } else {
        events = signAndSend(api, tx, signer, () => enableWallet(source, CONNECT_ORIGIN), {
          beforeSend
        });

        addTxToast({ events });

        events.once('signed', (_, extrinsic) => {
          service.uploadWebsite(network, extrinsic.hash.toHex(), website, appName, iconUrl, note, relatedBatches);
        });
        events.once('inblock', (result) => {
          onResults?.(result);
        });
        events.once('error', (error) => {
          setLoading(false);
          onError?.(error);
        });

        events.once('finalized', (result) => {
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
                <IconClock className='text-primary opacity-50 w-4 h-4' />
                <p>Review window</p>
                <Tooltip
                  content='This transaction needs to be executed manually after review window ends.'
                  closeDelay={0}
                >
                  <IconQuestion className='text-primary/40' />
                </Tooltip>
              </div>

              <span>{delay.toString()} Blocks</span>
            </div>
          ))}

          {Object.keys(delay).length > 0 && <Divider className='bg-primary/5' />}

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
                setEnoughtState((state) => ({ ...state, [addressToHex(address)]: isEnought }))
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

      {error ? <Alert color='danger' title={<span className='break-all'>{error.message}</span>} /> : null}

      {!isEnought && !isEnoughtPending ? <Alert color='danger' title='Insufficient funds' /> : null}

      {Object.keys(delay).length > 0 ? (
        <Alert color='warning' title='This transaction can be executed after review window' />
      ) : null}

      {dryRunResult && !dryRunResult.success ? <Alert color='danger' title={dryRunResult.error.message} /> : null}

      <Button
        fullWidth
        variant='solid'
        color='primary'
        onPress={error ? undefined : onConfirm}
        isLoading={loading || isLoading}
        isDisabled={
          !txBundle?.signer || !!error || !isEnought || disabled || (dryRunResult ? !dryRunResult.success : false)
        }
      >
        Submit
      </Button>
    </>
  );
}

export default React.memo(SendTx);
