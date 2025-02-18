// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  type IconButtonProps,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { encodeAddress } from '@mimir-wallet/api';
import IconCopy from '@mimir-wallet/assets/svg/icon-copy.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useCopyClipboard } from '@mimir-wallet/hooks/useCopyClipboard';

import CopyButton from './CopyButton';

interface Props extends IconButtonProps {
  value?: string;
}

function Item({
  title,
  value,
  prefix,
  ss58Format
}: {
  title: string;
  prefix?: string;
  value: string;
  ss58Format: number;
}) {
  const [copied, copy] = useCopyClipboard();

  const text = useMemo(() => encodeAddress(value, ss58Format), [value, ss58Format]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      copy(text);
    },
    [copy, text]
  );

  return (
    <Box
      sx={{
        width: 280,
        padding: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        bgcolor: 'secondary.main',
        borderRadius: 1
      }}
    >
      <b>{title}</b>
      <Typography sx={{ flex: 1 }}>
        {prefix ? `${prefix}:` : ''}
        {text.slice(0, 6)}…{text.slice(-6)}
      </Typography>
      <IconButton color='primary' onClick={handleClick} size='small'>
        <SvgIcon component={copied ? IconSuccess : IconCopy} inheritViewBox />
      </IconButton>
    </Box>
  );
}

const CopyAddress = forwardRef<HTMLButtonElement, Props>(function CopyAddress({ value, ...props }, ref) {
  const { chain, chainSS58, tokenSymbol } = useApi();
  const [open, toggleOpen] = useToggle(false);

  if (!value) return null;

  if (chain.relayChainSs58Format === undefined) {
    return <CopyButton value={encodeAddress(value, chainSS58)} {...props} ref={ref} />;
  }

  return (
    <>
      <IconButton
        color='inherit'
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleOpen();
        }}
        size='small'
        sx={{ opacity: 0.7 }}
        {...props}
        ref={ref}
      >
        <SvgIcon component={IconCopy} inheritViewBox />
      </IconButton>

      {open && (
        <Dialog open={open} onClose={toggleOpen} maxWidth='xs'>
          <DialogContent>
            <Stack spacing={1} alignItems='center'>
              <Item title='Original' value={value} ss58Format={chain.ss58Format} />
              {chain.relayChainSs58Format !== undefined && (
                <Item title='Unified' prefix={tokenSymbol} value={value} ss58Format={chain.relayChainSs58Format} />
              )}
              <Button
                component={Link}
                to='/setting?setting-tab=display'
                variant='text'
                color='primary'
                onClick={toggleOpen}
              >
                Manage address format
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

export default React.memo(CopyAddress);
