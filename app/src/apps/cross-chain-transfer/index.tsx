// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  getSupportedDestinations,
  NetworkProvider,
  useChain,
} from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, cn, Divider } from '@mimir-wallet/ui';
import { useEffect, useMemo, useState } from 'react';

import FeeInfo from './FeeInfo';
import { useXcmFeeEstimate } from './useXcmFeeEstimate';

import { useAccount } from '@/accounts/useAccount';
import { TxButton } from '@/components';
import AddressCell from '@/components/AddressCell';
import FormatBalance from '@/components/FormatBalance';
import InputAddress from '@/components/InputAddress';
import InputNetwork from '@/components/InputNetwork';
import {
  AmountInput,
  InputNetworkToken,
  InputNetworkTokenProvider,
  useInputNetworkTokenContext,
} from '@/components/InputNetworkToken';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { parseUnits } from '@/utils';

interface CrossChainTransferFormProps {
  sending: string;
  token: ReturnType<typeof useInputNetworkTokenContext>['token'];
  fromNetwork: string;
}

/**
 * Form component that holds resettable state (toNetwork, amount)
 * Gets remounted via key prop when source (network + token) changes
 */
function CrossChainTransferForm({
  sending,
  token,
  fromNetwork,
}: CrossChainTransferFormProps) {
  const [recipient, setRecipient] = useState(sending);
  const upSm = useMediaQuery('sm');

  // Form state - automatically reset when parent changes key
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [toNetwork, setToNetwork] = useState('');

  // Reset amount when destination network changes (fees may differ)
  useEffect(() => {
    setAmount('');
  }, [toNetwork, setAmount]);

  // Get chain configurations
  const fromChain = useChain(fromNetwork);
  const toChain = useChain(toNetwork || undefined);
  const supportedDestinations = useMemo(
    () =>
      getSupportedDestinations(fromNetwork, token?.token).map(
        (item) => item.key,
      ),
    [fromNetwork, token],
  );

  // XCM fee estimation and validation hook
  const {
    originFee,
    destFee,
    receivableAmount,
    minTransferAmount,
    time,
    isLoading,
    isFetched,
    isFormValid,
    error,
    getCall,
  } = useXcmFeeEstimate({
    fromChain,
    toChain,
    token,
    amount,
    senderAddress: sending,
    recipient,
  });

  // Use estimated origin fee for Max button calculation
  // Only origin fee is deducted from Max - dest fee is paid from the transferred amount
  const feesForMax = useMemo(
    () => ({
      originFee,
    }),
    [originFee],
  );

  // Check if amount is below minimum transfer amount
  const isBelowMinimum = useMemo(() => {
    if (!minTransferAmount || !amount || !token?.token.decimals) return false;

    try {
      const amountInSmallestUnit = parseUnits(amount, token.token.decimals);

      return BigInt(amountInSmallestUnit) < BigInt(minTransferAmount.fee);
    } catch {
      return false;
    }
  }, [minTransferAmount, amount, token]);

  // Check if recipient is a pure proxy (mock for now)
  const isPureProxy = false;

  return (
    <div className="card-root p-3 sm:p-6 flex flex-col gap-5">
      {/* Header with gradient title */}
      <h4 className="bg-linear-to-r from-[#0194ff] to-[#d306ff] bg-clip-text text-transparent font-extrabold">
        Cross-chain Transfer
      </h4>

      <Divider />

      {/* Sending from */}
      <div className="flex flex-col gap-2">
        <label className="font-bold">Sending From</label>
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

      {/* Select Networks */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">Select Networks</span>
        <div className="grid grid-cols-2 gap-1.5">
          {/* Token selector */}
          <InputNetworkToken
            label="Transfer"
            variant="inline-label"
            className="col-span-1"
          />

          <InputNetwork
            xcmOnly
            label="To"
            network={toNetwork}
            supportedNetworks={supportedDestinations}
            setNetwork={setToNetwork}
            excludeNetworks={fromNetwork ? [fromNetwork] : undefined}
            variant="inline-label"
            align="end"
            className="col-span-1"
            contentClassName="h-full"
          />
        </div>
      </div>

      {/* Amount input - separate row with standalone styling */}
      {/* Max disabled when: no destination selected or fee is loading */}
      <AmountInput
        variant="standalone"
        label="Amount"
        labelExtra={
          minTransferAmount && (
            <span
              className={cn(
                'text-xs',
                isBelowMinimum ? 'text-danger' : 'text-foreground/50',
              )}
            >
              Minimum:{' '}
              <FormatBalance
                value={minTransferAmount.fee}
                format={[minTransferAmount.decimals, minTransferAmount.symbol]}
                withCurrency
              />
            </span>
          )
        }
        amount={amount}
        isAmountValid={isAmountValid}
        setAmount={setAmount}
        token={token?.token}
        feesToDeduct={feesForMax}
        maxDisabled={!toNetwork || isLoading}
      />

      {/* Recipient */}
      <InputAddress
        label="To"
        value={recipient}
        onChange={setRecipient}
        placeholder="Enter recipient address"
      />

      {/* Fee Info */}
      {!isLoading && isFetched && (
        <FeeInfo
          time={time}
          originFee={originFee}
          destFee={destFee}
          receivableAmount={receivableAmount}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <Divider />

      {/* Warning Alert */}
      {isPureProxy && (
        <Alert variant="warning">
          This Address is a pure proxy on Polkadot
        </Alert>
      )}

      {/* Confirm Button */}
      <NetworkProvider network={fromNetwork}>
        <TxButton
          color="primary"
          website="mimir://app/cross-chain-transfer"
          fullWidth
          disabled={!isFormValid || isLoading || !isAmountValid}
          accountId={sending}
          getCall={getCall}
        >
          {isLoading ? (
            <span className="animate-dots">Loading</span>
          ) : (
            'Confirm'
          )}
        </TxButton>
      </NetworkProvider>
    </div>
  );
}

/**
 * Wrapper that reads context and provides key for form reset
 * When source (network + token) changes, key changes → form remounts → state resets
 */
function CrossChainTransferContent({ sending }: { sending: string }) {
  const { token, network: fromNetwork } = useInputNetworkTokenContext();

  // Key changes when source changes, causing CrossChainTransferForm to remount
  const sourceKey = `${fromNetwork}:${token?.key ?? ''}`;

  return (
    <CrossChainTransferForm
      key={sourceKey}
      sending={sending}
      token={token}
      fromNetwork={fromNetwork}
    />
  );
}

function CrossChainTransfer() {
  const { current } = useAccount();
  const supportedNetworks = useAddressSupportedNetworks(current)?.map(
    (item) => item.key,
  );
  const [initialNetwork] = useInputNetwork(undefined, supportedNetworks);

  return (
    <InputNetworkTokenProvider
      address={current}
      defaultNetwork={initialNetwork}
      supportedNetworks={supportedNetworks}
      xcmOnly
    >
      <CrossChainTransferContent sending={current || ''} />
    </InputNetworkTokenProvider>
  );
}

export default CrossChainTransfer;
