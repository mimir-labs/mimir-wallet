// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function parseUnits(value: string, decimals: number) {
  let [integer, fraction = '0'] = value.split('.');

  const negative = integer.startsWith('-');

  if (negative) integer = integer.slice(1);

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '');

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1) integer = `${BigInt(integer) + 1n}`;
    fraction = '';
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];

    const rounded = Math.round(Number(`${unit}.${right}`));

    if (rounded > 9) fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, '0');
    else fraction = `${left}${rounded}`;

    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }

    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, '0');
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`);
}

export function formatUnits(value: bigint | { toString: () => string }, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith('-');

  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  const results = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];

  const integer = results[0];
  const fraction = results[1].replace(/(0+)$/, '');

  return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
}

export const formatDisplay = (value: string): [string, string, string] => {
  let [pre, suf] = ['', ''];

  if (value.includes('.')) {
    [pre, suf] = value.split('.');
  } else {
    pre = value;
  }

  const preLen = pre.length;

  let display: string;

  if (preLen > 18) {
    display = `${(Number(BigInt(pre) / BigInt(1e15)) / 1000).toFixed(3)} Qi`;
  } else if (preLen > 15) {
    display = `${(Number(BigInt(pre) / BigInt(1e12)) / 1000).toFixed(3)} Q`;
  } else if (preLen > 12) {
    display = `${(Number(BigInt(pre) / BigInt(1e9)) / 1000).toFixed(3)} T`;
  } else if (preLen > 9) {
    display = `${(Number(BigInt(pre) / BigInt(1e6)) / 1000).toFixed(3)} B`;
  } else if (preLen > 6) {
    display = `${(Number(BigInt(pre) / BigInt(1e3)) / 1000).toFixed(3)} M`;
  } else if (preLen > 3) {
    display = `${(Number(BigInt(pre) / BigInt(1)) / 1000).toFixed(3)} K`;
  } else {
    display = `${pre}.${suf}`;
  }

  const [amount, unit] = display.split(' ');

  [pre, suf] = amount.split('.');

  return [pre, suf.replace(/0+$/, '').slice(0, 3), unit];
};
