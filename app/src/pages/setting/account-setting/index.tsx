// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { Input, Label } from '@/components';
import { toastSuccess } from '@/components/utils';
import { useState } from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

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
    <div className='mx-auto my-0 w-[500px] max-w-full space-y-5'>
      <div>
        <h6 className='text-foreground/50 mb-2.5 text-sm'>Name</h6>
        <div className='border-secondary bg-content1 shadow-medium space-y-2.5 rounded-[20px] border-1 p-4 sm:p-5'>
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
          <p className='text-foreground/50 mt-2.5 text-xs'>All members will see this name</p>
          <Button
            disabled={!(address && isLocalAccount(address))}
            fullWidth
            variant='solid'
            color='primary'
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
        </div>
      </div>

      {account?.type === 'multisig' ? (
        <div>
          <h6 className='text-foreground/50 mb-2.5 inline-flex items-center gap-1 text-sm'>
            <Label tooltip='For Pure Proxy, each controllable multisig account is listed as a member set.'>
              Multisig Information
            </Label>
          </h6>
          <div className='bg-content1 border-secondary shadow-medium space-y-2.5 rounded-[20px] border-1 p-4 sm:p-5'>
            <MemberSet account={account} disabled />
          </div>
        </div>
      ) : account?.type === 'pure' ? (
        <SubApiRoot network={account.network} supportedNetworks={[account.network]}>
          <PureMemberSet account={account} />
        </SubApiRoot>
      ) : null}

      {address ? (
        <div>
          <h6 className='text-foreground/50 mb-2.5 inline-flex items-center gap-1 text-sm'>
            <Label tooltip='The following accounts will be granted control over this account.'>Proxy Information</Label>
          </h6>
          <div className='border-secondary bg-content1 shadow-medium rounded-[20px] border-1 p-5'>
            <ProxySet address={address} />
          </div>
        </div>
      ) : null}

      {account && (
        <div>
          <h6 className='text-foreground/50 mb-2.5 flex items-center gap-1 text-sm'>
            <Label tooltip='Proposers can suggest transactions but cannot approve or execute them. Signers should review and approve transactions first.'>
              Proposer
            </Label>
          </h6>
          <div className='border-secondary bg-content1 shadow-medium space-y-2.5 rounded-[20px] border-1 p-4 sm:p-5'>
            <ProposerSet account={account} refetch={refetch} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSetting;
