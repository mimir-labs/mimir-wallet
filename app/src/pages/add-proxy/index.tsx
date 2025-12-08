// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DesktopAddProxy from './desktop';
import MobileAddProxy from './mobile';

import { useMediaQuery } from '@/hooks/useMediaQuery';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const upMd = useMediaQuery('md');

  return upMd ? (
    <DesktopAddProxy pure={pure} />
  ) : (
    <MobileAddProxy pure={pure} />
  );
}

export default PageAddProxy;
