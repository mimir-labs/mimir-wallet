// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant='h1'>Welcome</Typography>
      <Stack
        direction='row'
        spacing={2.5}
        sx={{
          marginTop: 2.5,
          '>.Welcome-cell': {
            cursor: 'pointer',
            width: 280,
            height: 280,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2.5,
            '>img': {
              userSelect: 'none',
              pointerEvents: 'none'
            }
          }
        }}
      >
        <Paper className='Welcome-cell' color='primary' component={Button} onClick={() => navigate('/create-multisig')} sx={{ bgcolor: 'primary.main', ':hover': { bgcolor: 'primary.main' } }}>
          <img src='create-multisig.png' width={93} />
          <Typography color='white' variant='h6'>
            Create/Import Multisig
          </Typography>
        </Paper>
        <Paper className='Welcome-cell' component={Button}>
          <img src='start.png' width={98} />
          <Typography variant='h6'>
            Not Now,
            <br />
            Start from extension wallet
          </Typography>
        </Paper>
      </Stack>
    </>
  );
}

export default Welcome;
