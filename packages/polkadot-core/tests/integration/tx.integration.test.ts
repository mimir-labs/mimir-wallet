// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { assetHubApi, paseoApi, skipIfNotConnected } from './setup.js';
import { TEST_ADDRESSES, TIMEOUTS } from './test-config.js';

describe('Transaction Integration Tests', () => {
  describe('Transaction Construction', () => {
    it(
      'should construct system.remark transaction',
      async () => {
        skipIfNotConnected(paseoApi, 'system.remark construction');

        const tx = paseoApi.tx.system.remark('test remark');

        expect(tx).toBeDefined();
        expect(tx.method).toBeDefined();
        expect(tx.method.section).toBe('system');
        expect(tx.method.method).toBe('remark');
      },
      TIMEOUTS.query,
    );

    it(
      'should construct balances.transferKeepAlive transaction',
      async () => {
        skipIfNotConnected(paseoApi, 'balances.transferKeepAlive construction');

        const amount = BigInt(1_000_000_0000); // 1 PAS
        const tx = paseoApi.tx.balances.transferKeepAlive(
          TEST_ADDRESSES.bob,
          amount,
        );

        expect(tx).toBeDefined();
        expect(tx.method.section).toBe('balances');
        expect(tx.method.method).toBe('transferKeepAlive');
      },
      TIMEOUTS.query,
    );

    it(
      'should construct utility.batch transaction',
      async () => {
        skipIfNotConnected(paseoApi, 'utility.batch construction');

        const remark1 = paseoApi.tx.system.remark('remark 1');
        const remark2 = paseoApi.tx.system.remark('remark 2');
        const tx = paseoApi.tx.utility.batch([remark1, remark2]);

        expect(tx).toBeDefined();
        expect(tx.method.section).toBe('utility');
        expect(tx.method.method).toBe('batch');
      },
      TIMEOUTS.query,
    );

    it(
      'should construct utility.batchAll transaction',
      async () => {
        skipIfNotConnected(paseoApi, 'utility.batchAll construction');

        const remark1 = paseoApi.tx.system.remark('remark 1');
        const remark2 = paseoApi.tx.system.remark('remark 2');
        const tx = paseoApi.tx.utility.batchAll([remark1, remark2]);

        expect(tx).toBeDefined();
        expect(tx.method.section).toBe('utility');
        expect(tx.method.method).toBe('batchAll');
      },
      TIMEOUTS.query,
    );
  });

  describe('Transaction Serialization', () => {
    it(
      'should serialize transaction to hex',
      async () => {
        skipIfNotConnected(paseoApi, 'transaction hex serialization');

        const tx = paseoApi.tx.system.remark('test');
        const hex = tx.toHex();

        expect(hex).toMatch(/^0x[a-f0-9]+$/i);
      },
      TIMEOUTS.query,
    );

    it(
      'should serialize call data to hex',
      async () => {
        skipIfNotConnected(paseoApi, 'call data hex');

        const tx = paseoApi.tx.system.remark('test');
        const callHex = tx.method.toHex();

        expect(callHex).toMatch(/^0x[a-f0-9]+$/i);
      },
      TIMEOUTS.query,
    );

    it(
      'should deserialize call data from hex',
      async () => {
        skipIfNotConnected(paseoApi, 'call data deserialization');

        const originalTx = paseoApi.tx.system.remark('deserialization test');
        const callHex = originalTx.method.toHex();

        const deserializedCall = paseoApi.createType('Call', callHex);

        expect(deserializedCall.section).toBe('system');
        expect(deserializedCall.method).toBe('remark');
      },
      TIMEOUTS.query,
    );
  });

  describe('Transaction Payment Info', () => {
    it(
      'should get payment info for system.remark',
      async () => {
        skipIfNotConnected(paseoApi, 'payment info remark');

        const tx = paseoApi.tx.system.remark('payment info test');
        const paymentInfo = await tx.paymentInfo(TEST_ADDRESSES.alice);

        expect(paymentInfo).toBeDefined();
        expect(paymentInfo.partialFee).toBeDefined();
        expect(paymentInfo.weight).toBeDefined();
      },
      TIMEOUTS.query,
    );

    it(
      'should get payment info for balances.transferKeepAlive',
      async () => {
        skipIfNotConnected(paseoApi, 'payment info transfer');

        const amount = BigInt(1_000_000_0000);
        const tx = paseoApi.tx.balances.transferKeepAlive(
          TEST_ADDRESSES.bob,
          amount,
        );
        const paymentInfo = await tx.paymentInfo(TEST_ADDRESSES.alice);

        expect(paymentInfo).toBeDefined();
        expect(paymentInfo.partialFee).toBeDefined();

        // Fee should be a positive value
        const fee = BigInt(paymentInfo.partialFee.toString());

        expect(fee).toBeGreaterThan(0n);
      },
      TIMEOUTS.query,
    );

    it(
      'should get payment info for batch transaction',
      async () => {
        skipIfNotConnected(paseoApi, 'payment info batch');

        const remark1 = paseoApi.tx.system.remark('remark 1');
        const remark2 = paseoApi.tx.system.remark('remark 2');
        const tx = paseoApi.tx.utility.batch([remark1, remark2]);

        const paymentInfo = await tx.paymentInfo(TEST_ADDRESSES.alice);

        expect(paymentInfo).toBeDefined();
        expect(paymentInfo.partialFee).toBeDefined();
      },
      TIMEOUTS.query,
    );
  });

  describe('Proxy Module Availability', () => {
    it(
      'should have proxy module available on Paseo',
      async () => {
        skipIfNotConnected(paseoApi, 'proxy module Paseo');

        const hasProxyModule = !!paseoApi.tx.proxy;

        expect(hasProxyModule).toBe(true);
      },
      TIMEOUTS.query,
    );

    it(
      'should have proxy.proxy extrinsic available',
      async () => {
        skipIfNotConnected(paseoApi, 'proxy.proxy extrinsic');

        const hasProxyExtrinsic = !!paseoApi.tx.proxy?.proxy;

        expect(hasProxyExtrinsic).toBe(true);
      },
      TIMEOUTS.query,
    );

    it(
      'should have proxy module available on Asset Hub',
      async () => {
        skipIfNotConnected(assetHubApi, 'proxy module Asset Hub');

        const hasProxyModule = !!assetHubApi.tx.proxy;

        expect(hasProxyModule).toBe(true);
      },
      TIMEOUTS.query,
    );
  });

  describe('Multisig Module Availability', () => {
    it(
      'should have multisig module available on Paseo',
      async () => {
        skipIfNotConnected(paseoApi, 'multisig module Paseo');

        const hasMultisigModule = !!paseoApi.tx.multisig;

        expect(hasMultisigModule).toBe(true);
      },
      TIMEOUTS.query,
    );

    it(
      'should have multisig.asMulti extrinsic available',
      async () => {
        skipIfNotConnected(paseoApi, 'multisig.asMulti extrinsic');

        const hasAsMulti = !!paseoApi.tx.multisig?.asMulti;

        expect(hasAsMulti).toBe(true);
      },
      TIMEOUTS.query,
    );
  });

  describe('Query Proxy Information', () => {
    it(
      'should query proxies for an account',
      async () => {
        skipIfNotConnected(paseoApi, 'query proxies');

        const proxies = await paseoApi.query.proxy.proxies(
          TEST_ADDRESSES.alice,
        );

        expect(proxies).toBeDefined();
        // proxies returns a tuple [Vec<ProxyDefinition>, Balance]
        expect(Array.isArray(proxies)).toBe(true);
      },
      TIMEOUTS.query,
    );
  });

  describe('Transaction Weight', () => {
    it(
      'should calculate transaction weight',
      async () => {
        skipIfNotConnected(paseoApi, 'transaction weight');

        const tx = paseoApi.tx.system.remark('weight test');
        const paymentInfo = await tx.paymentInfo(TEST_ADDRESSES.alice);

        expect(paymentInfo.weight).toBeDefined();
        expect(paymentInfo.weight.refTime).toBeDefined();
        expect(paymentInfo.weight.proofSize).toBeDefined();
      },
      TIMEOUTS.query,
    );
  });

  describe('Runtime Constants', () => {
    it(
      'should access transaction payment constants',
      async () => {
        skipIfNotConnected(paseoApi, 'tx payment constants');

        // Check if transactionPayment constants exist
        const hasTransactionPayment = !!paseoApi.consts.transactionPayment;

        expect(hasTransactionPayment).toBe(true);
      },
      TIMEOUTS.query,
    );

    it(
      'should access system constants',
      async () => {
        skipIfNotConnected(paseoApi, 'system constants');

        const blockWeights = paseoApi.consts.system.blockWeights;

        expect(blockWeights).toBeDefined();
      },
      TIMEOUTS.query,
    );
  });
});
