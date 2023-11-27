// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { HexString } from '@polkadot/util/types';
import type { Accounts, Addresses } from './types';

import { keyring } from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import React, { useEffect, useState } from 'react';
import { combineLatest, map } from 'rxjs';

import { useApi } from '../useApi';

interface Props {
  children?: React.ReactNode;
}

interface State {
  accounts: Accounts;
  addresses: Addresses;
}

const EMPTY_IS = () => false;

const EMPTY: State = {
  accounts: { allAccounts: [], allAccountsHex: [], areAccountsLoaded: false, hasAccounts: false, isAccount: EMPTY_IS },
  addresses: { allAddresses: [], allAddressesHex: [], areAddressesLoaded: false, hasAddresses: false, isAddress: EMPTY_IS }
};

export const KeyringCtx = React.createContext<State>(EMPTY);

/**
 * @internal Helper function to dedupe a list of items, only adding it if
 *
 *   1. It is not already present in our list of results
 *   2. It does not exist against a secondary list to check
 *
 * The first check ensures that we never have dupes in the original. The second
 * ensures that e.g. an address is not also available as an account
 **/
function filter(items: string[], others: string[] = []): string[] {
  const allowedLength = 32;

  return items.reduce<string[]>((result, a) => {
    if (!result.includes(a) && !others.includes(a)) {
      try {
        if (decodeAddress(a).length >= allowedLength) {
          result.push(a);
        } else {
          console.warn(`Not adding address ${a}, not in correct format for chain (requires publickey from address)`);
        }
      } catch {
        console.error(a, allowedLength);
      }
    }

    return result;
  }, []);
}

/**
 * @internal Helper function to convert a list of ss58 addresses into hex
 **/
function toHex(items: string[]): HexString[] {
  return items
    .map((a): HexString | null => {
      try {
        return u8aToHex(decodeAddress(a));
      } catch (error) {
        // This is actually just a failsafe - the keyring really should
        // not be passing through invalid ss58 values, but never say never
        console.error(`Unable to convert address ${a} to hex`, (error as Error).message);

        return null;
      }
    })
    .filter((a): a is HexString => !!a);
}

let allAccounts: string[];
let allAddresses: string[];

const isAccount: Accounts['isAccount'] = (a): boolean => {
  return !!a && allAccounts.includes(a.toString());
};

const isAddress: Addresses['isAddress'] = (a): boolean => {
  return !!a && allAddresses.includes(a.toString());
};

function extractAccounts(accounts: SubjectInfo = {}): Accounts {
  allAccounts = filter(Object.keys(accounts));

  return {
    allAccounts,
    allAccountsHex: toHex(allAccounts),
    areAccountsLoaded: true,
    hasAccounts: allAccounts.length !== 0,
    isAccount
  };
}

function extractAddresses(addresses: SubjectInfo = {}, accounts: string[]): Addresses {
  allAddresses = filter(Object.keys(addresses), accounts);

  return {
    allAddresses,
    allAddressesHex: toHex(allAddresses),
    areAddressesLoaded: true,
    hasAddresses: allAddresses.length !== 0,
    isAddress
  };
}

export function KeyringCtxRoot({ children }: Props): React.ReactElement<Props> {
  const { isApiReady } = useApi();
  const [state, setState] = useState(EMPTY);

  useEffect((): (() => void) => {
    let sub: null | { unsubscribe: () => void } = null;

    // Defer keyring injection until the API is ready - we need to have the chain
    // info to determine which type of addresses we can use (before subscribing)
    if (isApiReady) {
      sub = combineLatest([keyring.accounts.subject.pipe(map((accInfo) => extractAccounts(accInfo))), keyring.addresses.subject])
        .pipe(
          map(
            ([accounts, addrInfo]): State => ({
              accounts,
              addresses: extractAddresses(addrInfo, accounts.allAccounts)
            })
          )
        )
        .subscribe((state) => setState(state));
    }

    return (): void => {
      sub && sub.unsubscribe();
    };
  }, [isApiReady]);

  return <KeyringCtx.Provider value={state}>{children}</KeyringCtx.Provider>;
}
