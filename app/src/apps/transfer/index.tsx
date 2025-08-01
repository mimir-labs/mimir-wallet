// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import IconMultiTransfer from '@/assets/svg/icon-multi-transfer.svg?react';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useAssets } from '@/hooks/useAssets';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Link, Spinner } from '@mimir-wallet/ui';

import TransferAction from './TransferAction';
import TransferContent from './TransferContent';

function PageTransfer() {
  const selected = useSelectedAccount();
  const navigate = useNavigate();
  const [fromParam] = useQueryParam<string>('from');
  const [assetId, setAssetId] = useQueryParam<string>('assetId', 'native');
  const [assetNetwork] = useQueryParam<string>('asset_network');
  const [toParam] = useQueryParam<string>('to');

  const [sending, setSending] = useState<string>(fromParam || selected || '');
  const [recipient, setRecipient] = useState<string>(toParam || '');
  const supportedNetworks = useAddressSupportedNetworks(sending);
  const [network, setNetwork] = useInputNetwork(
    assetNetwork,
    supportedNetworks?.map((item) => item.key)
  );
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [assets] = useAssets(network);
  const token = useMemo(() => assets?.find((item) => item.assetId === assetId), [assetId, assets]);

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={({ apiState: { chain } }) => (
        <div className='bg-content1 rounded-large mx-auto mt-16 flex w-[500px] max-w-full items-center justify-center py-10'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <div className='mx-auto w-full max-w-[500px] p-4 sm:p-5'>
        <Button onPress={() => navigate(-1)} variant='ghost'>
          {'<'} Back
        </Button>
        <div className='rounded-large border-secondary shadow-medium bg-content1 mt-4 border-1 p-4 sm:p-6'>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between'>
              <h3>Transfer</h3>

              <Button
                as={Link}
                href={`/explorer/${encodeURIComponent('mimir://app/multi-transfer')}`}
                color='primary'
                variant='light'
                startContent={<IconMultiTransfer />}
              >
                Multi-Transfer
              </Button>
            </div>
            <TransferContent
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              token={token}
              sending={sending}
              recipient={recipient}
              assetId={assetId}
              network={network}
              setSending={setSending}
              setNetwork={setNetwork}
              setRecipient={setRecipient}
              setAmount={setAmount}
              toggleKeepAlive={toggleKeepAlive}
              setToken={setAssetId}
            />
            <TransferAction
              network={network}
              token={token}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              sending={sending}
              recipient={recipient}
            >
              Review
            </TransferAction>
          </div>
        </div>
      </div>
    </SubApiRoot>
  );
}

export default PageTransfer;
