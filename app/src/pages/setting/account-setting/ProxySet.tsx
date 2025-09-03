// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import IconClock from '@/assets/svg/icon-clock.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { Address, AddressCell, Empty, FormatBalance, InputNetwork, TxButton } from '@/components';
import { findToken } from '@/config';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useNativeBalances } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useProxies } from '@/hooks/useProxies';
import { useTxQueue } from '@/hooks/useTxQueue';
import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Button,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tooltip
} from '@mimir-wallet/ui';

function Content({
  address,
  network,
  setNetwork
}: {
  address: string;
  network: string;
  setNetwork: (network: string) => void;
}) {
  const { api } = useApi();
  const { isLocalAccount } = useAccount();
  const { addQueue } = useTxQueue();
  const [isOpen, toggleOpen] = useToggle(false);
  const [isAlertOpen, toggleAlertOpen] = useToggle(false);
  const token = useMemo(() => findToken(api.genesisHash.toHex()), [api]);
  const [allBalances] = useNativeBalances(address);
  const [proxies, isFetched, isFetching] = useProxies(address);
  const [account] = useQueryAccount(address);

  const isReadOnly = useMemo(() => !isLocalAccount(address), [address, isLocalAccount]);

  return (
    <>
      <div className='space-y-5'>
        <InputNetwork network={network} setNetwork={setNetwork} />

        <div className='bg-secondary rounded-[10px] p-2.5'>
          <div className='font-bold'>Proxy Account</div>

          <div className='mt-2.5 space-y-2.5'>
            {isFetched &&
              proxies &&
              proxies[0].map((proxy, index) => (
                <div
                  key={index}
                  className='bg-content1 flex items-center justify-between gap-[5px] rounded-[10px] p-[5px]'
                >
                  <div className='flex-1'>
                    <AddressCell shorten value={proxy.delegate.toString()} />
                  </div>
                  {proxy.delay.gt(BN_ZERO) ? (
                    <Tooltip content={`Delay Blocks: ${[proxy.delay]}`}>
                      <IconClock className='h-4 w-4 opacity-70' />
                    </Tooltip>
                  ) : null}
                  <Chip color='secondary'>{proxy.proxyType.toString()}</Chip>
                  {!isReadOnly && (
                    <TxButton
                      isIconOnly
                      color='danger'
                      size='sm'
                      variant='light'
                      className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
                      accountId={address}
                      website='mimir://internal/setup'
                      overrideAction={
                        proxies[0].length === 1 && account?.type === 'pure'
                          ? toggleAlertOpen
                          : () => {
                              addQueue({
                                accountId: address,
                                call:
                                  proxies[0].length === 1
                                    ? api.tx.proxy.removeProxies()
                                    : api.tx.proxy.removeProxy(proxy.delegate, proxy.proxyType.toU8a(), proxy.delay),
                                website: 'mimir://internal/setup',
                                network
                              });
                            }
                      }
                    >
                      <IconDelete className='h-4 w-4' />
                    </TxButton>
                  )}
                </div>
              ))}

            {isFetched && proxies?.[0]?.length === 0 && <Empty height={200} label='No proxies' />}

            {!isFetched && isFetching && <Spinner />}
          </div>
        </div>

        <Divider />

        <Alert variant={'warning'}>
          <AlertTitle className='font-bold'>Notice</AlertTitle>
          <AlertDescription>
            <ul style={{ listStyle: 'outside' }}>
              <li>Only All authority can delete proxy.</li>
              <li>Deleting a Proxy will refund the fees, while adding a Proxy requires an additional deposit fee.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button asChild color='primary' fullWidth>
          <RouterLink to='/add-proxy'>Add New Proxy</RouterLink>
        </Button>

        {account?.type === 'pure' ? (
          <Button fullWidth color='danger' onClick={toggleOpen}>
            Delete Account
          </Button>
        ) : (
          <TxButton
            fullWidth
            color='danger'
            accountId={address}
            website='mimir://internal/remove-proxies'
            getCall={() => api.tx.proxy.removeProxies()}
          >
            Delete All
          </TxButton>
        )}
      </div>

      {account && account.type === 'pure' && (
        <Modal size='xl' isOpen={isOpen} onClose={toggleOpen}>
          <ModalContent>
            <ModalHeader>Attention</ModalHeader>

            <ModalBody>
              <p>
                If you delete the proxy relationship, <b style={{ fontWeight: 800 }}>NO ONE</b> will be able to control
                in this account. Make sure all of your assets in the <Address shorten value={address} /> account:
              </p>

              <br />

              <p>1. The assets of this account are transferable.</p>
              <p>2. The account have been securely transferred.</p>
              <br />

              <p>Please note that thisaction is irreversible.</p>

              <br />

              <div className='flex flex-row items-center gap-[5px]'>
                <span>Balance:</span>
                <Avatar
                  alt={api.runtimeChain.toString()}
                  src={token.Icon}
                  draggable={false}
                  style={{
                    width: '1em',
                    height: '1em',
                    verticalAlign: 'middle',
                    backgroundColor: 'transparent',
                    userSelect: 'none'
                  }}
                />
                <span className='text-foreground/50'>
                  <FormatBalance withCurrency value={allBalances?.total} />
                </span>
              </div>
            </ModalBody>

            <ModalFooter>
              <TxButton
                fullWidth
                color='danger'
                accountId={account.address}
                website='mimir://internal/remove-account'
                getCall={() =>
                  api.tx.proxy.killPure(
                    account.creator,
                    'Any',
                    account.disambiguationIndex,
                    account.createdBlock,
                    account.createdExtrinsicIndex
                  )
                }
                onDone={() => toggleOpen(false)}
              >
                Continue
              </TxButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {account && account.type === 'pure' && (
        <Modal size='xl' isOpen={isAlertOpen} onClose={toggleAlertOpen}>
          <ModalContent>
            <ModalHeader>Attention</ModalHeader>

            <ModalBody>
              <p>
                If you delete the proxy relationship, <b style={{ fontWeight: 800 }}>NO ONE</b> will be able to control
                in this account and the initial deposit will not be withdrawn.
              </p>

              <br />

              <p>Please use Delete Account.</p>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

function ProxySet({ address }: { address: string }) {
  const supportedNetworks = useAddressSupportedNetworks(address);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key)
  );

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={({ apiState: { chain } }) => (
        <div className='bg-content1 mx-auto my-0 flex w-[500px] max-w-full items-center justify-center rounded-[20px] py-10'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <Content address={address} network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default ProxySet;
