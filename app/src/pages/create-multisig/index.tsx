// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMediaQuery } from '@/hooks/useMediaQuery';

import DesktopCreateMultisig from './desktop';
import MobileCreateMultisig from './mobile';

function PageCreateMultisig() {
  const upMd = useMediaQuery('md');

  if (upMd) {
    return <DesktopCreateMultisig />;
  }

  return <MobileCreateMultisig />;
}

export default PageCreateMultisig;
