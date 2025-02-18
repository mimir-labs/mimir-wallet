// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { encodeAddress } from '@mimir-wallet/api';
import { IdentityIcon } from '@mimir-wallet/components';
import { UNIFIED_ADDRESS_FORMAT_KEY } from '@mimir-wallet/constants';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useLocalStore } from '@mimir-wallet/hooks/useStore';
import { store } from '@mimir-wallet/utils';

function UnifiedAddress({ address }: { address: string }) {
  const { chain } = useApi();
  const [addressFormat] = useLocalStore<'unified' | 'original' | undefined | null>(UNIFIED_ADDRESS_FORMAT_KEY);
  const [open, toggleOpen] = useToggle(!addressFormat);

  const unifiedAddress = useMemo(
    () => (chain.relayChainSs58Format !== undefined ? encodeAddress(address, chain.relayChainSs58Format) : null),
    [address, chain.relayChainSs58Format]
  );

  const originalAddress = useMemo(() => encodeAddress(address, chain.ss58Format), [address, chain.ss58Format]);

  if (!open) {
    return null;
  }

  if (chain.relayChainSs58Format === undefined || !unifiedAddress) {
    return null;
  }

  const handleClose = () => {
    toggleOpen(false);
    store.set(UNIFIED_ADDRESS_FORMAT_KEY, 'original');
  };

  return (
    <Dialog maxWidth='md' onClick={(e) => e.stopPropagation()} onClose={toggleOpen} open={open}>
      <DialogContent sx={{ maxWidth: 760 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 2, sm: 4 }
          }}
        >
          <img src='/images/unified-address.webp' style={{ width: 335, maxWidth: '100%' }} />
          <Stack spacing={2}>
            <Typography variant='h4'>Unified address formatting setting</Typography>
            <Divider />
            <Typography>
              With the Polkadot ecosystem introducing a new address format and chain prefixes, Mimir is leading the way
              in implementing this change.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, paddingX: { xs: 0, sm: 2 } }}>
              <Box
                component='svg'
                xmlns='http://www.w3.org/2000/svg'
                width='13'
                height='39'
                viewBox='0 0 13 39'
                fill='none'
                sx={{ width: 13 }}
              >
                <path
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  d='M5.35407 38.3847C5.25931 38.3362 5.00099 38.2529 4.81226 38.09C4.68701 37.9819 4.6121 37.7622 4.60125 37.5872C4.58414 37.3092 4.75168 37.0923 5.0179 37.0099C5.19848 36.9541 5.40195 36.9403 5.59154 36.9532C6.17236 36.9926 6.75406 37.1129 7.33066 37.086C7.72778 37.0681 8.3036 37.4478 8.50024 36.9138C8.63044 36.5603 8.10156 36.3015 7.84004 36.0338C6.61771 34.7805 5.46237 33.4817 4.49746 32.0078C3.06812 29.8241 1.97409 27.5084 1.31295 24.9759C0.534781 21.9968 0.284039 18.9555 0.54773 15.9229C0.847096 12.4794 1.87847 9.20907 3.65833 6.19725C4.72048 4.40066 6.02193 2.80197 7.44108 1.28952C7.65746 1.05899 7.92666 0.860356 8.20649 0.713039C8.43998 0.590229 8.71499 0.631204 8.9086 0.854243C9.08706 1.06063 9.17959 1.31348 9.05327 1.5655C8.93968 1.79053 8.77332 1.9943 8.60664 2.18694C7.84508 3.06738 7.02847 3.90547 6.31794 4.82488C4.38971 7.31833 3.11715 10.1116 2.44494 13.2065C2.05669 14.9949 1.88315 16.7743 1.9288 18.5967C1.96937 20.2217 2.04268 21.829 2.66282 23.3623C2.78329 23.66 2.83926 23.9846 2.91352 24.2996C3.79663 28.042 5.64977 31.2595 8.21608 34.0883C8.7806 34.7107 9.37186 35.3087 9.95719 35.9122C10.129 36.0897 10.4502 36.127 10.4756 35.9922C10.4986 35.8717 10.5449 35.7406 10.5182 35.6282C10.353 34.9363 10.1616 34.2507 9.99702 33.5583C9.92257 33.2466 9.87434 32.9257 9.84369 32.6057C9.81624 32.3227 10.1481 31.9922 10.4512 31.952C10.7542 31.9121 10.9256 32.1044 11.0941 32.3018C11.1344 32.3492 11.1634 32.4139 11.1789 32.4753C11.6474 34.2913 12.1267 36.1051 12.5712 37.9271C12.6835 38.3858 12.3184 38.8328 11.8591 38.9258C11.7956 38.9386 11.7339 38.9634 11.6704 38.971C10.5066 39.1098 6.74392 38.7764 5.35407 38.3847Z'
                  fill='url(#paint0_linear_18524_29902)'
                />
                <defs>
                  <linearGradient
                    id='paint0_linear_18524_29902'
                    x1='17.4307'
                    y1='22.8062'
                    x2='-0.430554'
                    y2='17.1941'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stop-color='#2700FF' />
                    <stop offset='1' stop-color='#0094FF' />
                  </linearGradient>
                </defs>
              </Box>

              <Stack
                spacing={1}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                <Box
                  sx={{
                    paddingX: 0.8,
                    paddingY: 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 0.8,
                    border: '1px dashed',
                    borderColor: 'primary.main'
                  }}
                >
                  <IdentityIcon value={address} size={30} />
                  <b>Original</b>
                  <Typography
                    variant='inherit'
                    sx={{
                      color: 'primary.main',
                      wordBreak: 'break-all',
                      maxWidth: { xs: 170, sm: 200 }
                    }}
                  >
                    {originalAddress}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    paddingX: 0.8,
                    paddingY: 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 0.8,
                    color: 'primary.contrastText',
                    bgcolor: 'primary.main'
                  }}
                >
                  <IdentityIcon value={address} size={30} />
                  <b>Unified</b>
                  <Typography
                    variant='inherit'
                    sx={{
                      wordBreak: 'break-all',
                      maxWidth: { xs: 170, sm: 200 }
                    }}
                  >
                    {unifiedAddress}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Typography>
              You’ll now encounter the updated format when performing transfers and other actions involving addresses.
            </Typography>
            <Typography>
              While other DEXs and CEXs are still in the process of adopting this update, the old address format will
              remain available for copying.
            </Typography>
            <Divider sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Stack spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button component={Link} to='/setting?setting-tab=display' fullWidth onClick={toggleOpen}>
                Setting
              </Button>
              <Button variant='text' fullWidth onClick={handleClose}>
                Close but also love it
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions disableSpacing sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column' }}>
        <Button component={Link} to='/setting?setting-tab=display' fullWidth onClick={toggleOpen}>
          Setting
        </Button>
        <Button variant='text' fullWidth onClick={handleClose} sx={{ marginTop: 1 }}>
          Close but also love it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UnifiedAddress;
