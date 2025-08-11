// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMediaQuery } from '@/hooks/useMediaQuery';

import DesktopAddProxy from './desktop';
import MobileAddProxy from './mobile';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const upMd = useMediaQuery('md');

  if (upMd) {
    return <DesktopAddProxy pure={pure} />;
  }

  return <MobileAddProxy pure={pure} />;
}

export default PageAddProxy;
