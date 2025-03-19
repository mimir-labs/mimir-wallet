// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types';
import type { Injected } from '@polkadot/extension-inject/types';
import type { Null, Result } from '@polkadot/types';
import type {
  DispatchError,
  Extrinsic,
  ExtrinsicEra,
  Hash,
  Header,
  Index,
  SignerPayload
} from '@polkadot/types/interfaces';
import type {
  SpRuntimeDispatchError,
  SpRuntimeTransactionValidityTransactionValidityError
} from '@polkadot/types/lookup';
import type { ISubmittableResult, SignatureOptions, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

// import { walletConfig } from '@/config';
// import { CONNECT_ORIGIN } from '@/constants';
import { getSpecTypes } from '@polkadot/types-known';
import { assert, formatBalance, isBn, isFunction, isHex, isNumber, objectSpread, u8aToHex } from '@polkadot/util';
import { base64Encode } from '@polkadot/util-crypto';

import { TxEvents } from './tx-events.js';

type Options = {
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
  checkProxy?: boolean;
};

export class TxDispatchError extends Error {}
export class TxModuleError extends Error {
  public section: string;

  public method: string;

  public docs: string[];

  constructor(message: string, section: string, method: string, docs: string[]) {
    super(message);
    this.section = section;
    this.method = method;
    this.docs = docs;
  }

  public get shortMessage(): string {
    return `${this.section}.${this.method}: ${this.docs.join('\n')}`;
  }
}

function _assetDispatchError(api: ApiPromise, dispatch: DispatchError | SpRuntimeDispatchError): Error {
  if (dispatch.isModule) {
    const error = api.registry.findMetaError(dispatch.asModule);

    return new TxModuleError(
      `Cause by ${error.section}.${error.method}: ${error.docs.join('\n')}`,
      error.section,
      error.method,
      error.docs
    );
  }

  if (dispatch.isToken) {
    return new TxDispatchError(`Token Error: ${dispatch.asToken.type}`);
  }

  if (dispatch.isArithmetic) {
    return new TxDispatchError(`Arithmetic Error: ${dispatch.asArithmetic.type}`);
  }

  if (dispatch.isTransactional) {
    return new TxDispatchError(`Transactional Error: ${dispatch.asTransactional.type}`);
  }

  return new TxDispatchError(`Dispatch Error: ${dispatch.type}`);
}

async function extractParams(
  api: ApiPromise,
  address: string,
  _injected: Injected | (() => Promise<Injected>)
): Promise<Partial<SignerOptions>> {
  const injected = isFunction(_injected) ? await _injected() : _injected;

  const signer = injected?.signer;
  const metadata = injected?.metadata;

  if (metadata) {
    const knowns = await metadata.get();

    if (
      !knowns.find(
        (item) =>
          item.genesisHash === api.genesisHash.toHex() && item.specVersion === api.runtimeVersion.specVersion.toNumber()
      )
    ) {
      const [systemChain] = await Promise.all([api.rpc.system.chain()]);
      const chainInfo = {
        chain: systemChain.toString(),
        chainType: 'substrate' as const,
        genesisHash: api.genesisHash.toHex(),
        icon: 'substrate',
        metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
        specVersion: api.runtimeVersion.specVersion.toNumber(),
        ss58Format: api.registry.chainSS58!,
        tokenDecimals: api.registry.chainDecimals[0],
        tokenSymbol: (api.registry.chainTokens || formatBalance.getDefaults().unit)[0],
        types: getSpecTypes(
          api.registry,
          systemChain,
          api.runtimeVersion.specName,
          api.runtimeVersion.specVersion
        ) as unknown as Record<string, string>
      };

      await metadata.provide(chainInfo);
    }

    assert(signer, `Unable to find a signer for ${address}`);

    return { signer, withSignedTransaction: true };
  }

  assert(signer, `Unable to find a signer for ${address}`);

  return { signer };
}

export function checkSubmittableResult(api: ApiPromise, result: ISubmittableResult, checkProxy = false) {
  if (result.isError) {
    if (result.dispatchError) {
      throw _assetDispatchError(api, result.dispatchError);
    }

    if (result.internalError) {
      throw result.internalError;
    }
  }

  if (checkProxy) {
    for (const { event } of result.events) {
      if (!api.events.proxy.ProxyExecuted.is(event)) continue;

      if (event.data.result.isErr) {
        throw _assetDispatchError(api, event.data.result.asErr);
      }
    }
  }

  return result;
}

function makeSignOptions(
  api: ApiPromise,
  partialOptions: Partial<SignerOptions>,
  extras: { blockHash?: Hash; era?: ExtrinsicEra; nonce?: Index }
): SignatureOptions {
  return objectSpread({ blockHash: api.genesisHash, genesisHash: api.genesisHash }, partialOptions, extras, {
    runtimeVersion: api.runtimeVersion,
    signedExtensions: api.registry.signedExtensions
  });
}

function makeEraOptions(
  api: ApiPromise,
  partialOptions: Partial<SignerOptions>,
  { header, mortalLength, nonce }: { header: Header | null; mortalLength: number; nonce: Index }
): SignatureOptions {
  if (!header) {
    if (partialOptions.era && !partialOptions.blockHash) {
      throw new Error('Expected blockHash to be passed alongside non-immortal era options');
    }

    if (isNumber(partialOptions.era)) {
      // since we have no header, it is immortal, remove any option overrides
      // so we only supply the genesisHash and no era to the construction
      delete partialOptions.era;
      delete partialOptions.blockHash;
    }

    return makeSignOptions(api, partialOptions, { nonce });
  }

  return makeSignOptions(api, partialOptions, {
    blockHash: header.hash,
    era: api.registry.createTypeUnsafe<ExtrinsicEra>('ExtrinsicEra', [
      {
        current: header.number,
        period: partialOptions.era || mortalLength
      }
    ]),
    nonce
  });
}

function optionsOrNonce(partialOptions: Partial<SignerOptions> = {}): Partial<SignerOptions> {
  return isBn(partialOptions) || isNumber(partialOptions) ? { nonce: partialOptions } : partialOptions;
}

export async function sign(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic<'promise'>,
  signer: string,
  injected: Injected | (() => Promise<Injected>)
): Promise<[signature: HexString, payload: SignerPayloadJSON, txHash: Hash, signedTransaction: HexString]> {
  const options = optionsOrNonce();
  const signingInfo = await api.derive.tx.signingInfo(signer, options.nonce, options.era);
  const eraOptions = makeEraOptions(api, options, signingInfo);

  const { signer: accountSigner, withSignedTransaction } = await extractParams(api, signer, injected);

  const payload = api.registry.createTypeUnsafe<SignerPayload>('SignerPayload', [
    objectSpread({}, eraOptions, {
      address: signer,
      blockNumber: signingInfo.header ? signingInfo.header.number : 0,
      method: extrinsic.method,
      version: extrinsic.version,
      withSignedTransaction
    })
  ]);

  if (!accountSigner?.signPayload) {
    throw new Error('No signer');
  }

  const { signature, signedTransaction } = await accountSigner.signPayload(payload.toPayload());

  if (signedTransaction) {
    const ext = api.registry.createTypeUnsafe<Extrinsic>('Extrinsic', [signedTransaction]);

    const newSignerPayload = api.registry.createTypeUnsafe<SignerPayload>('SignerPayload', [
      objectSpread(
        {},
        {
          address: signer,
          assetId: ext.assetId?.isSome ? ext.assetId.toHex() : null,
          blockHash: payload.blockHash,
          blockNumber: signingInfo.header ? signingInfo.header.number : 0,
          era: ext.era.toHex(),
          genesisHash: payload.genesisHash,
          metadataHash: ext.metadataHash ? ext.metadataHash.toHex() : null,
          method: ext.method.toHex(),
          mode: ext.mode ? ext.mode.toHex() : null,
          nonce: ext.nonce.toHex(),
          runtimeVersion: payload.runtimeVersion,
          signedExtensions: payload.signedExtensions,
          tip: ext.tip ? ext.tip.toHex() : null,
          version: payload.version
        }
      )
    ]);

    if (!ext.isSigned) {
      throw new Error(
        `When using the signedTransaction field, the transaction must be signed. Recieved isSigned: ${ext.isSigned}`
      );
    }

    const errMsg = (field: string) => `signAndSend: ${field} does not match the original payload`;

    if (payload.method.toHex() !== ext.method.toHex()) {
      throw new Error(errMsg('call data'));
    }

    extrinsic.addSignature(signer, signature, newSignerPayload.toPayload());

    return [
      signature,
      newSignerPayload.toPayload(),
      extrinsic.hash,
      isHex(signedTransaction) ? signedTransaction : u8aToHex(signedTransaction)
    ];
  }

  extrinsic.addSignature(signer, signature, payload.toPayload());

  return [signature, payload.toPayload(), extrinsic.hash, extrinsic.toHex()];
}

export function signAndSend(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic<'promise'>,
  signer: string,
  injected: Injected | (() => Promise<Injected>),
  { beforeSend, checkProxy }: Options = {}
): TxEvents {
  const events = new TxEvents();

  extractParams(api, signer, injected)
    .then((params) => extrinsic.signAsync(signer, params))
    .then(async (extrinsic) => {
      events.emit('signed', extrinsic.signature, extrinsic);

      let result: Result<
        Result<Null, SpRuntimeDispatchError>,
        SpRuntimeTransactionValidityTransactionValidityError
      > | null = null;

      try {
        result = await api.call.blockBuilder.applyExtrinsic(extrinsic);
      } catch {
        /* empty */
      }

      if (result) {
        if (result.isErr) {
          if (result.asErr.isInvalid) {
            throw new Error(`Invalid Transaction: ${result.asErr.asInvalid.type}`);
          }

          throw new Error(`Unknown Error: ${result.asErr.asUnknown.type}`);
        }

        if (result.asOk.isErr) {
          throw _assetDispatchError(api, result.asOk.asErr);
        }
      }

      return extrinsic;
    })
    .then(async (extrinsic) => {
      await beforeSend?.(extrinsic);

      const unsub = await extrinsic.send((result) => {
        if (result.isFinalized) {
          events.emit('finalized', result);
          unsub();
        }

        if (result.isCompleted) {
          events.emit('completed', result);
        }

        if (result.isInBlock) {
          try {
            checkSubmittableResult(api, result, checkProxy);
            events.emit('inblock', result);
          } catch (error) {
            events.emit('error', error);
            unsub();
          }
        }
      });
    })
    .catch((error) => {
      events.emit('error', error);
    });

  return events;
}
