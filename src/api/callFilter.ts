// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { CallFunction, IMethod } from '@polkadot/types/types';

export function matchProxyType(proxyType: string, callFunction: CallFunction): boolean {
  const match = {
    Any: () => true,
    NonTransfer: () =>
      !['balances', 'assets', 'nftFractionalization', 'nfts', 'uniques'].includes(callFunction.section),
    Staking: () =>
      ['staking', 'utility', 'session', 'fastUnstake', 'voterList', 'nominationPools'].includes(callFunction.section),
    NominationPools: () => ['nominationPools', 'utility'].includes(callFunction.section),
    SudoBalances: () => ['sudo', 'utility'].includes(callFunction.section),
    Governance: () => ['convictionVoting', 'referenda', 'whitelist'].includes(callFunction.section),
    Auction: () => ['auctions', 'crowdloan', 'registrar', 'slots'].includes(callFunction.section),
    IdentityJudgement: () =>
      (callFunction.section === 'identity' && callFunction.method === 'provideJudgement') ||
      ['utility'].includes(callFunction.section),
    CancelProxy: () =>
      (callFunction.section === 'proxy' && callFunction.method === 'rejectAnnouncement') ||
      callFunction.section === 'utility' ||
      callFunction.section === 'multisig',
    Assets: () =>
      callFunction.section === 'balances' ||
      callFunction.section === 'utility' ||
      callFunction.section === 'multisig' ||
      callFunction.section === 'nftFractionalization' ||
      callFunction.section === 'nfts' ||
      callFunction.section === 'uniques',
    AssetOwner: () =>
      (callFunction.section === 'assets' &&
        [
          'create',
          'startDestroy',
          'destroyAccounts',
          'destroyApprovals',
          'finishDestroy',
          'transferOwnership',
          'setTeam',
          'setMetadata',
          'clearMetadata',
          'setMinBalance'
        ].includes(callFunction.method)) ||
      (callFunction.section === 'nfts' &&
        [
          'create',
          'destroy',
          'redeposit',
          'transferOwnership',
          'setTeam',
          'setCollectionMaxSupply',
          'lockCollection'
        ].includes(callFunction.method)) ||
      (callFunction.section === 'uniques' &&
        [
          'create',
          'destroy',
          'transferOwnership',
          'setTeam',
          'setMetadata',
          'setAttribute',
          'setCollectionMetadata',
          'clearMetadata',
          'clearAttribute',
          'clearCollection_metadata',
          'setCollectionMaxSupply'
        ].includes(callFunction.method)) ||
      callFunction.section === 'utility' ||
      callFunction.section === 'multisig',
    AssetManager: () =>
      (callFunction.section === 'assets' &&
        ['mint', 'burn', 'freeze', 'block', 'thaw', 'freezeAsset', 'thawAsset', 'touchOther', 'refundOther'].includes(
          callFunction.method
        )) ||
      (callFunction.section === 'nfts' &&
        [
          'forceMint',
          'updateMintSettings',
          'mintPreSigned',
          'setAttributesPreSigned',
          'lockItemTransfer',
          'unlockItemTransfer',
          'lockItemProperties',
          'setMetadata',
          'clearMetadata',
          'setCollectionMetadata',
          'clearCollectionMetadata'
        ].includes(callFunction.method)) ||
      (callFunction.section === 'uniques' &&
        ['mint', 'burn', 'freeze', 'thaw', 'freezeCollection', 'thawCollection'].includes(callFunction.method)) ||
      callFunction.section === 'utility' ||
      callFunction.section === 'multisig',
    Collator: () => ['collatorSelection', 'utility', 'multisig'].includes(callFunction.section),
    Alliance: () => ['allianceMotion', 'alliance', 'utility', 'multisig'].includes(callFunction.section),
    Fellowship: () =>
      [
        'fellowshipCollective',
        'fellowshipReferenda',
        'fellowshipCore',
        'fellowshipSalary',
        'fellowshipTreasury',
        'utility',
        'multisig'
      ].includes(callFunction.section),
    Ambassador: () =>
      [
        'ambassadorCollective',
        'ambassadorReferenda',
        'ambassadorContent',
        'ambassadorCore',
        'ambassadorSalary',
        'utility',
        'multisig'
      ].includes(callFunction.section)
  }[proxyType];

  if (match) {
    return match();
  }

  return true;
}

export function isSuperset(x: string, y: string) {
  if (x === y) {
    return true;
  }

  if (x === 'Any') {
    return true;
  }

  if (y === 'Any') {
    return false;
  }

  if (x === 'Assets' && y === 'AssetOwner') {
    return true;
  }

  if (x === 'Assets' && y === 'AssetManager') {
    return true;
  }

  if (x === 'NonTransfer' && y === 'Collator') {
    return true;
  }

  return false;
}

export function callFilter(api: ApiPromise, proxyType: string, address: string, method: IMethod) {
  const callFunction = api.registry.findMetaCall(method.callIndex);

  if (!matchProxyType(proxyType, callFunction)) {
    throw new Error(`No permissions to dispatch ${callFunction.section}.${callFunction.method}`);
  }

  if (api.tx.proxy?.addProxy.is(method) || api.tx.proxy?.removeProxy.is(method)) {
    const subType: string = method.args[1].type;

    if (!isSuperset(proxyType, subType)) {
      throw new Error('Proxy call cannot add or remove a proxy with more permissions than it already has.');
    }
  }

  if (api.tx.proxy?.killPure.is(method) || api.tx.proxy?.removeProxies.is(method)) {
    if (proxyType !== 'Any') {
      throw new Error('Proxy call cannot remove all proxies or kill pure proxies unless it has full permissions.');
    }
  }

  if (api.tx.proxy?.proxy.is(method)) {
    callFilter(api, method.args[1].unwrapOrDefault().type, method.args[0].toString(), method.args[2]);
  } else if (
    api.tx.utility?.batch.is(method) ||
    api.tx.utility?.batchAll.is(method) ||
    api.tx.utility?.forceBatch.is(method)
  ) {
    for (const call of method.args[0]) {
      callFilter(api, proxyType, address, call);
    }
  }
}
