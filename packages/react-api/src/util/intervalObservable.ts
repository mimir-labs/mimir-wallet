// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Subscription } from 'rxjs';
import type { CallState } from '../types';

import { interval } from 'rxjs';

const interval$ = interval(500);

export function intervalObservable<Props, State extends CallState>(that: React.Component<Props, State>): Subscription {
  return interval$.subscribe((): void => {
    const elapsed = Date.now() - ((that.state.callUpdatedAt as number) || 0);
    const callUpdated = elapsed <= 1500;

    if (callUpdated !== that.state.callUpdated) {
      that.setState({
        callUpdated
      });
    }
  });
}
