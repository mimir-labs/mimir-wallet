// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SlippageState } from './types';
import type {
  TokenNetworkItem,
  TokenNetworkValue,
} from '@/components/InputNetworkToken';

import {
  buildSwapCall,
  NetworkProvider,
  useChain,
} from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Divider } from '@mimir-wallet/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import HighPriceImpactDialog from './HighPriceImpactDialog';
import SlippageSettingDialog from './SlippageSettingDialog';
import SwapFeeInfo from './SwapFeeInfo';
import ToTokenSection from './ToTokenSection';
import { DEFAULT_SLIPPAGE, PRICE_IMPACT_THRESHOLDS } from './types';
import { useSwapEstimate } from './useSwapEstimate';

import IconSet from '@/assets/svg/icon-set.svg?react';
import IconTransfer from '@/assets/svg/icon-transfer.svg?react';
import { TxButton } from '@/components';
import AddressCell from '@/components/AddressCell';
import InputAddress from '@/components/InputAddress';
import {
  AmountInput,
  findItemByValue,
  InputNetworkToken,
  itemToValue,
  useInputNetworkTokenContext,
  useTokenNetworkData,
} from '@/components/InputNetworkToken';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { parseUnits } from '@/utils';

export interface SwapFormProps {
  sending: string;
  fromToken: TokenNetworkItem | undefined;
  fromNetwork: string;
}

/**
 * Swap form with From/To token selectors and swap logic
 */
function SwapForm({ sending, fromToken, fromNetwork }: SwapFormProps) {
  const upSm = useMediaQuery('sm');

  // Form state
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [recipient, setRecipient] = useState(sending);
  const [slippage, setSlippage] = useState<SlippageState>(DEFAULT_SLIPPAGE);

  // Dialog states
  const [slippageDialogOpen, setSlippageDialogOpen] = useState(false);
  const [priceImpactDialogOpen, setPriceImpactDialogOpen] = useState(false);

  // To token state (managed independently)
  const [toValue, setToValue] = useState<TokenNetworkValue | undefined>(
    undefined,
  );

  // Get context for accessing From token data
  const { setValue: setFromValue } = useInputNetworkTokenContext();

  // Fetch To token data to resolve toValue
  const { items: toItems } = useTokenNetworkData(sending, { xcmOnly: true });

  // Resolve To token from toValue
  const toToken = useMemo(() => {
    if (!toValue) return undefined;

    return findItemByValue(toItems, toValue);
  }, [toItems, toValue]);

  // Get chain configurations
  const fromChain = useChain(fromNetwork);
  const toChain = useChain(toValue?.network || undefined);

  // Swap estimate
  const estimate = useSwapEstimate({
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    slippage,
    senderAddress: sending,
    recipient,
  });

  // Handle swap button click (interchange From/To)
  const handleSwap = useCallback(() => {
    if (!fromToken || !toToken) return;

    // Save current values
    const currentFromValue = itemToValue(fromToken);
    const currentToValue = toValue;

    // Swap
    if (currentToValue) {
      setFromValue(currentToValue);
    }

    setToValue(currentFromValue);
    setAmount('');
  }, [fromToken, toToken, toValue, setFromValue, setAmount]);

  // Check if price impact is high
  const isHighPriceImpact =
    estimate.priceImpact >= PRICE_IMPACT_THRESHOLDS.MEDIUM;

  // Form validation
  const isFormValid =
    !!fromToken &&
    !!toToken &&
    !!amount &&
    isAmountValid &&
    !!recipient &&
    !estimate.isLoading &&
    !estimate.error;

  // Handle confirm button click
  const handleConfirmClick = useCallback(() => {
    if (isHighPriceImpact) {
      setPriceImpactDialogOpen(true);
    }
    // If not high price impact, the TxButton will handle the transaction
  }, [isHighPriceImpact]);

  // Reset amount when tokens change
  useEffect(() => {
    setAmount('');
  }, [
    fromNetwork,
    fromToken?.token.key,
    toValue?.network,
    toValue?.identifier,
    setAmount,
  ]);

  // Build swap transaction using ParaSpell XCM Router
  const getCall = useCallback(async () => {
    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      throw new Error('Missing required parameters');
    }

    // Parse amount to smallest unit
    const amountInSmallestUnit = parseUnits(
      amount,
      fromToken.token.decimals,
    ).toString();

    // Build swap transactions (may return multiple for two-click DEXes)
    const transactions = await buildSwapCall({
      fromChain,
      toChain,
      fromToken: fromToken.token,
      toToken: toToken.token,
      amount: amountInSmallestUnit,
      slippagePct: slippage.value,
      senderAddress: sending,
      recipient,
    });

    if (transactions.length === 0) {
      throw new Error('No swap route found');
    }

    // Return the first transaction for now
    // TODO: Handle multi-step transactions (two-click DEXes) in future iteration
    return transactions[0].tx;
  }, [
    fromChain,
    toChain,
    fromToken,
    toToken,
    amount,
    slippage.value,
    sending,
    recipient,
  ]);

  return (
    <div className="card-root mx-auto mt-5 w-full max-w-[460px] p-3 sm:p-6 flex flex-col gap-5">
      {/* Header with gradient title */}
      <h4 className="bg-linear-to-r from-[#0194ff] to-[#d306ff] bg-clip-text text-transparent font-extrabold">
        Cross-chain Swap
      </h4>

      <Divider />

      {/* Sending from */}
      <div className="flex flex-col gap-2">
        <label className="font-bold">Sending from</label>
        <div className="bg-secondary rounded-[10px] p-2.5">
          <AddressCell
            shorten={!upSm}
            showType
            value={sending}
            withCopy
            withAddressBook
          />
        </div>
      </div>

      {/* Transfer section */}
      <div className="flex flex-col gap-2">
        {/* Transfer label with settings icon */}
        <div className="flex items-center justify-between">
          <span className="font-bold">Transfer</span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={() => setSlippageDialogOpen(true)}
          >
            <IconSet className="size-4 text-foreground/50" />
          </Button>
        </div>

        {/* From row - InputNetworkToken with AmountInput as children */}
        <InputNetworkToken variant="inline-label" label="From">
          <AmountInput
            amount={amount}
            isAmountValid={isAmountValid}
            setAmount={setAmount}
            token={fromToken?.token}
            feesToDeduct={
              estimate.originFee ? { originFee: estimate.originFee } : undefined
            }
            maxDisabled={!toToken || estimate.isLoading}
          />
        </InputNetworkToken>

        {/* Swap button */}
        <div className="flex justify-center -my-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={handleSwap}
            disabled={!fromToken || !toToken}
          >
            <IconTransfer className="size-4 rotate-90" />
          </Button>
        </div>

        {/* To row - InputNetworkToken with output amount display */}
        <ToTokenSection
          address={sending}
          externalValue={toValue}
          onExternalChange={setToValue}
          outputAmount={estimate.outputAmount}
          outputLoading={estimate.isLoading}
        />
      </div>

      {/* Recipient */}
      <InputAddress
        label="To"
        value={recipient}
        onChange={setRecipient}
        placeholder="Enter recipient address"
      />

      {/* Warning for unknown address */}
      {recipient && recipient !== sending && (
        <div className="text-xs text-warning">
          Warning: This is an unknown address. You can add it to your address
          book
        </div>
      )}

      {/* Fee Info */}
      {!estimate.isLoading && estimate.isFetched && (
        <SwapFeeInfo
          time={estimate.estimatedTime}
          originFee={estimate.originFee}
          destFee={estimate.destFee}
          route={estimate.route}
          priceImpact={estimate.priceImpact}
          exchangeRate={estimate.exchangeRate}
        />
      )}

      {/* Error Alert */}
      {estimate.error && (
        <Alert variant="destructive">
          <AlertTitle>{estimate.error}</AlertTitle>
        </Alert>
      )}

      <Divider />

      {/* Confirm Button */}
      <NetworkProvider network={fromNetwork}>
        {isHighPriceImpact ? (
          <Button
            className="bg-warning text-warning-foreground hover:bg-warning/90"
            fullWidth
            disabled={!isFormValid}
            onClick={handleConfirmClick}
          >
            {estimate.isLoading ? (
              <span className="animate-dots">Loading</span>
            ) : (
              'High Price Impact'
            )}
          </Button>
        ) : (
          <TxButton
            color="primary"
            website="mimir://app/cross-chain-swap"
            fullWidth
            disabled={!isFormValid}
            accountId={sending}
            getCall={getCall}
          >
            {estimate.isLoading ? (
              <span className="animate-dots">Loading</span>
            ) : (
              'Confirm'
            )}
          </TxButton>
        )}
      </NetworkProvider>

      {/* Slippage Setting Dialog */}
      <SlippageSettingDialog
        open={slippageDialogOpen}
        value={slippage}
        onChange={setSlippage}
        onClose={() => setSlippageDialogOpen(false)}
      />

      {/* High Price Impact Dialog */}
      <HighPriceImpactDialog
        open={priceImpactDialogOpen}
        priceImpact={estimate.priceImpact}
        onClose={() => setPriceImpactDialogOpen(false)}
        onContinue={() => {
          setPriceImpactDialogOpen(false);
          // TODO: Trigger actual swap transaction
        }}
      />
    </div>
  );
}

export default SwapForm;
