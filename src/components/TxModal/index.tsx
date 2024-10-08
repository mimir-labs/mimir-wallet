// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Dialog, DialogTitle } from '@mui/material';

import { useApi, useTxQueue } from '@mimir-wallet/hooks';

import Contents from './Contents';

function TxModal() {
  const { isApiReady } = useApi();
  const { queue } = useTxQueue();

  return isApiReady
    ? queue.map(
        ({
          accountId,
          accounts,
          beforeSend,
          destCall,
          destSender,
          extrinsic,
          filtered,
          id,
          isApprove,
          isCancelled,
          onError,
          onFinalized,
          onReject,
          onRemove,
          onResults,
          onSignature,
          onlySign,
          transaction,
          website
        }) => (
          <Dialog
            fullWidth
            key={id}
            maxWidth='sm'
            onClose={() => {
              onRemove();
              onReject();
            }}
            open
          >
            <DialogTitle>{onlySign ? 'Sign Transaction' : 'Submit Transaction'}</DialogTitle>
            {isApiReady && (
              <Contents
                accounts={accounts}
                address={accountId.toString()}
                beforeSend={beforeSend}
                destCall={destCall}
                destSender={destSender.toString()}
                extrinsic={extrinsic}
                filtered={filtered}
                isApprove={isApprove}
                isCancelled={isCancelled}
                onClose={onRemove}
                onError={onError}
                onFinalized={onFinalized}
                onReject={onReject}
                onResults={onResults}
                onSignature={onSignature}
                onlySign={onlySign}
                transaction={transaction}
                website={website}
              />
            )}
          </Dialog>
        )
      )
    : null;
}

export default TxModal;
