// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs } from '../types';

import { Address, TxButton } from '@/components';
import { toastSuccess } from '@/components/utils';
import { useTxQueue } from '@/hooks/useTxQueue';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';

import SafetyWarningModal from '../components/SafetyWarningModal';
import { useProxySafetyCheck } from '../hooks/useProxySafetyCheck';

function SubmitProxy({
  proxied,
  proxyArgs,
  setProxyArgs
}: {
  proxied?: string;
  proxyArgs: ProxyArgs[];
  setProxyArgs: React.Dispatch<React.SetStateAction<ProxyArgs[]>>;
}) {
  const { api, network } = useApi();
  const [alertOpen, toggleAlertOpen] = useToggle(false);
  const { addQueue } = useTxQueue();
  const [detectedControllers, setDetectedControllers] = useState<string[]>([]);

  // Use proxy safety check hook
  const { checkSafety } = useProxySafetyCheck();

  const handleSubmit = useCallback(() => {
    if (!(proxyArgs.length && proxied)) {
      return;
    }

    toggleAlertOpen(false);

    const call =
      proxyArgs.length > 1
        ? api.tx.utility.batchAll(
            proxyArgs.map((item) => api.tx.proxy.addProxy(item.delegate, item.proxyType as any, item.delay))
          ).method
        : api.tx.proxy.addProxy(proxyArgs[0].delegate, proxyArgs[0].proxyType as any, proxyArgs[0].delay).method;

    addQueue({
      call,
      accountId: proxied,
      website: 'mimir://internal/setup',
      network,
      onResults: (result) => {
        setProxyArgs([]);
        const events = result.events.filter((item) => api.events.proxy.ProxyAdded.is(item.event));

        if (events.length > 0) {
          toastSuccess(
            <div className='ml-4 flex flex-col gap-1'>
              <p>
                <b>Proxy Added</b>
              </p>
              <p className='text-xs'>
                <Address value={proxied} shorten /> added {proxyArgs.length} new proxy
              </p>
              <Link className='text-primary text-xs no-underline' to={`/?address=${proxied.toString()}&tab=structure`}>
                Account Structure{'>'}
              </Link>
            </div>
          );
        }
      }
    });
  }, [addQueue, api, network, proxied, proxyArgs, setProxyArgs, toggleAlertOpen]);

  const handleClickAction = useAsyncFn(async () => {
    // Check all proxy delegates for safety issues
    const allControllers: Set<string> = new Set();

    for (const { delegate } of proxyArgs) {
      const safetyResult = await checkSafety(delegate);

      if (safetyResult.hasWarnings) {
        safetyResult.indirectControllers.forEach((controller) => allControllers.add(controller));
      }
    }

    if (allControllers.size > 0) {
      setDetectedControllers(Array.from(allControllers));
      toggleAlertOpen(true);
    } else {
      handleSubmit();
    }
  }, [checkSafety, handleSubmit, proxyArgs, toggleAlertOpen]);

  return (
    <>
      <TxButton
        fullWidth
        color='primary'
        disabled={!(proxyArgs.length && proxied)}
        accountId={proxied}
        overrideAction={handleClickAction[1]}
      >
        Confirm
      </TxButton>

      <SafetyWarningModal
        isOpen={alertOpen}
        onClose={() => toggleAlertOpen(false)}
        onConfirm={handleSubmit}
        indirectControllers={detectedControllers}
      />
    </>
  );
}

export default React.memo(SubmitProxy);
