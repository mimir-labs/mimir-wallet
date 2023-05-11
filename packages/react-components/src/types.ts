// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import type React from 'react';

export interface BaseInputProps<T> {
  defaultValue?: T;
  value?: T;
  disabled?: boolean;
  label?: React.ReactNode;
  error?: Error | null;
  autoFocus?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  placeholder?: string;
  type?: string;
  fullWidth?: boolean;
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
  onChange?: (value: T) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}
