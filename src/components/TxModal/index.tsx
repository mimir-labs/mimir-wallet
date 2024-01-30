// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { Dialog, DialogTitle } from '@mui/material';

import Contents from './Contents';

function TxModal() {
  const { isApiReady } = useApi();
  const { queue } = useTxQueue();

  return isApiReady ? (
    queue.map(
      ({
        accountId,
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
          open={true}
        >
          <DialogTitle>{onlySign ? 'Sign Transaction' : 'Submit Transaction'}</DialogTitle>
          {isApiReady && (
            <Contents
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
  ) : (
    <></>
  );
}

export default TxModal;
