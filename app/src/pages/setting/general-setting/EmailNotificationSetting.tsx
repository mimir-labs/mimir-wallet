// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AddressRow, Input, InputAddress } from '@/components';
import { useEmailNotification } from '@/hooks/useEmailNotification';
import { sanitizeEmail } from '@/utils/emailSignatureUtils';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Card } from '@mimir-wallet/ui';

import AccountSelectionModal from './AccountSelectionModal';

interface EmailNotificationSettingProps {
  address: HexString;
}

function EmailNotificationSetting({ address: propsAddress }: EmailNotificationSettingProps) {
  const { chainSS58 } = useApi();
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'bind' | 'unbind' | null>(null);
  const [address, setAddress] = useState<string>(propsAddress);
  const [filteredSigner, setFilteredSigner] = useState<string>();

  const emailNotification = useEmailNotification(address);

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(sanitizeEmail(value));

    // Clear any previous errors when user starts typing
    if (emailNotification.error) {
      emailNotification.clearError();
    }
  };

  // Handle modal confirm
  const handleModalConfirm = useCallback(
    async (signer: string) => {
      try {
        if (pendingAction === 'bind' && email) {
          await emailNotification.bindEmail({ email, signer });
          setEmail(''); // Clear input after successful bind
          toast.success('Email notification subscription created successfully!');
        } else if (pendingAction === 'unbind') {
          await emailNotification.unbindEmail({ signer });
          toast.success('Email notification subscription removed successfully!');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';

        toast.error(message);
      } finally {
        setIsModalOpen(false);
        setPendingAction(null);
      }
    },
    [pendingAction, email, emailNotification]
  );

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  // Handle subscription removal
  const handleRemoveSubscription = useCallback(async (signer: string) => {
    setFilteredSigner(signer);
    setPendingAction('unbind');
    setIsModalOpen(true);
  }, []);

  // Handle subscription add
  const handleAddSubscription = useCallback(async () => {
    setFilteredSigner(undefined);
    setPendingAction('bind');
    setIsModalOpen(true);
  }, []);

  const isLoading = emailNotification.isLoading || emailNotification.isBinding || emailNotification.isUnbinding;

  return (
    <>
      <div>
        <h6 className='text-foreground/50 mb-2.5 text-sm'>Email</h6>
        <Card className='gap-5 p-4 sm:p-5'>
          {/* Email Toggle */}
          <div className='flex w-full max-w-md flex-col gap-2.5'>
            <div className='flex items-center justify-between'>
              <b className='text-sm'>Email Notification</b>
            </div>

            {/* Email Input - only show when no subscription exists */}
            <div className='flex w-full flex-row gap-2.5'>
              <Input placeholder='Email...' value={email} onChange={handleEmailChange} disabled={isLoading} />
            </div>

            {/* Account Display using InputAddress in readonly mode */}
            <InputAddress
              iconSize={20}
              addressType='row'
              shorten
              label={<span className='font-normal'>Subscribe this account</span>}
              wrapperClassName='h-[36px]'
              value={address}
              onChange={(value) => setAddress(encodeAddress(value, chainSS58))}
              placeholder='Please select account'
              helper='You will receive email notification once your account got new transaction information.'
            />
          </div>

          {/* General Error Display */}
          {emailNotification.error && (
            <Alert variant='destructive'>
              <AlertTitle>{emailNotification.error}</AlertTitle>
            </Alert>
          )}

          {/* My Subscription */}
          {emailNotification.subscriptions.length > 0 && (
            <div className='flex flex-col gap-[5px]'>
              <b className='text-sm'>My Subscription</b>
              <div className='border-divider-300 flex flex-col gap-2.5 rounded-[10px] border-1 p-2.5'>
                {emailNotification.subscriptions.map((subscription) => (
                  <div key={subscription.id} className='bg-secondary flex items-center gap-[5px] rounded-[5px] p-[5px]'>
                    <AddressRow iconSize={20} value={subscription.signer} />
                    <span className='text-foreground/50 flex-1'>{subscription.email}</span>

                    <Button
                      onClick={() => handleRemoveSubscription(subscription.signer)}
                      disabled={isLoading}
                      isIconOnly
                      variant='light'
                      size='sm'
                      color='danger'
                    >
                      <IconDelete style={{ width: 16, height: 16 }} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button color='primary' disabled={!email} onClick={handleAddSubscription}>
            Save
          </Button>
        </Card>
      </div>

      {/* Account Selection Modal */}
      {isModalOpen && (
        <AccountSelectionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          title={pendingAction === 'bind' ? 'Choose an Extension account' : 'Confirm Unsubscribe'}
          description={
            pendingAction === 'bind'
              ? 'Select an account to finish the subscription.'
              : 'Are you sure you want to remove email notifications for this account?'
          }
          confirmText={pendingAction === 'bind' ? 'Confirm' : 'Unsubscribe'}
          isLoading={emailNotification.isBinding || emailNotification.isUnbinding}
          filteredAddress={filteredSigner}
        />
      )}
    </>
  );
}

export default EmailNotificationSetting;
