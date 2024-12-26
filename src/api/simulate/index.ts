// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Block } from '@acala-network/chopsticks-core';
import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';

import { BuildBlockMode, decodeBlockStorageDiff, setup } from '@acala-network/chopsticks-core';
import DiffMatchPatch from 'diff-match-patch';
import { create } from 'jsondiffpatch';
import { cloneDeep, template } from 'lodash-es';

import { typesBundle } from '@mimir-wallet/config';

import { IdbDatabase } from './db';
import { simulateTemplate } from './template';

const diffPatcher = create({
  arrays: { detectMove: false },
  textDiff: { diffMatchPatch: DiffMatchPatch, minLength: Number.MAX_VALUE } // Skip text diff
});

export const decodeStorageDiff = async (block: Block, diff: [HexString, HexString | null][]) => {
  const [oldState, newState] = await decodeBlockStorageDiff(block, diff);
  const oldStateWithoutEvents: any = cloneDeep(oldState);

  if (oldStateWithoutEvents.system?.events) {
    oldStateWithoutEvents.system.events = [];
  }

  return { oldState, newState, delta: diffPatcher.diff(oldStateWithoutEvents, newState) };
};

export const generateHtmlDiff = async (block: Block, diff: [HexString, HexString | null][]) => {
  const { oldState, delta } = await decodeStorageDiff(block, diff);
  const htmlTemplate = simulateTemplate;

  return template(htmlTemplate)({ left: JSON.stringify(oldState), delta: JSON.stringify(delta) });
};

export async function simulate(
  api: ApiPromise,
  rpc: string | string[],
  call: IMethod,
  address: string
): Promise<{
  success: boolean;
  error: string | null;
  html: string;
  balanceChanges: { value: BN; change: 'send' | 'receive' }[];
}> {
  const storageKey = api.query.system.account.key(address);
  const db = new IdbDatabase(`chopsticks-cache:${api.genesisHash.toHex()}`);
  const blockHash = await api.rpc.chain.getBlockHash();

  const chain = await setup({
    endpoint: rpc,
    block: blockHash.toHex(),
    buildBlockMode: BuildBlockMode.Batch,
    mockSignatureHost: true,
    registeredTypes: {
      typesBundle
    },
    db
  });

  console.debug('simulate:', call.toHuman(), address);

  const { outcome, storageDiff } = await chain.dryRunExtrinsic(
    {
      call: call.toHex(),
      address
    },
    blockHash.toHex()
  );

  console.debug('simulate result:', outcome, outcome.toString());

  const html = await generateHtmlDiff(chain.head, storageDiff);

  const balanceChanges: { value: BN; change: 'send' | 'receive' }[] = [];

  try {
    for (const diff of storageDiff) {
      if (diff[0] === storageKey) {
        const accountInfo = api.createType('FrameSystemAccountInfo', diff[1]);
        const prevAccountInfo = await api.query.system.account(address);

        const prevTotalBalance = prevAccountInfo.data.free.add(prevAccountInfo.data.reserved);
        const totalBalance = accountInfo.data.free.add(accountInfo.data.reserved);

        if (totalBalance.gt(prevTotalBalance)) {
          balanceChanges.push({ change: 'receive', value: totalBalance.sub(prevTotalBalance) });
        } else if (totalBalance.lt(prevTotalBalance)) {
          balanceChanges.push({ change: 'send', value: prevTotalBalance.sub(totalBalance) });
        }
      }
    }
  } catch {
    /* Empty */
  }

  console.debug('simulate storage diff', storageDiff);

  let success: boolean = false;
  let error: string | null = null;

  if (outcome.isOk) {
    const ok = outcome.asOk;

    if (ok.isOk) {
      success = true;
    } else {
      const err = ok.asErr;

      if (err.isModule) {
        const { docs, name, section } = api.registry.findMetaError(err.asModule);

        error = `${section}.${name} Error:\n ${docs.join(', ')}`;
      } else if (err.isToken) {
        error = `TokenError: ${err.asToken.type}`;
      } else {
        error = `Error: ${err.type}`;
      }
    }
  } else {
    const err = outcome.asErr;

    error = `InvalidTransaction: ${err.type}`;
  }

  await db.deleteBlock(blockHash.toHex());
  await db.close();
  await chain.close();

  return { success, error, balanceChanges, html };
}
