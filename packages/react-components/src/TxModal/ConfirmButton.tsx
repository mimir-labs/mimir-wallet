// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable operator-linebreak */

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions } from '@polkadot/api/submittable/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Option } from '@polkadot/types';
import type { Multisig, Timepoint } from '@polkadot/types/interfaces';

import { LoadingButton } from '@mui/lab';
import { web3FromSource } from '@polkadot/extension-dapp';
import { keyring } from '@polkadot/ui-keyring';
import { assert, objectSpread } from '@polkadot/util';
import { addressEq } from '@polkadot/util-crypto';
import React, { useCallback, useState } from 'react';

import { MULTISIG_CALLDATA } from '@mimirdev/app-config/constants';
import { AccountSigner } from '@mimirdev/react-api';
import { useApi } from '@mimirdev/react-hooks';

import { getAddressMeta } from '../utils';

async function extractParams(api: ApiPromise, address: string): Promise<Partial<SignerOptions>> {
  const pair = keyring.getPair(address);
  const {
    meta: { isInjected, source }
  } = pair;

  if (isInjected) {
    const injected = await web3FromSource(source as string);

    assert(injected, `Unable to find a signer for ${address}`);

    return { signer: injected.signer };
  }

  assert(addressEq(address, pair.address), `Unable to retrieve keypair for ${address}`);

  return { signer: new AccountSigner(api.registry, pair) };
}

async function wrapTx(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic<'promise'>,
  address: string,
  signAddress?: string,
  isMultisig?: boolean,
  isMultisigCancel?: boolean
): Promise<SubmittableExtrinsic<'promise'>> {
  let tx = extrinsic;

  if (isMultisig) {
    const [info, { weight }] = await Promise.all([api.query.multisig.multisigs<Option<Multisig>>(address, tx.method.hash), tx.paymentInfo(address) as Promise<{ weight: any }>]);

    console.log('multisig max weight=', (weight as string).toString());

    const { threshold, who } = getAddressMeta(address) as { who: string[]; threshold: number };
    const others = who.filter((w) => w !== signAddress);
    let timepoint: Timepoint | null = null;
    let approvals = 0;

    if (info.isSome) {
      timepoint = info.unwrap().when;
      approvals = info.unwrap().approvals.length;
    }

    tx = isMultisigCancel
      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        api.tx.multisig.cancelAsMulti(threshold, others, timepoint, tx.method.hash.toHex())
      : approvals >= threshold - 1
      ? api.tx.multisig.asMulti.meta.args.length === 5
        ? // We are doing toHex here since we have a Vec<u8> input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          api.tx.multisig.asMulti(threshold, others, timepoint, tx.method.toHex(), weight)
        : api.tx.multisig.asMulti.meta.args.length === 6
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          api.tx.multisig.asMulti(threshold, others, timepoint, tx.method.toHex(), false, weight)
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          api.tx.multisig.asMulti(threshold, others, timepoint, tx.method)
      : api.tx.multisig.approveAsMulti.meta.args.length === 5
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        api.tx.multisig.approveAsMulti(threshold, others, timepoint, tx.method.hash, weight)
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        api.tx.multisig.approveAsMulti(threshold, others, timepoint, tx.method.hash);
  }

  return tx;
}

function ConfirmButton({
  address,
  extrinsic,
  isMultisig,
  isMultisigCancel,
  onClick,
  signAddress
}: {
  isMultisig?: boolean;
  isMultisigCancel?: boolean;
  signAddress?: string;
  address: string;
  extrinsic: SubmittableExtrinsic<'promise'>;
  onClick?: () => void;
}) {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const onConfirm = useCallback(async () => {
    setLoading(true);

    try {
      const [tx, params] = await Promise.all([wrapTx(api, extrinsic, address, signAddress, isMultisig, isMultisigCancel), extractParams(api, signAddress || address)]);

      console.log(await tx.dryRun(signAddress || address, params));

      if (signAddress) {
        const calldata = localStorage.getItem(MULTISIG_CALLDATA);

        localStorage.setItem(
          MULTISIG_CALLDATA,
          JSON.stringify(
            objectSpread(
              {
                [extrinsic.method.hash.toHex()]: extrinsic.method.toHex()
              },
              calldata ? JSON.parse(calldata) : {}
            )
          )
        );
      }

      onClick?.();
    } catch (error) {
      console.debug(error);
    }

    setLoading(false);
  }, [address, api, extrinsic, isMultisig, isMultisigCancel, onClick, signAddress]);

  return (
    <LoadingButton loading={loading} onClick={onConfirm} variant='contained'>
      Confirm
    </LoadingButton>
  );
}

export default React.memo(ConfirmButton);
