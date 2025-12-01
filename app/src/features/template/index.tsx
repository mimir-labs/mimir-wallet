// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { useImperativeHandle } from 'react';

import AddTemplate from './AddTemplate';
import TemplateList from './TemplateList';
import { useTemplateState } from './useTemplateState';

import { useInputNetwork } from '@/hooks/useInputNetwork';

// Template ref interface for external control
export interface TemplateRef {
  showList: () => void;
  showAdd: (callData?: HexString) => void;
  showView: (name: string, callData: HexString) => void;
  reset: () => void;
  setNetwork: (network: string) => void;
}

// Inner content component that uses network context
function TemplateContent({
  network,
  setNetwork,
  templateState
}: {
  network: string;
  setNetwork: (network: string) => void;
  templateState: ReturnType<typeof useTemplateState>;
}) {
  if (templateState.isAddView) {
    return (
      <AddTemplate
        key={network}
        defaultCallData={templateState.defaultCallData}
        onBack={templateState.actions.showList}
        setNetwork={setNetwork}
      />
    );
  }

  if (templateState.isViewTemplate) {
    return (
      <AddTemplate
        key={network}
        isView
        defaultCallData={templateState.viewTemplate}
        defaultName={templateState.viewTemplateName}
        onBack={templateState.actions.showList}
      />
    );
  }

  return (
    <TemplateList
      key={network}
      onAdd={() => templateState.actions.showAdd()}
      onView={templateState.actions.showView}
      setNetwork={setNetwork}
    />
  );
}

interface TemplateProps {
  ref?: React.Ref<TemplateRef>;
}

function Template({ ref }: TemplateProps) {
  const [network, setNetwork] = useInputNetwork();

  // Internal state management
  const templateState = useTemplateState({
    network
  });

  // Expose methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      showList: templateState.actions.showList,
      showAdd: templateState.actions.showAdd,
      showView: templateState.actions.showView,
      reset: templateState.actions.reset,
      setNetwork: setNetwork
    }),
    [templateState.actions, setNetwork]
  );

  return (
    <NetworkProvider network={network}>
      <TemplateContent network={network} setNetwork={setNetwork} templateState={templateState} />
    </NetworkProvider>
  );
}

Template.displayName = 'Template';

export default Template;
