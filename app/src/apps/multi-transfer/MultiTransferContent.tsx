// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultiTransferData } from './types';

import {
  ApiManager,
  remoteProxyRelations,
  useNetwork,
} from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Badge, Button, Divider } from '@mimir-wallet/ui';
import { isHex } from '@polkadot/util';
import React, { useCallback, useMemo, useState } from 'react';

import { parseCsv } from './parse';
import Upload from './Upload';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import {
  AddressCell,
  Input,
  InputAddress,
  InputNetwork,
  InputToken,
  NetworkErrorAlert,
  TxButton,
} from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import { isValidNumber, parseUnits } from '@/utils';

interface Props {
  data: MultiTransferData[];
  sending: string;
  network: string;
  supportedNetworks?: string[];
  setNetwork: (value: string) => void;
  setData: React.Dispatch<React.SetStateAction<MultiTransferData[]>>;
}

function MultiTransferContent({
  data,
  sending,
  network,
  supportedNetworks,
  setNetwork,
  setData,
}: Props) {
  const { network: currentNetwork, chain } = useNetwork();
  const genesisHash = chain.genesisHash;
  const upSm = useMediaQuery('sm');
  const [assets, , , assetsPromise] = useChainXcmAsset(network);
  const [invalidAssetIds, setInvalidAssetIds] = useState<string[]>([]);

  const { meta: sendingMeta } = useAddressMeta(sending);

  // Handle network change and clear data
  const handleNetworkChange = useCallback(
    (newNetwork: string) => {
      setNetwork(newNetwork);
      setData([['', '', '']]);
      setInvalidAssetIds([]);
    },
    [setNetwork, setData],
  );

  // Derive invalid asset IDs: empty when data is empty, otherwise use state
  const effectiveInvalidAssetIds = useMemo(
    () => (data.length === 0 ? [] : invalidAssetIds),
    [data.length, invalidAssetIds],
  );

  // Check if all data is valid for batch transfer
  const isDataValid = useMemo(() => {
    if (data.length === 0) return false;

    return data.every(([address, assetId, amount]) => {
      return address && assetId && amount && isValidNumber(amount);
    });
  }, [data]);

  // Create batch transfer calls
  const getBatchCalls = useCallback(async () => {
    if (!isDataValid || !assets) {
      throw new Error('Invalid transfer data');
    }

    const api = await ApiManager.getInstance().getApi(currentNetwork, true);

    const calls = data.map(([address, assetId, amount]) => {
      // Find asset details
      const asset = assets.find((a) => a.assetId === assetId);
      const isNative = assetId === 'native';
      const decimals = isNative
        ? api.registry.chainDecimals[0]
        : asset?.decimals || 0;

      if (isNative) {
        return api.tx.balances.transferKeepAlive(
          address,
          parseUnits(amount, decimals),
        );
      }

      if (api.tx.assets) {
        if (isHex(assetId) && !api.tx.foreignAssets) {
          throw new Error(`Invalid asset id: ${assetId}`);
        }

        return api.tx[
          isHex(assetId) ? 'foreignAssets' : 'assets'
        ].transferKeepAlive(assetId, address, parseUnits(amount, decimals));
      }

      if (api.tx.tokens) {
        return api.tx.tokens.transferKeepAlive(
          address,
          assetId,
          parseUnits(amount, decimals),
        );
      }

      throw new Error(`Unsupported asset: ${assetId}`);
    });

    return api.tx.utility.batchAll(calls).method;
  }, [currentNetwork, assets, data, isDataValid]);

  return (
    <>
      <InputNetwork
        label="Select Network"
        network={network}
        supportedNetworks={supportedNetworks}
        setNetwork={handleNetworkChange}
        endContent={
          sendingMeta &&
          sendingMeta.isPure &&
          remoteProxyRelations[sendingMeta.pureCreatedAt]
            ? {
                [remoteProxyRelations[sendingMeta.pureCreatedAt]]: (
                  <Badge variant="purple">Remote Proxy</Badge>
                ),
              }
            : undefined
        }
        helper={
          sendingMeta &&
          sendingMeta.isPure &&
          remoteProxyRelations[sendingMeta.pureCreatedAt] === genesisHash ? (
            <div className="text-foreground">
              🥷✨Yep, remote proxy lets you borrow a ninja from another chain —
              smooth and stealthy! 🕶️
            </div>
          ) : null
        }
      />

      {/* sending */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Sending From</p>
        <div className="bg-secondary rounded-[10px] p-2">
          <AddressCell
            shorten={!upSm}
            showType
            value={sending}
            withCopy
            withAddressBook
          />
        </div>
      </div>

      {/* upload file */}
      <Upload
        accept=".csv"
        onUpload={async (file) => {
          try {
            const assetsToValidate = assets ? assets : await assetsPromise();

            // Parse with validation
            parseCsv(
              file[0],
              (parsedData, invalidAssets) => {
                setData((data) => data.concat(parsedData));
                setInvalidAssetIds(invalidAssets || []);
              },
              assetsToValidate,
              console.error,
            );
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }}
      />

      <Divider />

      <div className="grid grid-cols-19 gap-2.5">
        <div className="col-span-7 flex items-center gap-1 font-bold">
          Address
          <Button
            size="sm"
            isIconOnly
            color="primary"
            radius="full"
            variant="light"
            onClick={() => setData((data) => [...data, ['', '', '']])}
          >
            <IconAdd className="h-4 w-4" />
          </Button>
        </div>
        <div className="col-span-6 font-bold">Token</div>
        <div className="col-span-6 font-bold">Amount</div>
        {data.map(([address, assetId, amount], index) => (
          <React.Fragment key={index}>
            <div className="col-span-7">
              <InputAddress
                placeholder="input address"
                wrapperClassName="h-[40px]"
                shorten
                iconSize={20}
                addressType="row"
                rowType="address"
                value={address}
                onChange={(value) =>
                  setData((data) =>
                    data.map((item, i) =>
                      i === index ? [value, item[1], item[2]] : item,
                    ),
                  )
                }
              />
            </div>
            <div className="col-span-6">
              <InputToken
                address={sending}
                placeholder="select token"
                identifier={assetId}
                wrapperClassName="h-[40px]"
                network={network}
                onChange={async (value) => {
                  setData((data) =>
                    data.map((item, i) =>
                      i === index ? [item[0], value, item[2]] : item,
                    ),
                  );
                }}
              />
            </div>
            <div className="col-span-6 flex items-center gap-1.5">
              <Input
                className="h-10 flex-1"
                placeholder="Amount"
                value={amount}
                onChange={(value) =>
                  setData((data) =>
                    data.map((item, i) =>
                      i === index ? [item[0], item[1], value] : item,
                    ),
                  )
                }
              />
              <Button
                size="sm"
                isIconOnly
                color="danger"
                variant="light"
                className="p-0 w-3.5 h-3.5 hover:bg-transparent hover:text-danger-300"
                onClick={() =>
                  setData((data) => data.filter((_, i) => i !== index))
                }
              >
                <IconDelete className="h-3.5 w-3.5" />
              </Button>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Asset validation alert */}
      {effectiveInvalidAssetIds.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>
            Token not found. (ID= {effectiveInvalidAssetIds.join(', ')})
          </AlertTitle>
        </Alert>
      )}

      <Divider />

      <NetworkErrorAlert network={network} />

      {/* Batch Transfer Button */}
      <TxButton
        fullWidth
        color={isDataValid ? 'primary' : 'danger'}
        disabled={!isDataValid}
        accountId={sending}
        website="mimir://app/multi-transfer"
        getCall={getBatchCalls}
      >
        {data.length
          ? isDataValid
            ? `Execute Batch Transfer (${data.length} transfers)`
            : 'Invalid Transfer Data'
          : 'Confirm'}
      </TxButton>
    </>
  );
}

export default React.memo(MultiTransferContent);
