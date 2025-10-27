// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  type FunctionCallHandler,
  functionCallManager,
  isFunctionCallArray,
  toFunctionCallString
} from '@mimir-wallet/ai-assistant';
import { isValidAddress, SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Spinner } from '@mimir-wallet/ui';

import MultiTransferContent from './MultiTransferContent';
import { MultiTransferData } from './types';

function MultiTransfer() {
  const navigate = useNavigate();
  const { current } = useAccount();
  const [network, setNetwork] = useInputNetwork();
  const [sending, setSending] = useState(current || '');
  const [data, setData] = useState<MultiTransferData[]>([['', '', '']]);

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'batchTransferForm') return;

      // Validate sending address
      const sendingAddress = toFunctionCallString(event.arguments.sending);

      if (sendingAddress && !isValidAddress(sendingAddress)) {
        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: false,
          error: `Invalid sending address format ${sendingAddress}`
        });
      }

      // Validate recipient addresses
      const addRecipient = event.arguments.addRecipient;

      if (addRecipient && isFunctionCallArray(addRecipient)) {
        const invalidAddress = addRecipient
          .filter((item) => {
            if (!item || typeof item !== 'object') return false;
            const recipient = 'recipient' in item ? toFunctionCallString(item.recipient) : undefined;

            return recipient && !isValidAddress(recipient);
          })
          .map((item) => {
            if (item && typeof item === 'object' && 'recipient' in item) {
              return toFunctionCallString(item.recipient) || '';
            }

            return '';
          });

        if (invalidAddress.length > 0) {
          return functionCallManager.respondToFunctionCall({
            id: event.id,
            success: false,
            error: `Invalid recipients address format ${invalidAddress.join(',')}`
          });
        }
      }

      // Update sending address
      if (sendingAddress) {
        setSending(sendingAddress);
      }

      // Update recipients
      if (addRecipient && isFunctionCallArray(addRecipient)) {
        const recipients: MultiTransferData[] = addRecipient
          .filter((item) => item && typeof item === 'object' && 'recipient' in item && 'amount' in item)
          .map((item) => {
            const recipient = toFunctionCallString((item as { recipient: unknown }).recipient) || '';
            const amount = (item as { amount: unknown }).amount;
            const amountStr = typeof amount === 'number' ? amount.toString() : String(amount || '');

            return [recipient, 'native', amountStr] as MultiTransferData;
          });

        setData((prev) => {
          const next = [...prev];

          recipients.forEach((recipient) => {
            const emptyIndex = next.findIndex(([address, assetId, amount]) => !address && !assetId && !amount);

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

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: 'Success update'
      });
    };

    return functionCallManager.onFunctionCall(handler);
  }, [setNetwork]);

  return (
    <SubApiRoot
      network={network}
      Fallback={({ apiState: { chain } }) => (
        <div className='bg-content1 mx-auto mt-16 flex w-[500px] max-w-full items-center justify-center rounded-[20px] py-10'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <div className='mx-auto w-full max-w-[900px] p-4 sm:p-5'>
        <Button onClick={() => navigate(-1)} variant='ghost'>
          {'<'} Back
        </Button>
        <div className='border-secondary bg-content1 shadow-medium mt-4 flex flex-col gap-5 rounded-[20px] border-1 p-4 sm:p-5'>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between'>
              <h3>Multi Transfer</h3>

              <Button asChild color='primary' variant='light'>
                <Link to={`/explorer/${encodeURIComponent('mimir://app/transfer')}`}>
                  <IconTransfer />
                  Solo-Transfer
                </Link>
              </Button>
            </div>
          </div>
          <Divider />

          <MultiTransferContent
            data={data}
            sending={sending}
            network={network}
            setSending={setSending}
            setNetwork={setNetwork}
            setData={setData}
          />
        </div>
      </div>
    </SubApiRoot>
  );
}

export default MultiTransfer;
