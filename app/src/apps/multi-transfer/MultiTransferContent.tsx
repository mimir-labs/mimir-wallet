// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultiTransferData } from './types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { Input, InputAddress, InputNetwork, InputToken, TxButton } from '@/components';
import { useAssets } from '@/hooks/useAssets';
import { isValidNumber, parseUnits } from '@/utils';
import { isHex } from '@polkadot/util';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Chip, Divider } from '@mimir-wallet/ui';

import { parseCsv } from './parse';
import Upload from './Upload';

interface Props {
  data: MultiTransferData[];
  sending: string;
  network: string;
  setSending: (value: string) => void;
  setNetwork: (value: string) => void;
  setData: React.Dispatch<React.SetStateAction<MultiTransferData[]>>;
}

function MultiTransferContent({ data, sending, network, setSending, setNetwork, setData }: Props) {
  const { api, genesisHash } = useApi();
  const [assets, , , assetsPromise] = useAssets(network);
  const [invalidAssetIds, setInvalidAssetIds] = useState<string[]>([]);

  const { meta: sendingMeta } = useAddressMeta(sending);

  // Handle network change and clear data
  const handleNetworkChange = useCallback(
    (newNetwork: string) => {
      setNetwork(newNetwork);
      setData([]);
      setInvalidAssetIds([]);
    },
    [setNetwork, setData]
  );

  // Clear invalid asset IDs when data is empty
  useEffect(() => {
    if (data.length === 0) {
      setInvalidAssetIds([]);
    }
  }, [data.length]);

  // Check if all data is valid for batch transfer
  const isDataValid = useMemo(() => {
    if (data.length === 0) return false;

    return data.every(([address, assetId, amount]) => {
      return address && assetId && amount && isValidNumber(amount);
    });
  }, [data]);

  // Create batch transfer calls
  const getBatchCalls = useCallback(() => {
    if (!isDataValid || !assets) {
      throw new Error('Invalid transfer data');
    }

    const calls = data.map(([address, assetId, amount]) => {
      // Find asset details
      const asset = assets.find((a) => a.assetId === assetId);
      const isNative = assetId === 'native';
      const decimals = isNative ? api.registry.chainDecimals[0] : asset?.decimals || 0;

      if (isNative) {
        return api.tx.balances.transferKeepAlive(address, parseUnits(amount, decimals));
      }

      if (api.tx.assets) {
        if (isHex(assetId) && !api.tx.foreignAssets) {
          throw new Error(`Invalid asset id: ${assetId}`);
        }

        return api.tx[isHex(assetId) ? 'foreignAssets' : 'assets'].transferKeepAlive(
          assetId,
          address,
          parseUnits(amount, decimals)
        );
      }

      if (api.tx.tokens) {
        return api.tx.tokens.transferKeepAlive(address, assetId, parseUnits(amount, decimals));
      }

      throw new Error(`Unsupported asset: ${assetId}`);
    });

    return api.tx.utility.batchAll(calls).method;
  }, [api, assets, data, isDataValid]);

  return (
    <>
      <InputNetwork
        label='Select Network'
        network={network}
        setNetwork={handleNetworkChange}
        endContent={
          sendingMeta && sendingMeta.isPure && remoteProxyRelations[sendingMeta.pureCreatedAt]
            ? {
                [remoteProxyRelations[sendingMeta.pureCreatedAt]]: (
                  <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
                    Remote Proxy
                  </Chip>
                )
              }
            : undefined
        }
        helper={
          sendingMeta && sendingMeta.isPure && remoteProxyRelations[sendingMeta.pureCreatedAt] === genesisHash ? (
            <div className='text-foreground'>
              🥷✨Yep, remote proxy lets you borrow a ninja from another chain — smooth and stealthy! 🕶️
            </div>
          ) : null
        }
      />

      {/* sending */}
      <InputAddress isSign label='Sending From' onChange={setSending} placeholder='Sender' value={sending} />

      {/* upload file */}
      <Upload
        accept='.csv'
        onUpload={async (file) => {
          try {
            const assetsToValidate = assets || (await assetsPromise);

            // Parse with validation
            parseCsv(
              file[0],
              (parsedData, invalidAssets) => {
                setData((data) => data.concat(parsedData));
                setInvalidAssetIds(invalidAssets || []);
              },
              assetsToValidate,
              console.error
            );
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }}
      />

      <Divider />

      <div className='grid grid-cols-12 gap-2.5'>
        <div className='col-span-8 flex items-center gap-1 font-bold'>
          Address
          <Button
            size='sm'
            isIconOnly
            color='primary'
            radius='full'
            variant='light'
            onClick={() => setData((data) => [...data, ['', '', '']])}
          >
            <IconAdd className='h-4 w-4' />
          </Button>
        </div>
        <div className='col-span-2 font-bold'>Token</div>
        <div className='col-span-2 font-bold'>Amount</div>
        {data.map(([address, assetId, amount], index) => (
          <React.Fragment key={index}>
            <div className='col-span-8'>
              <InputAddress
                placeholder='input address'
                wrapperClassName='h-[40px]'
                iconSize={20}
                addressType='row'
                value={address}
                onChange={(value) =>
                  setData((data) => data.map((item, i) => (i === index ? [value, item[1], item[2]] : item)))
                }
              />
            </div>
            <div className='col-span-2'>
              <InputToken
                address={sending}
                placeholder='select token'
                assetId={assetId}
                wrapperClassName='h-[40px]'
                network={network}
                onChange={async (value) => {
                  setData((data) => data.map((item, i) => (i === index ? [item[0], value, item[2]] : item)));
                }}
              />
            </div>
            <div className='col-span-2 flex items-center gap-1.5'>
              <Input
                className='h-[40px] flex-1'
                placeholder='Amount'
                value={amount}
                onChange={(value) =>
                  setData((data) => data.map((item, i) => (i === index ? [item[0], item[1], value] : item)))
                }
              />
              <Button
                size='sm'
                isIconOnly
                color='danger'
                variant='light'
                onClick={() => setData((data) => data.filter((_, i) => i !== index))}
              >
                <IconDelete className='h-4 w-4' />
              </Button>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Asset validation alert */}
      {invalidAssetIds.length > 0 && (
        <Alert variant='destructive'>
          <AlertTitle>Token not found. (ID= {invalidAssetIds.join(', ')})</AlertTitle>
        </Alert>
      )}

      <Divider />

      {/* Batch Transfer Button */}
      <TxButton
        fullWidth
        color={isDataValid ? 'primary' : 'danger'}
        disabled={!isDataValid}
        accountId={sending}
        website='mimir://app/multi-transfer'
        getCall={getBatchCalls}
      >
        {data.length
          ? isDataValid
            ? `Execute Batch Transfer (${data.length} transfers)`
            : 'Invalid Transfer Data'
          : 'Confirm'}
      </TxButton>

      <Divider />
    </>
  );
}

export default React.memo(MultiTransferContent);
