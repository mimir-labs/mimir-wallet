// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useInputNetwork } from '@/hooks/useInputNetwork';
import { forwardRef, useImperativeHandle } from 'react';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';

import AddTemplate from './AddTemplate';
import TemplateList from './TemplateList';
import { useTemplateState } from './useTemplateState';

// Template ref interface for external control
export interface TemplateRef {
  showList: () => void;
  showAdd: (callData?: HexString) => void;
  showView: (name: string, callData: HexString) => void;
  reset: () => void;
  setNetwork: (network: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TemplateProps {}

const Template = forwardRef<TemplateRef, TemplateProps>((_props, ref) => {
  const [network, setNetwork] = useInputNetwork();
  const { api } = useApi();

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

  // Render based on current view state
  const renderContent = () => {
    if (templateState.isAddView) {
      return (
        <AddTemplate
          key={network}
          defaultCallData={templateState.defaultCallData}
          onBack={templateState.actions.showList}
          setNetwork={setNetwork}
          registry={api.registry}
        />
      );
    }

    if (templateState.isViewTemplate) {
      return (
        <AddTemplate
          key={network}
          isView
          defaultCallData={templateState.viewTemplate}
          registry={api.registry}
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
        registry={api.registry}
      />
    );
  };

  return <SubApiRoot network={network}>{renderContent()}</SubApiRoot>;
});

Template.displayName = 'Template';

export default Template;
