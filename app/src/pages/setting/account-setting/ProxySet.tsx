// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import IconClock from '@/assets/svg/icon-clock.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Address, AddressCell, Empty, FormatBalance, InputNetwork, TxButton } from '@/components';
import { findToken } from '@/config';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useNativeBalances } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useProxies } from '@/hooks/useProxies';
import { useTxQueue } from '@/hooks/useTxQueue';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';
import { useToggle } from 'react-use';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import {
  Alert,
  Button,
  Chip,
  Divider,
  Link,
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
      <Stack spacing={2}>
        <InputNetwork network={network} setNetwork={setNetwork} />

        <Box sx={{ borderRadius: 1, padding: 1, bgcolor: 'secondary.main' }}>
          <Typography fontWeight={700}>Proxy Account</Typography>
          <Stack spacing={1} sx={{ marginTop: 1 }}>
            {isFetched &&
              proxies &&
              proxies[0].map((proxy, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'white',
                    borderRadius: 1,
                    padding: 0.5,
                    gap: 0.5
                  }}
                >
                  <Box sx={{ flex: '1' }}>
                    <AddressCell shorten value={proxy.delegate.toString()} />
                  </Box>
                  {proxy.delay.gt(BN_ZERO) ? (
                    <Tooltip content={`Delay Blocks: ${[proxy.delay]}`}>
                      <IconClock className='w-4 h-4 opacity-70' />
                    </Tooltip>
                  ) : null}
                  <Chip color='secondary'>{proxy.proxyType.toString()}</Chip>
                  {!isReadOnly && (
                    <TxButton
                      isIconOnly
                      color='danger'
                      size='sm'
                      variant='light'
                      className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
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
                                    : api.tx.proxy.removeProxy(proxy.delegate, proxy.proxyType, proxy.delay),
                                website: 'mimir://internal/setup',
                                network
                              });
                            }
                      }
                    >
                      <IconDelete className='w-4 h-4' />
                    </TxButton>
                  )}
                </Box>
              ))}

            {isFetched && proxies?.[0]?.length === 0 && <Empty height={200} label='No proxies' />}

            {!isFetched && isFetching && <Spinner />}
          </Stack>
        </Box>

        <Divider />

        <Alert
          hideIconWrapper
          color='warning'
          description={
            <ul>
              <li>Only All authority can delete proxy.</li>
              <li>Deleting a Proxy will refund the fees, while adding a Proxy requires an additional deposit fee.</li>
            </ul>
          }
          classNames={{
            title: 'font-bold text-small',
            description: 'text-tiny'
          }}
          icon={<IconInfo />}
          title='Notice'
          variant='flat'
        />

        <Button as={Link} color='primary' fullWidth href='/add-proxy'>
          Add New Proxy
        </Button>

        {account?.type === 'pure' ? (
          <Button fullWidth color='danger' onPress={toggleOpen}>
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
      </Stack>

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
                <Avatar alt={api.runtimeChain.toString()} src={token.Icon} sx={{ width: 14, height: 14 }} />
                <Box component='span' sx={{ color: 'text.secondary' }}>
                  <FormatBalance withCurrency value={allBalances?.total} />
                </Box>
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

            <ModalBody className='py-5'>
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
        <div className='w-[500px] max-w-full mx-auto my-0 py-10 flex items-center justify-center bg-content1 rounded-large'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <Content address={address} network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default ProxySet;
