// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VERSION: string;
  }
}
