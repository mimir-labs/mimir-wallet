// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionTypes } from '@walletconnect/types';

import { Input } from '@/components';
import { useInput } from '@/hooks/useInput';
import { asError } from '@/utils';
import { useCallback, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Alert, AlertTitle, Avatar, Button, buttonSpinner, Divider, Spinner } from '@mimir-wallet/ui';

import { isPairingUri } from '../utils';
import { connect, disconnectSession } from '../wallet-connect';

function ConnectSession({ session }: { session: SessionTypes.Struct }) {
  const [state, disconnect] = useAsyncFn((session: SessionTypes.Struct) => {
    return disconnectSession(session);
  }, []);
  const [showFallback, setShowFallback] = useState(false);

  return (
    <div className='flex w-full items-center gap-2.5 rounded-[10px] border-1 border-[#d9d9d9]/50 p-2.5'>
      <Avatar
        showFallback={showFallback}
        fallback={<Avatar src='/images/wallet-connect.webp' alt='wallet connect' style={{ width: 30, height: 30 }} />}
        style={{ width: 30, height: 30 }}
        src={session.peer.metadata.icons[0]?.startsWith('https://') ? session.peer.metadata.icons[0] : undefined}
        onError={() => {
          setShowFallback(true);
        }}
      />
      <p className='flex-1 text-sm'>{session.peer.metadata.name}</p>
      <Button size='sm' color='danger' variant='light' disabled={state.loading} onClick={() => disconnect(session)}>
        {state.loading ? buttonSpinner : null}
        Disconnect
      </Button>
    </div>
  );
}

function Connect({ sessions }: { sessions: SessionTypes.Struct[] }) {
  const [uri, setUri] = useInput('');
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const onInput = useCallback(
    async (val: string) => {
      setUri(val);

      if (val && !isPairingUri(val)) {
        setError(new Error('Invalid pairing code'));

        return;
      }

      setError(undefined);

      if (!val) return;

      setIsLoading(true);

      try {
        await connect(val);
      } catch (e) {
        setError(asError(e));
      }
    },
    [setUri]
  );

  return (
    <div className='flex flex-col items-center gap-5'>
      <Avatar src='/images/wallet-connect.webp' alt='wallet connect' style={{ width: 150, height: 150 }} />
      <h4 className='text-xl font-bold'>Wallet Connect</h4>
      <Input
        value={uri}
        onChange={onInput}
        label='Pairing Key'
        placeholder='wc:'
        helper='In the application you wish to connect to, select the option to log in using WalletConnect and copy the Pairing Key.'
        color={error ? 'danger' : undefined}
        endAdornment={isLoading ? <Spinner size='sm' /> : null}
      />
      {error && (
        <Alert variant='destructive'>
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      )}
      {sessions.length > 0 && <Divider />}
      {sessions.map((session) => (
        <ConnectSession session={session} key={session.topic} />
      ))}
    </div>
  );
}

export default Connect;
