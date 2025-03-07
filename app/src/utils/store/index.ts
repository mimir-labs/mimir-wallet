// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStore } from './LocalStore';
import { SessionStore } from './SessionStore';

export const store = new LocalStore();
export const session = new SessionStore();
