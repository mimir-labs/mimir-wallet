// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  remoteProxyRelations,
  useChain,
  useChains,
} from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Avatar, Switch } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell, InputAddress } from '@/components';
import {
  InputTokenAmount,
  useInputTokenAmountContext,
} from '@/components/InputTokenAmount';
import { MigrationTip } from '@/features/assethub-migration';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface TransferContentProps {
  sending: string;
  recipient: string;
  disabledSending?: boolean;
  disabledRecipient?: boolean;
  filterSending?: string[];
  setSending?: (sending: string) => void;
  setRecipient?: (recipient: string) => void;
}

function TransferContent({
  sending,
  recipient,
  disabledSending,
  disabledRecipient,
  filterSending,
  setSending,
  setRecipient,
}: TransferContentProps) {
  // Get data from context
  const {
    value: tokenValue,
    isAmountValid,
    keepAlive,
    setKeepAlive,
  } = useInputTokenAmountContext();

  const chain = useChain(tokenValue?.network ?? '');
  const { chains } = useChains();

  const upSm = useMediaQuery('sm');
  const { meta: recipientMeta } = useAddressMeta(recipient);
  const [recipientAccount] = useQueryAccountOmniChain(recipient);
  const recipientNetwork =
    recipientAccount?.type === 'pure'
      ? chains.find((item) => item.genesisHash === recipientAccount.network)
      : undefined;

  // Check if recipient is supported on current network
  const isRecipientSupported = useMemo(() => {
    return recipientAccount?.type === 'pure'
      ? recipientAccount.network === chain.genesisHash ||
          chain.genesisHash === remoteProxyRelations[recipientAccount.network]
      : true;
  }, [recipientAccount, chain]);

  // Helper text for remote proxy
  const remoteProxyHelper = useMemo(() => {
    const genesisHash = chain.genesisHash;

    const isRecipientRemoteProxy =
      recipientMeta &&
      recipientMeta.isPure &&
      remoteProxyRelations[recipientMeta.pureCreatedAt] === genesisHash;

    if (isRecipientRemoteProxy) {
      return (
        <div className="text-foreground">
          🥷✨Yep, remote proxy lets you borrow a ninja from another chain —
          smooth and stealthy! 🕶️
        </div>
      );
    }

    return null;
  }, [chain.genesisHash, recipientMeta]);

  return (
    <>
      {disabledSending ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">Sending From</p>
          <div className="bg-secondary rounded-[10px] p-2">
            <AddressCell
              shorten={!upSm}
              showType
              value={sending}
              withCopy
              withAddressBook
            />
          </div>
        </div>
      ) : (
        <InputAddress
          isSign
          filtered={filterSending}
          label="Sending From"
          onChange={setSending}
          placeholder="Sender"
          value={sending}
        />
      )}

      {disabledRecipient ? (
        <div className="flex flex-col gap-2">
          <p className="font-bold">To</p>
          <div className="bg-secondary rounded-[10px] p-2">
            <AddressCell
              shorten={!upSm}
              showType
              value={recipient}
              withCopy
              withAddressBook
            />
          </div>
        </div>
      ) : (
        <InputAddress
          label="Recipient"
          onChange={setRecipient}
          placeholder="Recipient"
          value={recipient}
        />
      )}

      {/* Combined Token + Network + Amount input (from context) */}
      <InputTokenAmount
        label="Transfer"
        error={isAmountValid ? null : new Error('Invalid number')}
        helper={remoteProxyHelper}
      />

      <label className="flex items-center justify-end gap-2">
        <Switch
          checked={keepAlive}
          onCheckedChange={(value) => setKeepAlive(value)}
        />
        <span className="text-sm">Keep Sender Alive</span>
      </label>

      {!isRecipientSupported && (
        <Alert variant="destructive">
          <AlertTitle>
            You are about to transfer to a pure account only exist on{' '}
            <Avatar
              src={recipientNetwork?.icon}
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                backgroundColor: 'transparent',
              }}
            />
            &nbsp;
            {recipientNetwork?.name}, please change to correct network.
          </AlertTitle>
        </Alert>
      )}

      <MigrationTip type="transfer" chain={tokenValue?.network ?? ''} />
    </>
  );
}

export default React.memo(TransferContent);
