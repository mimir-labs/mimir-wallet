// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

function Navigate({ to, replace }: { to: string; replace: boolean }) {
  const navigate = useNavigate();

  useEffectOnce(() => {
    setTimeout(() => {
      navigate(to, { replace });
    });
  });

  return null;
}

export default Navigate;
