// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type React from 'react';

export interface InputProps {
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  error?: Error | null;
  autoFocus?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  placeholder?: string;
  type?: string;
  fullWidth?: boolean;
  helper?: React.ReactNode;
  size?: 'medium' | 'small';
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  startButton?: React.ReactNode;
  endButton?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  inputSx?: SystemStyleObject<Theme>;
  autoComplete?: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password';
  tabIndex?: number;
  onChange?: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export interface InputAddressProps {
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  error?: Error | null;
  placeholder?: string;
  onChange?: (value: string) => void;
  withBalance?: boolean;
  balance?: BN | string | number | null;
  isSign?: boolean;
  filtered?: string[];
}

export interface InputNumberProps extends Omit<InputProps, 'defaultValue' | 'value' | 'onChange'> {
  defaultValue?: string | BN;
  value?: BN;
  onChange?: (value: BN) => void;
  maxValue?: BN | null;
  withMax?: boolean;
}

export interface TxButtonProps extends ButtonProps {
  accountId?: AccountId | string | null;
  params?: unknown[] | (() => unknown[]) | null;
  tx?: ((...args: any[]) => SubmittableExtrinsic<'promise'>) | null;
  isMultisigCancel?: boolean;
}
