// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNetwork } from '@mimir-wallet/polkadot-core';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@mimir-wallet/ui';
import React, { lazy, Suspense, useRef } from 'react';
import { useToggle } from 'react-use';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { FlowSkeleton, InputNetwork } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const AddressOverview = lazy(() => import('@/components/AddressOverview'));

interface RelationProps {
  address: string;
  supportedNetworks?: string[];
  setNetwork: (network: string) => void;
}

function Relation({ address, supportedNetworks, setNetwork }: RelationProps) {
  const { network } = useNetwork();
  const [account] = useQueryAccount(address);
  const ref = useRef<HTMLDivElement>(null);
  const upSm = useMediaQuery('sm');
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div
        ref={ref}
        className="xs:h-[calc(100dvh-500px)] card-root relative h-[300px] min-h-[360px] w-full"
      >
        <Button
          variant="light"
          className="absolute z-1 inline-flex sm:hidden"
          onClick={toggleOpen}
        >
          Overview
        </Button>
        <div className="bg-background absolute top-4 right-4 z-1 w-[200px]">
          <InputNetwork
            network={network}
            supportedNetworks={supportedNetworks}
            setNetwork={setNetwork}
          />
        </div>
        {account ? (
          <Suspense fallback={<FlowSkeleton />}>
            <AddressOverview
              key={`${account.address}-${network}`}
              account={account}
              showControls={upSm}
              showMiniMap={false}
            />
          </Suspense>
        ) : (
          <FlowSkeleton />
        )}
      </div>
      <Modal size="5xl" isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Overview</ModalHeader>
          <ModalBody>
            <div className="bg-secondary h-[80dvh] w-full">
              {account ? (
                <Suspense fallback={<FlowSkeleton />}>
                  <AddressOverview
                    key={`${account.address}-${network}`}
                    account={account}
                    showControls
                    showMiniMap={false}
                  />
                </Suspense>
              ) : (
                <FlowSkeleton />
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Relation);
