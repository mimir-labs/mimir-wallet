// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionResult } from '../types';

import { useAccount } from '@/accounts/useAccount';
import PureIcon from '@/assets/images/pure-icon.svg';
import { AddressCell, ProxyControls } from '@/components';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Modal, ModalBody, ModalContent, ModalFooter } from '@mimir-wallet/ui';

import { DEFAULT_PURE_ACCOUNT_NAME } from '../utils';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionResult: TransactionResult | null;
  network: string;
}

function SuccessModal({ isOpen, onClose, transactionResult, network }: SuccessModalProps) {
  const navigate = useNavigate();
  const [isCopied, copy] = useCopyClipboard(2000);
  const { setCurrent } = useAccount();

  const handleStartUsing = () => {
    // Set current account based on transaction type
    if (transactionResult?.context?.type === 'pure') {
      // For pure proxy, the pure account address should be in the events
      const pureAccount = transactionResult.events?.pureCreated?.pureAccount;

      if (pureAccount) {
        setCurrent(pureAccount);
      }
    } else if (transactionResult?.context?.proxied) {
      // For regular proxy, set the proxied account as current
      setCurrent(transactionResult.context.proxied);
    }

    onClose();
    navigate('/'); // Navigate to profile page
  };

  const handleGoToPending = () => {
    // Get the account address based on transaction type
    let accountAddress: string | undefined;

    if (transactionResult?.context?.type === 'pure') {
      // For pure proxy, use the proxy address (who created the pure)
      accountAddress = transactionResult.context.proxy;
    } else {
      // For regular proxy, use the proxied address
      accountAddress = transactionResult?.context?.proxied;
    }

    onClose();

    // Navigate to transactions page with the specific account
    if (accountAddress) {
      navigate(`/transactions?address=${accountAddress}&network=${network}`);
    } else {
      navigate(`/transactions?network=${network}`);
    }
  };

  const handleShareToSigners = () => {
    // Get the account address based on transaction type
    let accountAddress: string | undefined;
    let shareUrl: string = '';

    if (transactionResult?.context?.type === 'pure') {
      // For pure proxy, use the proxy address (who created the pure)
      accountAddress = transactionResult.context.proxy;
    } else {
      // For regular proxy, use the proxied address
      accountAddress = transactionResult?.context?.proxied;
    }

    // Construct the URL to share
    if (accountAddress) {
      shareUrl = `${window.location.origin}/transactions?address=${accountAddress}&network=${network}`;
    } else {
      shareUrl = `${window.location.origin}/transactions?network=${network}`;
    }

    // Copy to clipboard using the custom hook
    copy(shareUrl);
  };

  const getTitle = () => {
    const isPending = transactionResult?.isPending ?? false;
    const type = transactionResult?.context?.type ?? 'proxy';

    if (type === 'pure') {
      return (
        <>
          Your <span className='text-primary'>Pure Account</span>{' '}
          {isPending ? 'was successfully initiated!' : 'was successfully created!'}
        </>
      );
    }

    return (
      <>
        Your <span className='text-primary'>proxy Relationship</span>{' '}
        {isPending ? 'was successfully initiated!' : 'is now active!'}
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md' hideCloseButton>
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-5 pt-10'>
          <div className='bg-primary flex h-[120px] w-[120px] items-center justify-center rounded-[30px]'>
            <img src='/images/congrats.png' className='w-20' />
          </div>

          <div className='text-center'>
            <h2 className='text-foreground text-xl font-bold'>{getTitle()}</h2>
          </div>

          {/* Account Relationship Display */}
          <div className='relative flex w-full flex-col items-center gap-[5px]'>
            {/* Proxy Account (Upper) */}
            <div className='bg-secondary w-full rounded-[10px] p-2.5'>
              <AddressCell shorten={false} value={transactionResult?.context?.proxy} />
            </div>

            <ProxyControls
              tiny
              proxyType={transactionResult?.context?.proxyType || 'Any'}
              className='!absolute inset-x-auto inset-y-0 z-10 m-auto'
            />

            {/* Proxied Account (Lower) */}
            {transactionResult?.context?.type === 'pure' ? (
              <div className='bg-secondary flex h-14 w-full items-center gap-2.5 rounded-[10px] px-2.5'>
                <img src={PureIcon} style={{ width: 30 }} />
                <span className='text-foreground font-bold'>
                  {transactionResult.context.pureProxyName || DEFAULT_PURE_ACCOUNT_NAME}
                </span>
              </div>
            ) : (
              <div className='bg-secondary w-full rounded-[10px] p-2.5'>
                <AddressCell value={transactionResult?.context?.proxied} />
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className='flex-col'>
          {/* Action Buttons */}
          {transactionResult?.isPending ? (
            <>
              <Button fullWidth color='primary' radius='full' onClick={handleGoToPending}>
                Go to Pending
              </Button>
              <Button fullWidth variant='bordered' color='primary' radius='full' onClick={handleShareToSigners}>
                {isCopied ? '✅ Copied' : 'Share to other Signers'}
              </Button>
            </>
          ) : (
            <Button fullWidth color='primary' radius='full' onClick={handleStartUsing}>
              Start using
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default memo(SuccessModal);
