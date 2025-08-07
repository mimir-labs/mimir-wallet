// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyArgs, TransactionResult } from '../types';

import PureIcon from '@/assets/images/pure-icon.svg';
import { AddressCell, ProxyControls } from '@/components';
import { toastError } from '@/components/utils';
import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { allEndpoints, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Button, buttonSpinner, Divider } from '@mimir-wallet/ui';

import SafetyWarningModal from '../components/SafetyWarningModal';
import { useDelayCalculation } from '../hooks/useDelayCalculation';
import { useProxySafetyCheck } from '../hooks/useProxySafetyCheck';
import { useProxyTransaction } from '../hooks/useProxyTransaction';
import { DEFAULT_PURE_ACCOUNT_NAME, proxyTypeDescriptions } from '../utils';
import ProxyAccountStructure from './ProxyAccountStructure';

interface ProxyWizardData {
  proxied: string | undefined;
  proxy: string | undefined;
  isPureProxy: boolean;
  pureProxyName?: string;
  proxyType: string;
  hasDelay: boolean;
  delayType: 'hour' | 'day' | 'week' | 'custom';
  customBlocks: string;
}

interface Step3ReviewProps {
  wizardData: ProxyWizardData;
  network: string;
  onBack: () => void;
  onConfirm: (result: TransactionResult) => void;
}

function Step3Review({ wizardData, onBack, onConfirm }: Step3ReviewProps) {
  const { chain, genesisHash, network } = useApi();
  const [alertOpen, toggleAlertOpen] = useToggle(false);
  const [detectedControllers, setDetectedControllers] = useState<string[]>([]);

  // Use delay calculation hook
  const { delayInBlocks, delayDisplay } = useDelayCalculation({
    delayType: wizardData.delayType,
    customBlocks: wizardData.customBlocks,
    hasDelay: wizardData.hasDelay
  });

  // Use safety check hook
  const { checkSafety, result: safetyResult } = useProxySafetyCheck();

  // Use proxy transaction hook
  const { submitPureProxy, submitProxyAddition, isLoading: isTransactionLoading } = useProxyTransaction();

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );

  // For pure proxy creation
  const handlePureSubmit = useCallback(async () => {
    if (!wizardData.proxy) return;
    toggleAlertOpen(false);

    await submitPureProxy({
      network,
      accountId: wizardData.proxy,
      proxyType: wizardData.proxyType,
      delay: delayInBlocks,
      pureName: wizardData.pureProxyName || 'Pure Proxy',
      onSuccess: onConfirm,
      onError: (error) => {
        toastError(error);
      }
    });
  }, [
    wizardData.proxy,
    wizardData.proxyType,
    wizardData.pureProxyName,
    toggleAlertOpen,
    submitPureProxy,
    network,
    delayInBlocks,
    onConfirm
  ]);

  // For regular proxy submission
  const handleProxySubmit = useCallback(async () => {
    if (!wizardData.proxied || !wizardData.proxy) return;

    toggleAlertOpen(false);

    const proxyArgs: ProxyArgs = {
      delegate: wizardData.proxy,
      proxyType: wizardData.proxyType,
      delay: delayInBlocks
    };

    await submitProxyAddition({
      network,
      accountId: wizardData.proxied,
      proxyArgs: proxyArgs,
      onSuccess: onConfirm,
      onError: (error) => {
        toastError(error);
      }
    });
  }, [submitProxyAddition, network, wizardData, delayInBlocks, onConfirm, toggleAlertOpen]);

  // Handle safety check and submission
  const handleSafetyCheck = useCallback(async () => {
    if (!wizardData.proxy) return;

    const safetyResult = await checkSafety(wizardData.proxy);

    if (safetyResult.hasWarnings) {
      setDetectedControllers(safetyResult.indirectControllers);
      toggleAlertOpen(true);
    } else {
      if (wizardData.isPureProxy && wizardData.proxy) {
        // Handle Pure proxy creation
        handlePureSubmit();
      } else {
        handleProxySubmit();
      }
    }
  }, [wizardData.proxy, wizardData.isPureProxy, checkSafety, toggleAlertOpen, handlePureSubmit, handleProxySubmit]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Account Structure Overview */}
      {wizardData.proxy && (
        <ProxyAccountStructure
          proxy={wizardData.proxy}
          proxied={wizardData.proxied}
          pureName={wizardData.pureProxyName}
          isPureProxy={wizardData.isPureProxy}
          proxyType={wizardData.proxyType}
          hasDelay={wizardData.hasDelay}
        />
      )}

      {/* Simple Account Display */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Account</label>

        <div className='relative flex flex-col items-center gap-[5px]'>
          {/* Proxy Account (Upper) */}
          <div className='bg-secondary w-full rounded-[10px] p-2.5'>
            <AddressCell shorten={false} value={wizardData.proxy} />
          </div>

          <ProxyControls
            proxyType={wizardData.proxyType.toUpperCase()}
            className='!absolute inset-x-auto inset-y-0 z-10 m-auto'
          />

          {/* Proxied Account / Pure Proxy (Lower) */}
          {wizardData.isPureProxy ? (
            <div className='bg-secondary flex h-14 w-full items-center gap-2.5 rounded-[10px] px-2.5'>
              <img src={PureIcon} style={{ width: 30 }} />
              <span className='text-foreground font-bold'>{wizardData.pureProxyName || DEFAULT_PURE_ACCOUNT_NAME}</span>
            </div>
          ) : (
            <div className='bg-secondary w-full rounded-[10px] p-2.5'>
              <AddressCell shorten={false} value={wizardData.proxied} />
            </div>
          )}
        </div>
      </div>

      {/* Permission Level Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Permission Level</label>
        <div className='bg-secondary flex items-center gap-[5px] rounded-[10px] px-3 py-2.5'>
          <span className='text-foreground text-sm font-medium'>{wizardData.proxyType}</span>
          {proxyTypeDescriptions[wizardData.proxyType] && (
            <span className='text-foreground/50 text-xs'>- {proxyTypeDescriptions[wizardData.proxyType]}</span>
          )}
        </div>
      </div>

      {/* Time Delay Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Time Delay</label>
        <div className='bg-secondary rounded-[10px] px-3 py-2.5'>
          <span className='text-foreground text-sm'>{delayDisplay}</span>
        </div>
      </div>

      {/* Network Review */}
      <div className='flex flex-col gap-1'>
        <label className='text-foreground text-sm font-bold'>Network</label>
        <div className='bg-secondary flex items-center gap-2 rounded-[10px] px-3 py-2'>
          <img src={chain.icon} className='h-5 w-5' alt={chain.name} />
          <span className='text-foreground text-sm'>{chain.name}</span>
          {remoteProxyChain && (
            <>
              <span className='text-foreground text-sm'>(also on</span>
              <img src={remoteProxyChain.icon} className='h-5 w-5' alt={remoteProxyChain.name} />
              <span className='text-foreground text-sm'>{remoteProxyChain.name}</span>
              <span className='text-foreground text-sm'>due to remote proxy)</span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <Divider />

      {/* Action Buttons */}
      <div className='flex gap-2.5'>
        <Button fullWidth size='md' variant='ghost' color='primary' radius='full' onClick={onBack}>
          Back
        </Button>
        <Button
          fullWidth
          size='md'
          color='primary'
          radius='full'
          onClick={handleSafetyCheck}
          disabled={
            safetyResult.isLoading ||
            isTransactionLoading ||
            !wizardData.proxy ||
            (!wizardData.isPureProxy && !wizardData.proxied)
          }
        >
          {safetyResult.isLoading || isTransactionLoading ? buttonSpinner : null}
          Confirm
        </Button>
      </div>

      {/* Safety Warning Modal */}
      <SafetyWarningModal
        isOpen={alertOpen}
        onClose={() => toggleAlertOpen(false)}
        onConfirm={wizardData.isPureProxy ? handlePureSubmit : handleProxySubmit}
        indirectControllers={detectedControllers}
      />
    </div>
  );
}

export default Step3Review;
