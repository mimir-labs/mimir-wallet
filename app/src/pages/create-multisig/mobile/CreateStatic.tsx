// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import React, { useState } from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

import CreateStaticModal from '../components/CreateStaticModal';
import CreateSuccess from '../components/CreateSuccess';

interface Props {
  name?: string;
  signatories: string[];
  threshold: number;
  checkField: () => boolean;
}

function CreateStatic({ checkField, name, signatories, threshold }: Props) {
  const [open, toggleOpen] = useToggle(false);
  const { addAddress } = useAccount();

  const [isSuccess, setIsSuccess] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  return (
    <>
      {address && <CreateSuccess isOpen={isSuccess} onClose={() => setIsSuccess(false)} address={address} />}
      <Button
        disabled={!name}
        fullWidth
        onClick={() => {
          if (!(name && checkField())) return;

          toggleOpen();
        }}
      >
        Create
      </Button>

      {name && (
        <CreateStaticModal
          isOpen={open}
          onClose={() => toggleOpen(false)}
          name={name}
          signatories={signatories}
          threshold={threshold}
          onSuccess={(address: string) => {
            addAddress(address, name);
            setAddress(address);
            toggleOpen(false);
            setIsSuccess(true);
          }}
        />
      )}
    </>
  );
}

export default React.memo(CreateStatic);
