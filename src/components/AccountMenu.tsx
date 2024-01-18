// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconAddOutlined } from '@mimir-wallet/assets/svg/icon-add-outlined.svg';
import { ReactComponent as IconDelete } from '@mimir-wallet/assets/svg/icon-delete.svg';
import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { useGroupAccounts, useSelectedAccount, useSelectedAccountCallback, useToggle } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';
import { Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, SvgIcon, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from 'store';

import AddressCell from './AddressCell';
import SwitchAccountDialog from './SwitchAccountDialog';

interface Props {
  open: boolean;
  onClose?: () => void;
}

function AccountCell({ onSelect, selected, value }: { selected?: string; value: string; onSelect?: (address: string) => void }) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onSelect?.(value);
    },
    [onSelect, value]
  );

  return (
    <ListItem>
      <ListItemButton
        disableTouchRipple
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingX: 1,
          paddingY: 0.5,
          border: '1px solid',
          borderColor: selected === value ? 'primary.main' : 'secondary.main',
          borderRadius: 1
        }}
      >
        <AddressCell shorten showType size='small' value={value} withCopy />
        <IconButton onClick={(e) => e.stopPropagation()} size='small' sx={{ color: 'grey.300', ':hover': { color: 'error.main' } }}>
          <SvgIcon component={IconDelete} inheritViewBox />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}

function CreateMultisig() {
  const navigate = useNavigate();

  return (
    <ListItem>
      <ListItemButton
        onClick={() => navigate('/create-multisig')}
        sx={{
          paddingX: 1,
          paddingY: 0.5,
          border: '1px solid',
          borderColor: 'secondary.main',
          borderRadius: 1
        }}
      >
        <ListItemIcon>
          <SvgIcon color='primary' component={IconAddOutlined} inheritViewBox sx={{ fontSize: '2rem !important' }} />
        </ListItemIcon>
        Create/Recover Multisig
      </ListItemButton>
    </ListItem>
  );
}

function AccountMenu({ onClose, open }: Props) {
  const grouped = useGroupAccounts();
  const [address, setAddress] = useState<string>('');
  const [switchOpen, toggleOpen] = useToggle();
  const selected = useSelectedAccount();
  const selectAccount = useSelectedAccountCallback();

  const onSelect = useCallback(
    (address: string) => {
      if (selected === address) return;

      if (store.get(SWITCH_ACCOUNT_REMIND_KEY)) {
        selectAccount(address);
        onClose?.();
      } else {
        setAddress(address);
        toggleOpen();
      }
    },
    [onClose, selectAccount, selected, toggleOpen]
  );

  return (
    <>
      <SwitchAccountDialog address={address} onClose={toggleOpen} onSelect={onClose} open={switchOpen} />
      <Drawer onClose={onClose} open={open}>
        <List sx={{ width: 280, padding: 1 }}>
          <Typography>Multisig Wallet</Typography>
          {grouped.multisig
            .filter((item) => {
              const meta = getAddressMeta(item);

              return !meta.isHidden && meta.isValid;
            })
            .map((account) => (
              <AccountCell key={`multisig-${account}`} onSelect={onSelect} selected={selected} value={account} />
            ))}
          <CreateMultisig />
          <Divider sx={{ marginY: 1 }} />
          <Typography>Extension Wallet</Typography>
          {grouped.injected.map((account) => (
            <AccountCell key={`extension-${account}`} onSelect={onSelect} selected={selected} value={account} />
          ))}
          {grouped.accounts.length > 0 && (
            <>
              <Divider sx={{ marginY: 1 }} />
              <Typography>Local Wallet</Typography>
              {grouped.accounts.map((account) => (
                <AccountCell key={`local-${account}`} onSelect={onSelect} selected={selected} value={account} />
              ))}
            </>
          )}
          {grouped.testing.length > 0 && (
            <>
              <Divider sx={{ marginY: 1 }} />
              <Typography>Testing Wallet</Typography>
              {grouped.testing.map((account) => (
                <AccountCell key={`testing-${account}`} onSelect={onSelect} selected={selected} value={account} />
              ))}
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default React.memo(AccountMenu);
