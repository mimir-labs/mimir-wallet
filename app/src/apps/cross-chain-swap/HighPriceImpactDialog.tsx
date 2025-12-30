// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@mimir-wallet/ui';

interface HighPriceImpactDialogProps {
  open: boolean;
  priceImpact: number;
  onClose: () => void;
  onContinue: () => void;
}

function HighPriceImpactDialog({
  open,
  priceImpact,
  onClose,
  onContinue,
}: HighPriceImpactDialogProps) {
  const priceImpactPercent = (priceImpact * 100).toFixed(2);

  return (
    <Modal size="sm" onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader className="justify-between">
          <span>Attention</span>
        </ModalHeader>
        <Divider />
        <ModalBody className="gap-y-4 pb-5">
          <p className="text-sm text-foreground/80">
            High price impact(~{priceImpactPercent}%) may reduce the actual
            value of the tokens received. Please confirm if you wish to proceed.
          </p>

          <Button
            className="bg-warning text-warning-foreground hover:bg-warning/90"
            fullWidth
            onClick={onContinue}
          >
            Continue
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default HighPriceImpactDialog;
