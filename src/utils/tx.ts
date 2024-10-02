// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions, SubmittableExtrinsic } from '@polkadot/api/types';
import type { DispatchError, ExtrinsicEra, Hash, Header, Index, SignerPayload } from '@polkadot/types/interfaces';
import type { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import type { ISubmittableResult, SignatureOptions, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { getSpecTypes } from '@polkadot/types-known';
import keyring from '@polkadot/ui-keyring';
import { assert, formatBalance, isBn, isNumber, objectSpread } from '@polkadot/util';
import { addressEq, base64Encode } from '@polkadot/util-crypto';

import { AccountSigner, api, DEFAULT_DECIMALS, DEFAULT_SS58 } from '@mimir-wallet/api';
import { CONNECT_ORIGIN } from '@mimir-wallet/constants';

import { TxEvents } from './tx-events';

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

function _assetDispatchError(dispatch: DispatchError | SpRuntimeDispatchError): Error {
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

async function extractParams(api: ApiPromise, address: string): Promise<Partial<SignerOptions>> {
  const pair = keyring.getPair(address);
  const {
    meta: { isInjected, source }
  } = pair;

  if (isInjected) {
    const injected = await window.injectedWeb3?.[source || ''].enable(CONNECT_ORIGIN);
    const signer = injected?.signer;
    const metadata = injected?.metadata;

    if (metadata) {
      const knowns = await metadata.get();

      if (
        !knowns.find(
          (item) =>
            item.genesisHash === api.genesisHash.toHex() &&
            item.specVersion === api.runtimeVersion.specVersion.toNumber()
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
          ss58Format: isNumber(api.registry.chainSS58) ? api.registry.chainSS58 : DEFAULT_SS58.toNumber(),
          tokenDecimals: (api.registry.chainDecimals || [DEFAULT_DECIMALS.toNumber()])[0],
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
    }

    assert(signer, `Unable to find a signer for ${address}`);

    return { signer, withSignedTransaction: true };
  }

  assert(addressEq(address, pair.address), `Unable to retrieve keypair for ${address}`);

  return { signer: new AccountSigner(api.registry, pair) };
}

export function checkSubmittableResult(result: ISubmittableResult, checkProxy = false) {
  if (result.isError) {
    if (result.dispatchError) {
      throw _assetDispatchError(result.dispatchError);
    }

    if (result.internalError) {
      throw result.internalError;
    }
  }

  if (checkProxy) {
    for (const { event } of result.events) {
      if (!api.events.proxy.ProxyExecuted.is(event)) continue;

      if (event.data.result.isErr) {
        throw _assetDispatchError(event.data.result.asErr);
      }
    }
  }

  return result;
}

function makeSignOptions(
  partialOptions: Partial<SignerOptions>,
  extras: { blockHash?: Hash; era?: ExtrinsicEra; nonce?: Index }
): SignatureOptions {
  return objectSpread(
    { blockHash: api.genesisHash, genesisHash: api.genesisHash, withSignedTransaction: true },
    partialOptions,
    extras,
    {
      runtimeVersion: api.runtimeVersion,
      signedExtensions: api.registry.signedExtensions
    }
  );
}

function makeEraOptions(
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

    return makeSignOptions(partialOptions, { nonce });
  }

  return makeSignOptions(partialOptions, {
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
  extrinsic: SubmittableExtrinsic<'promise'>,
  signer: string
): Promise<[HexString, SignerPayloadJSON, Hash]> {
  const options = optionsOrNonce();
  const signingInfo = await api.derive.tx.signingInfo(signer, options.nonce, options.era);
  const eraOptions = makeEraOptions(options, signingInfo);

  const { signer: accountSigner } = await extractParams(api, signer);

  const payload = api.registry.createTypeUnsafe<SignerPayload>('SignerPayload', [
    objectSpread({}, eraOptions, {
      address: signer,
      blockNumber: signingInfo.header ? signingInfo.header.number : 0,
      method: extrinsic.method,
      version: extrinsic.version
    })
  ]);

  if (!accountSigner?.signPayload) {
    throw new Error('No signer');
  }

  const { signature } = await accountSigner.signPayload(payload.toPayload());

  extrinsic.addSignature(signer, signature, payload.toPayload());

  return [signature, payload.toPayload(), extrinsic.hash];
}

export function signAndSend(
  extrinsic: SubmittableExtrinsic<'promise'>,
  signer: string,
  { beforeSend, checkProxy }: Options = {}
): TxEvents {
  const events = new TxEvents();

  extractParams(api, signer)
    .then((params) => extrinsic.signAsync(signer, params))
    .then((extrinsic) => {
      events.emit('signed', extrinsic.signature);

      return api.call.blockBuilder.applyExtrinsic(extrinsic);
    })
    .then(async (result) => {
      if (result.isErr) {
        if (result.asErr.isInvalid) {
          throw new Error(`Invalid Transaction: ${result.asErr.asInvalid.type}`);
        } else {
          throw new Error(`Unknown Error: ${result.asErr.asUnknown.type}`);
        }
      } else if (result.asOk.isErr) {
        throw _assetDispatchError(result.asOk.asErr);
      }

      await beforeSend?.(extrinsic);

      const unsubPromise = extrinsic.send((result) => {
        if (result.isFinalized) {
          events.emit('finalized', result);
          unsubPromise.then((unsub) => unsub());
        }

        if (result.isCompleted) {
          events.emit('completed', result);
        }

        if (result.isInBlock) {
          try {
            checkSubmittableResult(result, checkProxy);
            events.emit('inblock', result);
          } catch (error) {
            events.emit('error', error);
            unsubPromise.then((unsub) => unsub());
          }
        }
      });
    })
    .catch((error) => {
      events.emit('error', error);
    });

  return events;
}
