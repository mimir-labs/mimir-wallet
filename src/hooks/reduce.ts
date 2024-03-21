// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration, ApiTypes } from '@polkadot/api/types';
import type { GenericCall, Null, Option, Result, U8aFixed } from '@polkadot/types';
import type { AccountId32, Event, Multisig } from '@polkadot/types/interfaces';
import type { PalletMultisigTimepoint, SpRuntimeDispatchError } from '@polkadot/types/lookup';
import type { IEvent } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { addressToHex } from '@mimir-wallet/utils';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { createKeyMulti } from '@polkadot/util-crypto';

import { CalldataStatus } from './types';

type ProxyExecutedEvent = Event &
  IEvent<
    [result: Result<Null, SpRuntimeDispatchError>],
    {
      result: Result<Null, SpRuntimeDispatchError>;
    }
  >;
type MultiExecutedEvent = Event &
  IEvent<
    [AccountId32, PalletMultisigTimepoint, AccountId32, U8aFixed, result: Result<Null, SpRuntimeDispatchError>],
    {
      approving: AccountId32;
      timepoint: PalletMultisigTimepoint;
      multisig: AccountId32;
      callHash: U8aFixed;
      result: Result<Null, SpRuntimeDispatchError>;
    }
  >;
type MultisigApprovalEvent = Event &
  IEvent<
    [approving: AccountId32, timepoint: PalletMultisigTimepoint, multisig: AccountId32, callHash: U8aFixed],
    {
      approving: AccountId32;
      timepoint: PalletMultisigTimepoint;
      multisig: AccountId32;
      callHash: U8aFixed;
    }
  >;
type MultisigNewEvent = Event &
  IEvent<
    [approving: AccountId32, multisig: AccountId32, callHash: U8aFixed],
    {
      approving: AccountId32;
      multisig: AccountId32;
      callHash: U8aFixed;
    }
  >;
type ReduceArgs = [call: GenericCall, sender: HexString, isStart: boolean, isEnd: boolean, status: CalldataStatus, blockHeight: number | null, extrinsicIndex: number | null, index: number];

// @internal
async function _asMultiStatus(
  api: ApiPromise,
  apiAt: ApiDecoration<ApiTypes>,
  events: Event[],
  extrinsicIndex: number | null,
  blockHeight: number,
  sender: HexString,
  callHash: HexString
): Promise<[status: CalldataStatus, blockHeight: number | null, extrinsicIndex: number | null]> {
  const eventExcuted = events.find((event): event is MultiExecutedEvent => api.events.multisig.MultisigExecuted.is(event) && u8aEq(event.data.callHash, callHash));
  const eventApproval = events.find((event): event is MultisigApprovalEvent => api.events.multisig.MultisigApproval.is(event) && u8aEq(event.data.callHash, callHash));
  const eventNew = events.find((event): event is MultisigNewEvent => api.events.multisig.NewMultisig.is(event) && u8aEq(event.data.callHash, callHash));

  let status: CalldataStatus = CalldataStatus.Initialized;

  if (eventExcuted) {
    status = eventExcuted.data.result.isOk ? CalldataStatus.Success : CalldataStatus.Failed;
    blockHeight = eventExcuted.data.timepoint.height.toNumber();
    extrinsicIndex = eventExcuted.data.timepoint.index.toNumber();
  } else if (eventApproval) {
    status = CalldataStatus.Pending;
    blockHeight = eventApproval.data.timepoint.height.toNumber();
    extrinsicIndex = eventApproval.data.timepoint.index.toNumber();
  } else if (eventNew) {
    status = CalldataStatus.Pending;
  }

  if (status === CalldataStatus.Initialized) {
    const info = (await apiAt.query.multisig.multisigs(sender, callHash)) as Option<Multisig>;

    if (info.isSome) {
      status = CalldataStatus.Pending;
      blockHeight = info.unwrap().when.height.toNumber();
      extrinsicIndex = info.unwrap().when.index.toNumber();
    }
  }

  return [status, blockHeight, extrinsicIndex];
}

// @internal
function _proxyStatus(events: ProxyExecutedEvent[], extrinsicIndex: number | null, blockHeight: number): [status: CalldataStatus, blockHeight: number | null, extrinsicIndex: number | null] {
  const event = events.pop(); // get the last ProxyExecutedEvent

  let status: CalldataStatus = CalldataStatus.Initialized;

  if (event) {
    status = event.data.result.isOk ? CalldataStatus.Success : CalldataStatus.Failed;
  }

  return [status, blockHeight, extrinsicIndex];
}

/**
 * @name reduceCalldata
 * @description Decode the incoming hex `data` and reduce the results
 * @param extrinsic the generic extrinsic from finalized block
 * @param events all events of `extrinsic`
 */
export async function reduceCalldata(
  api: ApiPromise,
  apiAt: ApiDecoration<ApiTypes>,
  callIn: GenericCall,
  extrinsicIndex: number,
  signerIn: HexString,
  events: Event[],
  blockHeight: number,
  getCalldata: (hash: HexString) => HexString | null,
  fn: (...args: ReduceArgs) => void
): Promise<ReduceArgs[]> {
  let index = 0;
  let sender: HexString | undefined = signerIn;
  let call: GenericCall | undefined = callIn;

  const extrinsicSuccess = events.findIndex((event) => api.events.system.ExtrinsicSuccess.is(event)) > -1;

  // save the callHash => status
  const callStatus: Map<HexString, [status: CalldataStatus, blockHeight: number | null, extrinsicIndex: number | null]> = new Map();

  const proxyExecutedEvents = events.filter((event): event is ProxyExecutedEvent => api.events.proxy.ProxyExecuted.is(event));

  const results: ReduceArgs[] = [];

  while (sender && call) {
    const isStart = index === 0;
    let isEnd = false;

    let _sender: HexString | undefined;
    let _call: GenericCall | undefined;

    if (api.tx.multisig.asMulti.is(call)) {
      _sender = u8aToHex(createKeyMulti([sender, ...call.args[1]], call.args[0]));
      _call = call.args[3];

      const callHash = call.args[3].hash.toHex();

      callStatus.set(callHash, await _asMultiStatus(api, apiAt, events, extrinsicIndex, blockHeight, _sender, callHash));
    } else if (api.tx.multisig.approveAsMulti.is(call)) {
      _sender = u8aToHex(createKeyMulti([sender, ...call.args[1]], call.args[0]));

      const callHash = call.args[3].toHex();
      const knownCalldata = getCalldata(callHash);

      if (knownCalldata) {
        _call = api.createType('Call', knownCalldata);
      } else {
        _call = undefined;
      }

      callStatus.set(callHash, await _asMultiStatus(api, apiAt, events, extrinsicIndex, blockHeight, _sender, callHash));
    } else if (api.tx.proxy.proxy.is(call)) {
      _sender = addressToHex(call.args[0].toString());
      _call = call.args[2];

      const callHash = call.args[2].hash.toHex();

      callStatus.set(callHash, _proxyStatus(proxyExecutedEvents, extrinsicIndex, blockHeight));
    } else {
      isEnd = true;
      _sender = undefined;
      _call = undefined;
    }

    const args: ReduceArgs = [
      call,
      sender,
      isStart,
      isEnd,
      index === 0 ? (extrinsicSuccess ? CalldataStatus.Success : CalldataStatus.Failed) : callStatus.get(call.hash.toHex())?.[0] ?? CalldataStatus.Pending,
      index === 0 ? blockHeight : callStatus.get(call.hash.toHex())?.[1] ?? null,
      index === 0 ? extrinsicIndex : callStatus.get(call.hash.toHex())?.[2] ?? null,
      index
    ];

    fn(...args);
    results.push(args);

    sender = _sender;
    call = _call;
    index++;
  }

  return results;
}
