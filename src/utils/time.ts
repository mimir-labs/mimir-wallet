// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';

const timeUnits: [string, number][] = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1] // million seconds
];

export function formatTimeStr(duration: number, format: string) {
  let leftDuration: number = duration;

  const escapeRegex = /\[[^\]]*]/g;
  const keepList: string[] = (format.match(escapeRegex) || []).map((str) => str.slice(1, -1));
  const templateText = format.replace(escapeRegex, '[]');

  const replacedText = timeUnits.reduce((current, [name, unit]) => {
    if (current.includes(name)) {
      const value = Math.floor(leftDuration / unit);

      leftDuration -= value * unit;

      return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
        const len = match.length;

        return value.toString().padStart(len, '0');
      });
    }

    return current;
  }, templateText);

  let index = 0;

  return replacedText.replace(escapeRegex, () => {
    const match = keepList[index];

    index += 1;

    return match;
  });
}

export function autoFormatTimeStr(duration: number) {
  return duration > ONE_DAY * 1000
    ? `${formatTimeStr(duration, 'D')} days`
    : duration > ONE_HOUR * 1000
      ? `${formatTimeStr(duration, 'H')} hours`
      : duration > ONE_MINUTE * 1000
        ? `${formatTimeStr(duration, 'm')} minutes`
        : `${formatTimeStr(duration, 's')} seconds`;
}

export function formatCountdown(value: number | string, current = Date.now()) {
  const target = new Date(value).getTime();
  const diff = Math.max(target - current, 0);

  return autoFormatTimeStr(diff);
}

export function formatAgo(value: number | string, current = Date.now()) {
  const target = new Date(value).getTime();
  const diff = Math.max(current - target, 0);

  return autoFormatTimeStr(diff);
}
