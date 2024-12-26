// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { AccountData, PureAccountData } from '@mimir-wallet/hooks/types';

import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography
} from '@mui/material';
import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { useAddressMeta } from '@mimir-wallet/accounts/useAddressMeta';
import IconClock from '@mimir-wallet/assets/svg/icon-clock.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import { Address, AddressCell, FormatBalance } from '@mimir-wallet/components';
import { findToken } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useCall } from '@mimir-wallet/hooks/useCall';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';

function ProxySet({
  account,
  address,
  proxies
}: {
  account: AccountData;
  address: string;
  proxies: Vec<PalletProxyProxyDefinition>;
}) {
  const { api } = useApi();
  const { isLocalAccount } = useAccount();
  const { addQueue } = useTxQueue();
  const { meta } = useAddressMeta(address);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isAlertOpen, toggleAlertOpen] = useToggle(false);
  const token = useMemo(() => findToken(api.genesisHash.toHex()), [api]);
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [address]);

  const isReadOnly = useMemo(() => !isLocalAccount(address), [address, isLocalAccount]);

  const handleDelete = () => {
    addQueue({
      accountId: address,
      call: api.tx.proxy.removeProxies(),
      website: 'mimir://internal/remove-proxies'
    });
  };

  const handleKill = (pureAccount: PureAccountData) => {
    addQueue({
      accountId: pureAccount.address,
      call: api.tx.proxy.killPure(
        pureAccount.creator,
        'Any',
        pureAccount.disambiguationIndex,
        pureAccount.createdBlock,
        pureAccount.createdExtrinsicIndex
      ),
      website: 'mimir://internal/remove-account'
    });
    toggleOpen(false);
  };

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{ borderRadius: 1, padding: 1, bgcolor: 'secondary.main' }}>
          <Typography fontWeight={700}>Proxy Account</Typography>
          <Stack spacing={1} sx={{ marginTop: 1 }}>
            {proxies.map((proxy, index) => (
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
                  <Tooltip title={`Delay Blocks: ${[proxy.delay]}`}>
                    <SvgIcon
                      component={IconClock}
                      inheritViewBox
                      sx={{ fontSize: '0.875rem', color: 'primary.main', opacity: 0.7 }}
                    />
                  </Tooltip>
                ) : null}
                <Chip color='secondary' label={proxy.proxyType.toString()} />
                {!isReadOnly && (
                  <IconButton
                    color='error'
                    size='small'
                    sx={{ fontSize: 'inherit' }}
                    onClick={
                      proxies.length === 1 && meta.isPure
                        ? toggleAlertOpen
                        : () => {
                            addQueue({
                              accountId: address,
                              call:
                                proxies.length === 1
                                  ? api.tx.proxy.removeProxies()
                                  : api.tx.proxy.removeProxy(proxy.delegate, proxy.proxyType, proxy.delay),
                              website: 'mimir://internal/setup'
                            });
                          }
                    }
                  >
                    <SvgIcon component={IconDelete} inheritViewBox />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Alert
          icon={<SvgIcon inheritViewBox component={IconInfo} sx={{ fontSize: '0.875rem' }} />}
          severity='warning'
          sx={{ '.MuiAlert-message': { overflow: 'visible' } }}
        >
          <AlertTitle>Notice</AlertTitle>
          <ul>
            <li>Only All authority can delete proxy.</li>
            <li>Deleting a Proxy will refund the fees, while adding a Proxy requires an additional deposit fee.</li>
          </ul>
        </Alert>

        <Button component={Link} variant='contained' fullWidth to='/add-proxy'>
          Add New Proxy
        </Button>

        {meta.isPure ? (
          <Button variant='contained' fullWidth color='error' onClick={toggleOpen}>
            Delete Account
          </Button>
        ) : (
          <Button variant='contained' fullWidth color='error' onClick={handleDelete}>
            Delete All
          </Button>
        )}
      </Stack>

      {account.type === 'pure' && (
        <Dialog maxWidth='sm' fullWidth open={isOpen} onClose={toggleOpen}>
          <DialogTitle>Attention</DialogTitle>

          <DialogContent>
            <Typography>
              If you delete the proxy relationship, <b style={{ fontWeight: 800 }}>NO ONE</b> will be able to control in
              this account. Make sure all of your assets in the <Address shorten value={address} /> account:
            </Typography>

            <br />

            <Typography>1. The assets of this account are transferable.</Typography>
            <Typography>2. The account have been securely transferred.</Typography>
            <br />

            <Typography>Please note that thisaction is irreversible.</Typography>

            <br />

            <Stack alignItems='center' direction='row' spacing={0.5}>
              <span>Balance:</span>
              <Avatar alt={api.runtimeChain.toString()} src={token.Icon} sx={{ width: 14, height: 14 }} />
              <Box component='span' sx={{ color: 'text.secondary' }}>
                <FormatBalance withCurrency value={allBalances?.freeBalance.add(allBalances.reservedBalance)} />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button variant='contained' fullWidth color='error' onClick={() => handleKill(account)}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {account.type === 'pure' && (
        <Dialog maxWidth='sm' fullWidth open={isAlertOpen} onClose={toggleAlertOpen}>
          <DialogTitle>Attention</DialogTitle>

          <DialogContent>
            <Typography>
              If you delete the proxy relationship, <b style={{ fontWeight: 800 }}>NO ONE</b> will be able to control in
              this account and the initial deposit will not be withdrawn.
            </Typography>

            <br />

            <Typography>Please use Delete Account.</Typography>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default ProxySet;
