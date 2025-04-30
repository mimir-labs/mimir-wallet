// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { useUnConfirmMultisigs } from '@/accounts/useGroupAccounts';
import { useSelectedAccountCallback } from '@/accounts/useSelectedAccount';
// import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { CreateMultisigDialog, InputAddress } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToggle } from '@/hooks/useToggle';
import { useWallet } from '@/wallet/useWallet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Divider, Link } from '@mimir-wallet/ui';

function Detected({ accounts, onCreateMultisig }: { accounts: AccountData[]; onCreateMultisig: () => void }) {
  const selectAccount = useSelectedAccountCallback();
  const [selected, setSelected] = useState<string>(accounts[0]?.address ?? '');
  const [confirm] = useUnConfirmMultisigs();
  const navigate = useNavigate();

  const handleClick = () => {
    confirm(accounts.map((item) => item.address));
    selectAccount(selected);
    navigate('/', { replace: true });
  };

  return (
    <div className='space-y-2.5 w-full sm:w-[400px]'>
      <InputAddress
        filtered={accounts.map((item) => item.address)}
        value={selected}
        onChange={(value) => setSelected(value)}
      />

      <Button color='primary' fullWidth onPress={handleClick}>
        Login
      </Button>

      <Divider />

      <Button color='primary' variant='ghost' fullWidth onPress={onCreateMultisig}>
        Create Multisig Account
      </Button>
      <Button as={Link} href='/create-pure' color='primary' variant='ghost' fullWidth>
        Create Pure Proxy
      </Button>
      <Button onPress={handleClick} variant='light' color='primary'>
        {'Skip>'}
      </Button>
    </div>
  );
}

function Welcome() {
  const { connectedWallets, openWallet } = useWallet();
  const { accounts } = useAccount();
  const [createMultisigOpen, toggleCreateMultisigOpen] = useToggle();
  const upSm = useMediaQuery('sm');

  const isConnected = Object.keys(connectedWallets).length > 0;

  return (
    <>
      <div className='flex flex-col sm:flex-row justify-center items-center gap-5 sm:gap-10 md:gap-14 lg:gap-20 h-full'>
        <div className='w-[185px] sm:w-[309px] overflow-hidden rounded-[18px] sm:rounded-[30px]'>
          <video muted playsInline autoPlay loop src='/ux.mp4' controls={false} width='100%' />
        </div>
        <div className='space-y-5 w-full sm:w-auto'>
          <h1 style={{ fontWeight: 700, lineHeight: 1.1 }} className='text-[20px] sm:text-[30px] md:text-[40px]'>
            Manage your assets{!upSm ? '' : <br />} like a pro
          </h1>
          <p className='text-medium' style={{ lineHeight: '19px', letterSpacing: '0.16px' }}>
            · Multisig Accounts
            <br />· Proxy Accounts
            <br />· Batch Transactions
            <br />· Account Structure Overview
          </p>
          {isConnected ? (
            <>
              <p className='font-extrabold text-medium sm:text-large'>Detected Account</p>
              <Detected accounts={accounts} onCreateMultisig={toggleCreateMultisigOpen} />
            </>
          ) : (
            <Button color='primary' onPress={openWallet}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <CreateMultisigDialog open={createMultisigOpen} onClose={toggleCreateMultisigOpen} />
    </>
  );
}

export default Welcome;
