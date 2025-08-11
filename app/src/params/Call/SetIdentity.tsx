// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletIdentityLegacyIdentityInfo } from '@polkadot/types/lookup';
import type { CallProps } from './types';

import IconDiscord from '@/assets/images/discord.svg';
import IconEmail from '@/assets/images/email.svg';
import IconGithub from '@/assets/images/github.svg';
import IconMatrix from '@/assets/images/matrix.svg';
import IconTwitter from '@/assets/images/x.svg';
import { Address, CopyAddress, IdentityIcon } from '@/components';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { dataToUtf8 } from '@/utils';
import React, { forwardRef, useMemo } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';
import { Avatar, Tooltip } from '@mimir-wallet/ui';

import FunctionArgs from './FunctionArgs';
import { mergeClasses } from './utils';

const Item = React.memo(({ icon, value }: { icon: string; value: string }) => {
  const [copied, copy] = useCopyClipboard();

  return (
    <Tooltip content={copied ? 'Copied' : value}>
      <Avatar src={icon} style={{ cursor: 'copy', width: 32, height: 32 }} onClick={() => copy(value)} />
    </Tooltip>
  );
});

const IdentityDisplay = React.memo(
  ({
    address,
    display,
    discord,
    email,
    github,
    matrix,
    twitter
  }: {
    address?: string;
    display: string | undefined;
    discord: string | undefined;
    email: string | undefined;
    github: string | undefined;
    legal: string | undefined;
    matrix: string | undefined;
    riot: string | undefined;
    twitter: string | undefined;
    web: string | undefined;
  }) => {
    return (
      <>
        <div className='flex items-center gap-2'>
          {address && <IdentityIcon size={34} value={address} />}
          <b>{display}</b>
          {address && (
            <span className='flex items-center' style={{ opacity: 0.5, fontSize: '0.75rem' }}>
              <Address value={address} shorten />
              <CopyAddress address={address} />
            </span>
          )}
        </div>
        <div className='flex items-center gap-2.5 sm:gap-5'>
          {twitter && <Item icon={IconTwitter} value={twitter} />}
          {discord && <Item icon={IconDiscord} value={discord} />}
          {matrix && <Item icon={IconMatrix} value={matrix} />}
          {email && <Item icon={IconEmail} value={email} />}
          {github && <Item icon={IconGithub} value={github} />}
        </div>
      </>
    );
  }
);

const SetIdentity = forwardRef<HTMLDivElement | null, CallProps>((props, ref) => {
  const { from, registry, call, className, showFallback, fallbackComponent: FallbackComponent = FunctionArgs } = props;
  const action = useMemo(() => findAction(registry, call), [registry, call]);

  const results = useMemo(() => {
    let display: string | undefined;
    let discord: string | undefined;
    let email: string | undefined;
    let github: string | undefined;
    let legal: string | undefined;
    let matrix: string | undefined;
    let riot: string | undefined;
    let twitter: string | undefined;
    let web: string | undefined;

    if (!action) {
      return null;
    }

    const [section, method] = action;

    if (section !== 'identity') {
      return null;
    }

    if (method === 'setIdentity') {
      const info = call.args.at(0) as PalletIdentityLegacyIdentityInfo | undefined;

      if (!info) {
        return null;
      }

      display = dataToUtf8(info.display);
      discord = dataToUtf8(info.getT('discord'));
      email = dataToUtf8(info.email);
      github = dataToUtf8(info.getT('github'));
      legal = dataToUtf8(info.legal);
      matrix = dataToUtf8(info.getT('matrix'));
      riot = dataToUtf8(info.riot);
      twitter = dataToUtf8(info.twitter);
      web = dataToUtf8(info.web);
    } else {
      return null;
    }

    return { display, discord, email, github, legal, matrix, riot, twitter, web } as const;
  }, [action, call]);

  if (!results) return showFallback ? <FallbackComponent ref={ref} {...props} /> : null;

  return (
    <div
      ref={ref}
      className={mergeClasses('flex w-full items-center justify-between gap-2.5 sm:gap-5 md:gap-7', className)}
    >
      <IdentityDisplay {...results} address={from} />
    </div>
  );
});

SetIdentity.displayName = 'SetIdentity';

export default React.memo(SetIdentity);
