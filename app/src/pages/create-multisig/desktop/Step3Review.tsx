// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Divider } from '@mimir-wallet/ui';

import AddPureProxy from '../components/AddPureProxy';

import AccountStructure from './AccountStructure';

import { Input, InputNetwork, NetworkErrorAlert } from '@/components';
import AddressRow from '@/components/AddressRow';
import { useSupportsProxy } from '@/hooks/useChainCapabilities';

interface Step3ReviewProps {
  name: string;
  members: string[];
  threshold: number;
  isPureProxy: boolean;
  network: string;
  onNameChange: (name: string) => void;
  setNetwork: (network: string) => void;
  onPureProxyChange: (value: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
}

function Step3Review({
  isPureProxy,
  members,
  name,
  network,
  onNameChange,
  setNetwork,
  onBack,
  onConfirm,
  onPureProxyChange,
  threshold,
}: Step3ReviewProps) {
  const currentNetwork = useNetwork();
  const targetNetwork = isPureProxy ? network : currentNetwork.network;
  const { supportsProxy: isProxyModuleSupported } =
    useSupportsProxy(targetNetwork);

  return (
    <div className="flex flex-col gap-4">
      {/* Account Structure Visualization */}
      <div className="flex flex-col gap-1">
        <label className="text-foreground text-sm font-bold">Account</label>
        <AccountStructure
          isPureProxy={isPureProxy}
          name={name}
          members={members}
          threshold={threshold}
        />
      </div>

      {/* Name Review */}
      <Input
        label="Name"
        placeholder="Enter multisig name"
        value={name}
        onChange={onNameChange}
        helper={
          <p className="text-foreground/50 text-xs">
            This name will be visible to all Signers and can be changed anytime.
          </p>
        }
      />

      {/* Add Pure Proxy */}
      <AddPureProxy
        isDisabled
        isPureProxy={isPureProxy}
        onPureProxyChange={onPureProxyChange}
      />

      {/* Network */}
      {isPureProxy ? (
        <InputNetwork
          label="Select Network"
          network={network}
          setNetwork={setNetwork}
        />
      ) : null}

      {/* Multisig Signers Review */}
      <div className="flex flex-col gap-1">
        <label className="text-foreground text-sm font-bold">
          Multisig Signers
        </label>
        <div className="border-divider rounded-[10px] border p-2.5">
          <div className="flex flex-col gap-2.5">
            {members.map((member) => (
              <div
                key={member}
                className="bg-secondary flex items-center gap-1 rounded-[5px] px-1 py-1"
              >
                <AddressRow
                  className="[&_.AddressRow-Address]:text-muted-foreground"
                  value={member}
                  withAddress
                  withName
                  iconSize={20}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threshold Review */}
      <div className="flex flex-col gap-1">
        <label className="text-foreground text-sm font-bold">Threshold</label>
        <div className="bg-secondary rounded-[10px] px-2.5 py-2">
          <span className="text-foreground text-sm">
            {threshold} out of {members.length}
          </span>
        </div>
      </div>

      {/* Divider */}
      <Divider className="bg-secondary" />

      {/* Proxy Module Not Supported Alert */}
      {isPureProxy && !isProxyModuleSupported && (
        <Alert variant="destructive">
          <AlertTitle>
            The current network does not support proxy module
          </AlertTitle>
        </Alert>
      )}

      {isPureProxy && <NetworkErrorAlert network={network} />}

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <Button
          fullWidth
          size="md"
          variant="ghost"
          color="primary"
          radius="full"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          fullWidth
          size="md"
          color="primary"
          radius="full"
          onClick={onConfirm}
          disabled={isPureProxy && !isProxyModuleSupported}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

export default Step3Review;
