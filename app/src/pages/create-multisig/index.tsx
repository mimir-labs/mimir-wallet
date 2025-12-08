// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DesktopCreateMultisig from './desktop';
import MobileCreateMultisig from './mobile';

import { useMediaQuery } from '@/hooks/useMediaQuery';

function PageCreateMultisig() {
  const upMd = useMediaQuery('md');

  return upMd ? <DesktopCreateMultisig /> : <MobileCreateMultisig />;
}

export default PageCreateMultisig;
