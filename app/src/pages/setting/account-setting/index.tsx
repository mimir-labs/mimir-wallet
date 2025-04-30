// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Input } from '@/components';
import { toastSuccess } from '@/components/utils';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Tooltip } from '@mimir-wallet/ui';

import MemberSet from './MemberSet';
import ProposerSet from './ProposerSet';
import ProxySet from './ProxySet';
import PureMemberSet from './PureMemberSet';

function AccountSetting() {
  const { isLocalAccount, current: address } = useAccount();
  const { setName, name, saveName } = useAddressMeta(address);
  const [error, setError] = useState<Error>();
  const [account, , , refetch] = useQueryAccountOmniChain(address);

  return (
    <Stack spacing={2} sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
      <Box>
        <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
          Name
        </Typography>
        <Paper component={Stack} sx={{ padding: 2, borderRadius: 2 }} spacing={1}>
          <Input
            label='Name'
            onChange={(value) => {
              if (value) {
                setError(undefined);
              }

              setName(value);
            }}
            placeholder='Please input account name'
            value={name}
            error={error}
          />
          <Typography fontSize='0.75rem' color='textSecondary' marginTop={1}>
            All members will see this name
          </Typography>
          <Button
            disabled={!(address && isLocalAccount(address))}
            fullWidth
            onClick={() => {
              if (!name) {
                setError(new Error('Please input wallet name'));
              } else {
                saveName(false, (name) => toastSuccess(`Save name to ${name} success`));
              }
            }}
          >
            Save
          </Button>
        </Paper>
      </Box>

      {account?.type === 'multisig' ? (
        <Box>
          <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
            Multisig Information
          </Typography>
          <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
            <MemberSet account={account} disabled />
          </Paper>
        </Box>
      ) : account?.type === 'pure' ? (
        <SubApiRoot network={account.network} supportedNetworks={[account.network]}>
          <PureMemberSet account={account} />
        </SubApiRoot>
      ) : null}

      {address ? (
        <div>
          <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
            Proxy Information
          </Typography>
          <div className='p-5 rounded-large mt-2.5 shadow-medium bg-content1'>
            <ProxySet address={address} />
          </div>
        </div>
      ) : null}

      {account && (
        <div>
          <h6 className='text-foreground/50 mb-2.5 flex items-center gap-1'>
            Proposer
            <Tooltip
              closeDelay={0}
              classNames={{ content: 'max-w-[300px]' }}
              content='Proposers can suggest transactions but cannot approve or execute them. Signers should review and approve transactions first.'
            >
              <IconQuestion className='text-primary' />
            </Tooltip>
          </h6>
          <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
            <ProposerSet account={account} refetch={refetch} />
          </Paper>
        </div>
      )}
    </Stack>
  );
}

export default AccountSetting;
