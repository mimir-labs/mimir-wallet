// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultiTransferData } from './types';

import {
  type FunctionCallHandler,
  isFunctionCallArray,
  toFunctionCallString,
} from '@mimir-wallet/ai-assistant';
import { isValidAddress, NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Divider } from '@mimir-wallet/ui';
import { useCallback, useState } from 'react';

import MultiTransferContent from './MultiTransferContent';

import { useAccount } from '@/accounts/useAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';
import { useInputNetwork } from '@/hooks/useInputNetwork';

function MultiTransfer() {
  const { current } = useAccount();
  const supportedNetworks = useAddressSupportedNetworks(current);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((n) => n.key),
  );
  const [data, setData] = useState<MultiTransferData[]>([['', '', '']]);

  const handleBatchTransferForm = useCallback<FunctionCallHandler>(
    (event) => {
      // No need to check event.name - only 'batchTransferForm' events arrive here

      // Validate recipient addresses
      const addRecipient = event.arguments.addRecipient;

      if (addRecipient && isFunctionCallArray(addRecipient)) {
        const invalidAddress = addRecipient
          .filter((item) => {
            if (!item || typeof item !== 'object') return false;
            const recipient =
              'recipient' in item
                ? toFunctionCallString(item.recipient)
                : undefined;

            return recipient && !isValidAddress(recipient);
          })
          .map((item) => {
            if (item && typeof item === 'object' && 'recipient' in item) {
              return toFunctionCallString(item.recipient) || '';
            }

            return '';
          });

        if (invalidAddress.length > 0) {
          console.error(
            `Invalid recipients address format ${invalidAddress.join(',')}`,
          );

          return;
        }
      }

      // Update recipients
      if (addRecipient && isFunctionCallArray(addRecipient)) {
        const recipients: MultiTransferData[] = addRecipient
          .filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              'recipient' in item &&
              'amount' in item,
          )
          .map((item) => {
            const recipient =
              toFunctionCallString(
                (item as { recipient: unknown }).recipient,
              ) || '';
            const amount = (item as { amount: unknown }).amount;
            const amountStr =
              typeof amount === 'number'
                ? amount.toString()
                : String(amount || '');

            return [recipient, 'native', amountStr] as MultiTransferData;
          });

        setData((prev) => {
          const next = [...prev];

          recipients.forEach((recipient) => {
            const emptyIndex = next.findIndex(
              ([address, assetId, amount]) => !address && !assetId && !amount,
            );

            if (emptyIndex !== -1) {
              next[emptyIndex] = recipient;
            } else {
              next.push(recipient);
            }
          });

          return next;
        });
      }

      // Update network
      const networkValue = toFunctionCallString(event.arguments.network);

      if (networkValue) {
        setNetwork(networkValue);
      }
    },
    [setNetwork],
  );

  useRouteDependentHandler(
    'batchTransferForm',
    '/explorer/mimir%3A%2F%2Fapp%2Fmulti-transfer',
    handleBatchTransferForm,
    {
      displayName: 'Multi Transfer',
    },
  );

  return (
    <NetworkProvider network={network}>
      <div className="card-root p-3 sm:p-6 flex flex-col gap-5">
        <h4 className="font-extrabold">Multi Transfer</h4>

        <Divider />

        <MultiTransferContent
          data={data}
          sending={current || ''}
          network={network}
          supportedNetworks={supportedNetworks?.map((n) => n.key)}
          setNetwork={setNetwork}
          setData={setData}
        />
      </div>
    </NetworkProvider>
  );
}

export default MultiTransfer;
