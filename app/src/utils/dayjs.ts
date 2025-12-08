// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import dayjs from 'dayjs';

// Default date-time format for the application
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Re-export dayjs for convenience
export { dayjs };

// Format date with default format
export function formatDate(date: dayjs.ConfigType): string {
  return dayjs(date).format(DEFAULT_DATE_FORMAT);
}
