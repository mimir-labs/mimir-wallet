// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Spinner } from '@mimir-wallet/ui';

import MultiTransferContent from './MultiTransferContent';
import { MultiTransferData } from './types';

function MultiTransfer() {
  const navigate = useNavigate();
  const { current } = useAccount();
  const [network, setNetwork] = useInputNetwork();
  const [sending, setSending] = useState(current || '');
  const [data, setData] = useState<MultiTransferData[]>([['', '', '']]);

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
