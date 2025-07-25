// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from '@/components';
import AddressRow from '@/components/AddressRow';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { Button, Checkbox, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

export interface SafetyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  indirectControllers: string[];
  title?: string;
  description?: string;
  confirmText?: string;
  severity?: 'warning' | 'error' | 'info';
}

/**
 * Unified modal for displaying proxy safety warnings
 * Used for both desktop and mobile versions
 */
function SafetyWarningModal({
  isOpen,
  onClose,
  onConfirm,
  indirectControllers,
  title = 'Safety Alert',
  description = 'We have detected that, because your proxy account also has its own proxy, the following accounts can indirectly control your account.',
  confirmText = 'I Understand',
  severity = 'warning'
}: SafetyWarningModalProps) {
  const [acknowledged, toggleAcknowledged] = useToggle(false);

  const handleClose = () => {
    toggleAcknowledged(false);
    onClose();
  };

  const handleConfirm = () => {
    if (acknowledged) {
      toggleAcknowledged(false);
      onConfirm();
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'primary';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='2xl'>
      <ModalContent>
        <ModalHeader className='flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>{getSeverityIcon()}</span>
            <span className='text-foreground text-lg font-bold'>{title}</span>
          </div>
          {description && <p className='text-foreground/80 text-small max-w-none'>{description}</p>}
        </ModalHeader>

        <Divider />

        <ModalBody className='gap-4'>
          {indirectControllers.length > 0 && (
            <>
              <div className='flex flex-col gap-2'>
                <h4 className='text-foreground text-medium font-semibold'>
                  Indirect Controllers ({indirectControllers.length})
                </h4>
                <p className='text-foreground/60 text-small'>
                  These accounts can control your proxy account and therefore indirectly control your funds:
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                {indirectControllers.map((address, index) => (
                  <div
                    key={address}
                    className='rounded-medium border-divider bg-content2 flex items-center justify-between border-1 p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='bg-warning text-warning-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold'>
                        {index + 1}
                      </div>
                      <AddressRow value={address} withAddress={false} withName />
                    </div>
                    <Address shorten value={address} />
                  </div>
                ))}
              </div>

              <div className='bg-warning/10 border-warning/20 rounded-medium border-1 p-3'>
                <p className='text-warning-600 text-small'>
                  <strong>Security Risk:</strong> These accounts can execute transactions on your behalf. Only proceed
                  if you trust all listed controllers.
                </p>
              </div>
            </>
          )}
        </ModalBody>

        <Divider />

        <ModalFooter>
          <div className='flex w-full flex-col gap-4'>
            <Checkbox size='sm' isSelected={acknowledged} onValueChange={toggleAcknowledged}>
              <span className='text-small'>{confirmText} and accept the security risks</span>
            </Checkbox>

            <div className='flex gap-2'>
              <Button fullWidth variant='ghost' color={getSeverityColor()} onPress={handleClose}>
                Cancel
              </Button>
              <Button fullWidth color={getSeverityColor()} isDisabled={!acknowledged} onPress={handleConfirm}>
                Continue
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default memo(SafetyWarningModal);
