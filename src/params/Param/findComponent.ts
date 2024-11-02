// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry, TypeDef } from '@polkadot/types/types';
import type { ComponentMap, ParamProps } from './types';

import { TypeDefInfo } from '@polkadot/types/types';

import Account from './Account';
import Amount from './Amount';
import Balance from './Balance';
import CallName from './CallName';
import Unknown from './Unknown';

interface TypeToComponent {
  c: React.ComponentType<any>;
  t: string[];
}

const SPECIAL_TYPES = [
  'AccountId',
  'AccountId20',
  'AccountId32',
  'AccountIndex',
  'Address',
  'Balance',
  'BalanceOf',
  'Vec<KeyValue>'
];

const DISPATCH_ERROR = ['DispatchError', 'SpRuntimeDispatchError'];

const componentDef: TypeToComponent[] = [
  { c: Account, t: ['AccountId', 'Address', 'LookupSource', 'MultiAddress'] },
  { c: Amount, t: ['AccountIndex', 'i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256'] },
  { c: Balance, t: ['Amount', 'Balance', 'BalanceOf'] },
  { c: CallName, t: ['Call'] },
  { c: Unknown, t: ['Unknown'] }
];

const components: ComponentMap = componentDef.reduce(
  (components, { c, t }): ComponentMap => {
    t.forEach((type): void => {
      components[type] = c;
    });

    return components;
  },
  {} as unknown as ComponentMap
);

function fromDef({ displayName, info, lookupName, sub, type }: TypeDef): string {
  if (displayName && SPECIAL_TYPES.includes(displayName)) {
    return displayName;
  }

  if (type.endsWith('RuntimeSessionKeys')) {
    return 'RuntimeSessionKeys';
  }

  const typeValue = lookupName || type;

  switch (info) {
    case TypeDefInfo.Compact:
      return (sub as TypeDef).type;

    case TypeDefInfo.Option:
      return 'Option';

    case TypeDefInfo.Enum:
      return 'Enum';

    case TypeDefInfo.Result: {
      const [, errSub] = sub as TypeDef[];

      return DISPATCH_ERROR.includes(errSub.lookupName || errSub.type) ? 'DispatchResult' : typeValue;
    }

    case TypeDefInfo.Struct:
      return 'Struct';

    case TypeDefInfo.BTreeSet:
      return 'BTreeSet';

    case TypeDefInfo.Tuple:
      return components[type] === Account ? type : 'Tuple';

    case TypeDefInfo.Vec:
      return type === 'Vec<u8>' ? 'Bytes' : ['Vec<KeyValue>'].includes(type) ? 'Vec<KeyValue>' : 'Vec';

    case TypeDefInfo.VecFixed:
      return (sub as TypeDef).type === 'u8' ? type : 'VecFixed';

    default:
      return typeValue;
  }
}

export default function findComponent(
  registry: Registry,
  def: TypeDef,
  overrides: ComponentMap = {}
): React.ComponentType<ParamProps> {
  // Explicit/special handling for Account20/32 types where they don't match
  // the actual chain we are connected to
  if (['AccountId20', 'AccountId32'].includes(def.type)) {
    const defType = `AccountId${registry.createType('AccountId').length}`;

    if (def.type !== defType) {
      if (def.type === 'AccountId20') {
        return Account;
      }

      return Account;
    }
  }

  const findOne = (type?: string): React.ComponentType<ParamProps> | null =>
    type ? overrides[type] || components[type] : null;

  const type = fromDef(def);
  const Component = findOne(def.lookupName) || findOne(def.type) || findOne(type);

  return Component || Unknown;
}
