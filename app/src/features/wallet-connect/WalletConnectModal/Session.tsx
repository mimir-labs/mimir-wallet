// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Web3WalletTypes } from '@walletconnect/web3wallet';

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell } from '@/components';
import { toastError } from '@/components/utils';
import { useContext, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Alert, Avatar, Button, Divider, Link } from '@mimir-wallet/ui';

import { WalletConnectContext } from '../context';
import { approveSession, rejectSession } from '../wallet-connect';

function Session({ proposal, onClose }: { proposal: Web3WalletTypes.SessionProposal; onClose: () => void }) {
  const { current } = useAccount();
  const { deleteProposal } = useContext(WalletConnectContext);
  const [account] = useQueryAccountOmniChain(current);
  const [showFallback, setShowFallback] = useState(false);

  const [rejectState, handleReject] = useAsyncFn(async () => {
    deleteProposal();
    await rejectSession(proposal);
  }, [deleteProposal, proposal]);

  const [approveState, handleApprove] = useAsyncFn(async () => {
    if (!account) {
      return;
    }

    try {
      await approveSession(proposal, account);
      onClose();
    } catch (error) {
      toastError(error);
    }
  }, [account, onClose, proposal]);

  return (
    <div className='flex flex-col items-center gap-5'>
      <Avatar
        showFallback={showFallback}
        fallback={<Avatar src='/images/wallet-connect.webp' alt='wallet connect' style={{ width: 80, height: 80 }} />}
        onError={() => {
          setShowFallback(true);
        }}
        src={
          proposal.params.proposer.metadata.icons?.[0].startsWith('https://')
            ? proposal.params.proposer.metadata.icons?.[0]
            : undefined
        }
        style={{ width: 80, height: 80 }}
      />
      <div>
        <h4 className='text-center text-xl font-bold'>{proposal.params.proposer.metadata.name}</h4>
        <p className='text-small text-center'>
          <Link isExternal href={proposal.params.proposer.metadata.url}>
            {proposal.params.proposer.metadata.url}
          </Link>
        </p>
      </div>
      <p className='text-small'>
        You authorize access to {proposal.params.proposer.metadata.name} with the following identity.
      </p>

      {current ? (
        <div className='rounded-medium bg-secondary w-full p-2.5'>
          <AddressCell shorten={false} value={current} iconSize={30} />
        </div>
      ) : (
        <Alert color='danger' title='Please create or select multisig account' />
      )}

      <Divider />
      {/* <Alert color='warning' title={`Make sure the Dapp is connecting to ${chain.name}`} className='w-full' /> */}
      <div className='flex w-full gap-2.5'>
        <Button
          fullWidth
          radius='full'
          color='primary'
          variant='bordered'
          onPress={handleReject}
          isLoading={rejectState.loading}
        >
          Reject
        </Button>
        <Button fullWidth radius='full' color='primary' onPress={handleApprove} isLoading={approveState.loading}>
          Approve
        </Button>
      </div>
    </div>
  );
}

export default Session;
