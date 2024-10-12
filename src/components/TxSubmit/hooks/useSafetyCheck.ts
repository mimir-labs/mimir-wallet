// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import { useEffect, useState } from 'react';

import { useApi, useToggle } from '@mimir-wallet/hooks';
import { SafetyLevel } from '@mimir-wallet/hooks/types';
import { service } from '@mimir-wallet/utils';

export function useSafetyCheck(call: IMethod) {
  const { api } = useApi();
  const [safetyCheck, setSafetyCheck] = useState<SafetyLevel>();
  const [isConfirm, , setConfirm] = useToggle(false);

  useEffect(() => {
    service.safetyCheck(call.toHex()).then((level) => {
      if (level.severity === 'none') {
        setConfirm(true);
      }

      setSafetyCheck(level);
    });
  }, [api, call, setConfirm]);

  return [safetyCheck, isConfirm, setConfirm] as const;
}
