// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MemberSet from './MemberSet';
import ProposerSet from './ProposerSet';
import ProxySet from './ProxySet';
import PureMemberSet from './PureMemberSet';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { Input, Label } from '@/components';
import { toastSuccess } from '@/components/utils';

function AccountSetting() {
  const { isLocalAccount, current: address } = useAccount();
  const { setName, name, saveName } = useAddressMeta(address);
  const [error, setError] = useState<Error>();
  const [account, , , refetch] = useQueryAccountOmniChain(address);

  // Create refs for each section
  const nameRef = useRef<HTMLDivElement>(null);
  const multisigRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);
  const proposerRef = useRef<HTMLDivElement>(null);

  // Memoize section map to avoid recreation on every effect run
  const sectionMap = useMemo<
    Record<string, React.RefObject<HTMLDivElement | null>>
  >(
    () => ({
      name: nameRef,
      multisig: multisigRef,
      proxy: proxyRef,
      proposer: proposerRef,
    }),
    [],
  );

  // Handle hash navigation with smooth scroll and highlight animation
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const handleHashNavigation = () => {
      const hash = window.location.hash.slice(1); // Remove # prefix

      if (!hash) return;

      const targetRef = sectionMap[hash];

      // Only scroll and highlight if the section exists and is mounted
      if (targetRef?.current) {
        const target = targetRef.current;

        // Small delay to ensure DOM is ready
        setTimeout(() => {
          // Smooth scroll to target section
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Add highlight animation
          target.classList.add('animate-highlight');
        }, 30);

        // Remove animation after 3 seconds
        timer = setTimeout(() => {
          target.classList.remove('animate-highlight');
        }, 3000);
      }
    };

    // Run on mount and when hash changes
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [sectionMap]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleNameChange = useCallback(
    (value: string) => {
      if (value) {
        setError(undefined);
      }

      setName(value);
    },
    [setName],
  );

  const handleSaveName = useCallback(() => {
    if (!name) {
      setError(new Error('Please input wallet name'));
    } else {
      saveName(false, (name) => toastSuccess(`Save name to ${name} success`));
    }
  }, [name, saveName]);

  return (
    <div className="mx-auto my-0 w-[500px] max-w-full space-y-5">
      <div ref={nameRef} id="name">
        <h6 className="text-foreground/50 mb-2.5 text-sm">Name</h6>
        <div className="card-root space-y-2.5 p-4 sm:p-5">
          <Input
            label="Name"
            onChange={handleNameChange}
            placeholder="Please input account name"
            value={name}
            error={error}
          />
          <p className="text-foreground/50 mt-2.5 text-xs">
            All members will see this name
          </p>
          <Button
            disabled={!(address && isLocalAccount(address))}
            fullWidth
            variant="solid"
            color="primary"
            onClick={handleSaveName}
          >
            Save
          </Button>
        </div>
      </div>

      {account?.type === 'multisig' ? (
        <div ref={multisigRef} id="multisig">
          <h6 className="text-foreground/50 mb-2.5 inline-flex items-center gap-1 text-sm">
            <Label tooltip="For Pure Proxy, each controllable multisig account is listed as a member set.">
              Multisig Information
            </Label>
          </h6>
          <div className="card-root space-y-2.5 sm:p-5">
            <MemberSet account={account} disabled />
          </div>
        </div>
      ) : account?.type === 'pure' ? (
        <NetworkProvider network={account.network}>
          <PureMemberSet account={account} />
        </NetworkProvider>
      ) : null}

      {address ? (
        <div ref={proxyRef} id="proxy">
          <h6 className="text-foreground/50 mb-2.5 inline-flex items-center gap-1 text-sm">
            <Label tooltip="The following accounts will be granted control over this account.">
              Proxy Information
            </Label>
          </h6>
          <div className="card-root p-5">
            <ProxySet address={address} />
          </div>
        </div>
      ) : null}

      {account && (
        <div ref={proposerRef} id="proposer">
          <h6 className="text-foreground/50 mb-2.5 flex items-center gap-1 text-sm">
            <Label tooltip="Proposers can suggest transactions but cannot approve or execute them. Signers should review and approve transactions first.">
              Proposer
            </Label>
          </h6>
          <div className="card-root space-y-2.5 p-4 sm:p-5">
            <ProposerSet account={account} refetch={refetch} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSetting;
