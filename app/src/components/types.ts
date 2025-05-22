// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type React from 'react';
import type { InputProps as BaseInputProps } from '@mimir-wallet/ui';

export interface InputProps extends Omit<BaseInputProps, 'onChange'> {
  className?: string;
  defaultValue?: string;
  value?: string;
  color?: 'danger' | 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
  label?: React.ReactNode;
  error?: Error | null;
  autoFocus?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  placeholder?: string;
  type?: string;
  fullWidth?: boolean;
  helper?: React.ReactNode;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endButton?: React.ReactNode;
  autoComplete?: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password';
  tabIndex?: number;
  onChange?: (value: string) => void;
}

export interface InputAddressProps {
  className?: string;
  format?: [decimals: number, unit: string];
  iconSize?: number;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  onChange?: (value: string) => void;
  withBalance?: boolean;
  balance?: BN | bigint | string | number | null;
  isSign?: boolean;
  filtered?: string[];
  excluded?: string[];
  shorten?: boolean;
  helper?: React.ReactNode;
}

export interface InputNumberProps extends Omit<InputProps, 'defaultValue' | 'value' | 'onChange'> {
  format?: [decimals: number, unit: string];
  defaultValue?: string | { toString: () => string };
  value?: string;
  onChange?: (value: string) => void;
  maxValue?: string | { toString: () => string } | null;
  withMax?: boolean;
}
