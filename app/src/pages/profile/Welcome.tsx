// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { groupAccounts, type GroupName } from '@/accounts/utils';
import Logo from '@/assets/images/logo.png';
import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconSearch from '@/assets/svg/icon-search.svg?react';
import { AddressCell, Input } from '@/components';
import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { formatDisplay } from '@/utils';
import { useWallet } from '@/wallet/useWallet';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

import { addressEq, isPolkadotAddress, useNetworks } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, Divider, Link, Spinner, usePress } from '@mimir-wallet/ui';

const exampleAccounts = [
  '12pzUmpZrXmfjSjRksWrKZkD8jf6UXZXWTkhmA4ccR1Seppv',
  '12RYJb5gG4hfoWPK3owEYtmWoko8G6zwYpvDYTyXFVSfJr8Y',
  '13vYFRVn6d4e3vQtrFJppQKN9qhatbCLwci2JQdWuNoXw8i7',
  '13eB7Q6RLv57Wn7bwE65ur2pyq75nYw2PvWVXt6SuBV5cBGR',
  '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K',
  '14iSAsKCsBLTT5vPc8zsoCfFfawwCjrvvPD9gtVjjMDuuVLp',
  '1MrurrNb4VTrRJUXT6fGxHFdmwwscqHZUFkMistMsP8k5Nk',
  '146FpXUf1GZyVUX5G1pwz7SsbqR9zcc62QaSaruanCjt6ChD',
  '16maYYXg9chsfsBVoiSbSWzmFveamERwShPZv3SB5hVnYTmT',
  '13du3Rt2CAV9L1v1QXTeYosuKaiBSYiPWpa2B4nxzfSdEAF1',
  '14ZaBmSkr6JWf4fUDHbApqHBvbeeAEBSAARxgzXHcSruLELJ'
];

let index = 0;

function nextExampleAccount() {
  const list: string[] = [];

  while (list.length < 3) {
    list.push(exampleAccounts[index++ % exampleAccounts.length]);
  }

  return list;
}

function AccountItem({ address }: { address: string }) {
  const { setCurrent } = useAccount();
  const navigate = useNavigate();
  const [totalUsd] = useBalanceTotalUsd(address);
  const formatUsd = formatDisplay(totalUsd.toString());
  const { pressProps } = usePress({
    onPress: () => {
      setCurrent(address);
      navigate('/', { replace: true });
    }
  });

  return (
    <div
      className='cursor-pointer px-2.5 py-[5px] rounded-medium border-1 border-primary/5 bg-secondary flex items-center justify-between'
      key={`multisig-searched`}
      {...pressProps}
    >
      <AddressCell shorten={false} showType value={address} withCopy withAddressBook addressCopyDisabled />

      <div className='text-tiny font-bold'>
        $ {formatUsd[0]}
        {formatUsd[1] ? `.${formatUsd[1]}` : ''}
        {formatUsd[2] || ''}
      </div>
    </div>
  );
}

function Accounts({
  keywords,
  searchAccount,
  setSearchAccount,
  setIsSearching
}: {
  keywords: string;
  searchAccount: AccountData | undefined;
  setSearchAccount: (account: AccountData | undefined) => void;
  setIsSearching: (isSearching: boolean) => void;
}) {
  const { connectedWallets, openWallet } = useWallet();
  const isConnected = Object.keys(connectedWallets).length > 0;
  const { accounts, metas } = useAccount();
  const [grouped, setGrouped] = useState<Record<GroupName, string[]>>(groupAccounts(accounts, [], metas));

  useEffect(() => {
    if (!keywords) {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts, [], metas));

      return;
    }

    if (isPolkadotAddress(keywords)) {
      setGrouped(
        groupAccounts(
          accounts.filter((account) => addressEq(account.address, keywords)),
          [],
          metas
        )
      );
      setIsSearching(true);
      service
        .getOmniChainDetails(keywords)
        .then((data) => {
          setSearchAccount(data);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts, [], metas, keywords));
    }
  }, [accounts, keywords, metas, setIsSearching, setSearchAccount]);

  if (!isConnected) {
    return (
      <div className='w-full p-5 bg-content1 shadow-medium rounded-large space-y-4'>
        <h3 className='font-extrabold'>Your Account</h3>

        <Divider />

        <Button fullWidth color='primary' onPress={openWallet}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full p-5 bg-content1 shadow-medium rounded-large space-y-4'>
      <div className='flex items-center justify-between gap-2.5'>
        <h3 className='font-extrabold flex-1'>Your Account</h3>
        <Button as={Link} size='sm' href='/create-multisig' color='primary' variant='ghost'>
          Create Multisig
        </Button>
        <Button as={Link} size='sm' href='/create-pure' color='primary' variant='ghost'>
          Create Pure Account
        </Button>
      </div>

      <Divider />

      {searchAccount && (
        <>
          <h6>Searched Account</h6>
          <AccountItem address={searchAccount.address} />
        </>
      )}

      {!searchAccount && grouped.mimir.length > 0 && (
        <>
          <h6>Mimir Account</h6>
          {grouped.mimir.map((account) => (
            <AccountItem key={`multisig-${account}`} address={account} />
          ))}
        </>
      )}

      {!searchAccount && grouped.injected.length > 0 && (
        <>
          <h6>Extension Account</h6>
          {grouped.injected.map((account) => (
            <AccountItem key={`extension-${account}`} address={account} />
          ))}
        </>
      )}
    </div>
  );
}

function ExampleAccount() {
  const [exampleAccounts, setExampleAccounts] = useState<string[]>(nextExampleAccount());

  return (
    <div className='w-full p-5 bg-content1 shadow-medium rounded-large space-y-4'>
      <div className='flex items-center'>
        <h3 className='font-extrabold'>Example Account</h3>
        <Button isIconOnly color='default' variant='light' onPress={() => setExampleAccounts(nextExampleAccount())}>
          <IconArrowClockWise className='w-4 h-4' />
        </Button>
      </div>

      <Divider />

      {exampleAccounts.map((account) => (
        <AccountItem key={`example-${account}`} address={account} />
      ))}
    </div>
  );
}

function Welcome() {
  const [keywords, setKeywords] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchAccount, setSearchAccount] = useState<AccountData>();
  const { enableNetwork, networks } = useNetworks();

  useEffectOnce(() => {
    enableNetwork(networks[0].key);
  });

  return (
    <div
      className='h-[100dvh] relative overflow-y-auto'
      style={{
        backgroundImage: 'url(/images/welcome-bg.svg)',
        backgroundSize: '115% 115%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className='sticky top-0 left-0 right-0 z-10'
        style={{
          height: 22,
          background: 'linear-gradient(90deg, #2700FF 0%, #0094FF 100%)'
        }}
      />

      <div className='flex flex-col justify-center items-center gap-5 my-10 mx-auto w-full max-w-[520px]'>
        <img className='hidden sm:block' alt='Mimir' src={Logo} style={{ width: 137 }} />

        <div className='text-center'>
          <h3 className='text-[26px]'>Start your ultimate </h3>
          <h1 className='text-[40px] font-[900] text-primary'>OMNI multisig journey</h1>
        </div>

        <Input
          fullWidth
          size='lg'
          className='w-full'
          classNames={{
            inputWrapper: 'bg-content1 shadow-medium'
          }}
          radius='full'
          endAdornment={isSearching ? <Spinner size='sm' /> : <IconSearch className='text-divider-300 w-4 h-4' />}
          onChange={setKeywords}
          placeholder='Please input address'
          value={keywords}
        />

        <Accounts
          keywords={keywords}
          searchAccount={searchAccount}
          setSearchAccount={setSearchAccount}
          setIsSearching={setIsSearching}
        />

        <ExampleAccount />
      </div>
    </div>
  );
}

export default Welcome;
