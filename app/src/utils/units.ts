// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable prettier/prettier */
const subscripts: readonly string[] = [
  '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₁₀', '₁₁', '₁₂', '₁₃', '₁₄', '₁₅', '₁₆', '₁₇', '₁₈', '₁₉',
  '₂₀', '₂₁', '₂₂', '₂₃', '₂₄', '₂₅', '₂₆', '₂₇', '₂₈', '₂₉', '₃₀', '₃₁', '₃₂', '₃₃', '₃₄', '₃₅', '₃₆', '₃₇', '₃₈', '₃₉',
  '₄₀', '₄₁', '₄₂', '₄₃', '₄₄', '₄₅', '₄₆', '₄₇', '₄₈', '₄₉', '₅₀', '₅₁', '₅₂', '₅₃', '₅₄', '₅₅', '₅₆', '₅₇', '₅₈', '₅₉',
  '₆₀', '₆₁', '₆₂', '₆₃', '₆₄', '₆₅', '₆₆', '₆₇', '₆₈', '₆₉', '₇₀', '₇₁', '₇₂', '₇₃', '₇₄', '₇₅', '₇₆', '₇₇', '₇₈', '₇₉',
  '₈₀', '₈₁', '₈₂', '₈₃', '₈₄', '₈₅', '₈₆', '₈₇', '₈₈', '₈₉', '₉₀', '₉₁', '₉₂', '₉₃', '₉₄', '₉₅', '₉₆', '₉₇', '₉₈', '₉₉', '₁₀₀'
] as const;

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
  const numValue = parseFloat(value);

  // Handle numbers between 0 and 1 with special formatting
  if (numValue > 0 && numValue < 1) {
    const [, suf] = value.split('.');

    if (suf) {
      // Find leading zeros in decimal part
      const leadingZerosMatch = suf.match(/^0+/);
      const leadingZerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

      if (leadingZerosCount > 3) {
        // Use scientific notation style for more than 3 leading zeros
        const remainingSuf = suf.slice(leadingZerosCount);

        // Get first 3 non-zero digits
        const significantDigits = remainingSuf.slice(0, 3);

        // Format exponent as subscript
        const exponentSubscript = leadingZerosCount < subscripts.length
          ? subscripts[leadingZerosCount]
          : leadingZerosCount.toString().split('').map(digit => subscripts[parseInt(digit)] || digit).join('');

        return ['0', `0${exponentSubscript}${significantDigits}`, ''];
      } else {
        // Normal formatting for 3 or fewer leading zeros
        const trimmedSuf = suf.replace(/0+$/, '').slice(0, 6); // Allow more precision for small numbers

        return ['0', trimmedSuf, ''];
      }
    }

    return ['0', '', ''];
  }

  // Original logic for numbers >= 1
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

  return [pre, suf ? suf.replace(/0+$/, '').slice(0, 3) : '', unit || ''];
};
