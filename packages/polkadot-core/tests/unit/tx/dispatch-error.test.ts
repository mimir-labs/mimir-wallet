// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import {
  assetDispatchError,
  assetXcmV5TraitsError,
  TxDispatchError,
  TxModuleError
} from '../../../src/tx/dispatch-error.js';

// Helper to create mock API
function createMockApi(metaError?: { section: string; method: string; docs: string[] }) {
  return {
    registry: {
      findMetaError: vi.fn().mockReturnValue(
        metaError || {
          section: 'balances',
          method: 'InsufficientBalance',
          docs: ['Balance too low to send value.']
        }
      )
    }
  } as any;
}

// Helper to create mock dispatch error
function createMockDispatchError(type: 'Module' | 'Token' | 'Arithmetic' | 'Transactional' | 'Other', value?: any) {
  const error: any = {
    type,
    isModule: type === 'Module',
    isToken: type === 'Token',
    isArithmetic: type === 'Arithmetic',
    isTransactional: type === 'Transactional'
  };

  if (type === 'Module') {
    error.asModule = value || { index: 0, error: 0 };
  } else if (type === 'Token') {
    error.asToken = { type: value || 'FundsUnavailable' };
  } else if (type === 'Arithmetic') {
    error.asArithmetic = { type: value || 'Overflow' };
  } else if (type === 'Transactional') {
    error.asTransactional = { type: value || 'LimitReached' };
  }

  return error;
}

describe('dispatch-error', () => {
  describe('TxDispatchError', () => {
    it('should be instance of Error', () => {
      const error = new TxDispatchError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TxDispatchError);
    });

    it('should have correct message', () => {
      const error = new TxDispatchError('Custom dispatch error');

      expect(error.message).toBe('Custom dispatch error');
    });
  });

  describe('TxModuleError', () => {
    it('should be instance of TxDispatchError', () => {
      const error = new TxModuleError('Test', 'balances', 'InsufficientBalance', ['Not enough funds']);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TxDispatchError);
      expect(error).toBeInstanceOf(TxModuleError);
    });

    it('should store section, method, and docs', () => {
      const error = new TxModuleError('Test', 'staking', 'NotController', ['Account is not controller']);

      expect(error.section).toBe('staking');
      expect(error.method).toBe('NotController');
      expect(error.docs).toEqual(['Account is not controller']);
    });

    it('should generate correct shortMessage', () => {
      const error = new TxModuleError('Test', 'balances', 'InsufficientBalance', [
        'Balance too low.',
        'Second line of docs.'
      ]);

      expect(error.shortMessage).toBe('balances.InsufficientBalance: Balance too low.\nSecond line of docs.');
    });

    it('should handle empty docs array', () => {
      const error = new TxModuleError('Test', 'system', 'CallFiltered', []);

      expect(error.shortMessage).toBe('system.CallFiltered: ');
    });
  });

  describe('assetDispatchError', () => {
    it('should parse Module error', () => {
      const api = createMockApi({
        section: 'balances',
        method: 'InsufficientBalance',
        docs: ['Balance too low to send value.']
      });
      const dispatchError = createMockDispatchError('Module');

      const error = assetDispatchError(api, dispatchError);

      expect(error).toBeInstanceOf(TxModuleError);
      expect((error as TxModuleError).section).toBe('balances');
      expect((error as TxModuleError).method).toBe('InsufficientBalance');
      expect(error.message).toContain('balances.InsufficientBalance');
    });

    it('should parse Token error', () => {
      const api = createMockApi();
      const dispatchError = createMockDispatchError('Token', 'FundsUnavailable');

      const error = assetDispatchError(api, dispatchError);

      expect(error).toBeInstanceOf(TxDispatchError);
      expect(error.message).toBe('Token Error: FundsUnavailable');
    });

    it('should parse Arithmetic error', () => {
      const api = createMockApi();
      const dispatchError = createMockDispatchError('Arithmetic', 'Overflow');

      const error = assetDispatchError(api, dispatchError);

      expect(error).toBeInstanceOf(TxDispatchError);
      expect(error.message).toBe('Arithmetic Error: Overflow');
    });

    it('should parse Transactional error', () => {
      const api = createMockApi();
      const dispatchError = createMockDispatchError('Transactional', 'LimitReached');

      const error = assetDispatchError(api, dispatchError);

      expect(error).toBeInstanceOf(TxDispatchError);
      expect(error.message).toBe('Transactional Error: LimitReached');
    });

    it('should parse unknown error type', () => {
      const api = createMockApi();
      const dispatchError = createMockDispatchError('Other');

      const error = assetDispatchError(api, dispatchError);

      expect(error).toBeInstanceOf(TxDispatchError);
      expect(error.message).toBe('Dispatch Error: Other');
    });

    it('should handle different Token error types', () => {
      const api = createMockApi();

      const errors = ['FundsUnavailable', 'OnlyProvider', 'BelowMinimum', 'CannotCreate', 'UnknownAsset', 'Frozen'];

      for (const tokenType of errors) {
        const dispatchError = createMockDispatchError('Token', tokenType);
        const error = assetDispatchError(api, dispatchError);

        expect(error.message).toBe(`Token Error: ${tokenType}`);
      }
    });

    it('should handle different Arithmetic error types', () => {
      const api = createMockApi();

      const errors = ['Overflow', 'Underflow', 'DivisionByZero'];

      for (const arithmeticType of errors) {
        const dispatchError = createMockDispatchError('Arithmetic', arithmeticType);
        const error = assetDispatchError(api, dispatchError);

        expect(error.message).toBe(`Arithmetic Error: ${arithmeticType}`);
      }
    });
  });

  describe('assetXcmV5TraitsError', () => {
    it('should parse XcmV5TraitsError', () => {
      const xcmError = { type: 'Barrier' } as any;

      const error = assetXcmV5TraitsError(xcmError);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('XcmV5TraitsError: Barrier');
    });

    it('should handle different XCM error types', () => {
      const errorTypes = [
        'Overflow',
        'Unimplemented',
        'UntrustedReserveLocation',
        'UntrustedTeleportLocation',
        'LocationFull',
        'LocationNotInvertible',
        'BadOrigin',
        'InvalidLocation',
        'AssetNotFound',
        'FailedToTransactAsset',
        'NotWithdrawable',
        'LocationCannotHold',
        'ExceedsMaxMessageSize',
        'DestinationUnsupported',
        'Transport',
        'Unroutable',
        'UnknownClaim',
        'FailedToDecode',
        'MaxWeightInvalid',
        'NotHoldingFees',
        'TooExpensive',
        'Trap',
        'ExpectationFalse',
        'PalletNotFound',
        'NameMismatch',
        'VersionIncompatible',
        'HoldingWouldOverflow',
        'ExportError',
        'ReanchorFailed',
        'NoDeal',
        'FeesNotMet',
        'LockError',
        'NoPermission',
        'Unanchored',
        'NotDepositable',
        'UnhandledXcmVersion',
        'WeightLimitReached',
        'Barrier',
        'WeightNotComputable',
        'ExceedsStackLimit'
      ];

      for (const errorType of errorTypes) {
        const xcmError = { type: errorType } as any;
        const error = assetXcmV5TraitsError(xcmError);

        expect(error.message).toBe(`XcmV5TraitsError: ${errorType}`);
      }
    });
  });
});
