// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStore } from './LocalStore.js';
import { SessionStore } from './SessionStore.js';

export { LocalStore, SessionStore };

export const store = new LocalStore();
export const session = new SessionStore();
