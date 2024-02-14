// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Stack, Typography } from '@mui/material';
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
        <Button className='Welcome-cell' color='primary' onClick={() => navigate('/create-multisig')}>
          <img src='images/create-multisig.png' width={93} />
          <Typography color='white' variant='h6'>
            Create/Import Multisig
          </Typography>
        </Button>
        <Button className='Welcome-cell' sx={{ bgcolor: 'common.white', color: 'inherit', ':hover': { bgcolor: 'common.white' } }} variant='text'>
          <img src='images/start.png' width={98} />
          <Typography variant='h6'>
            Not Now,
            <br />
            Start from extension wallet
          </Typography>
        </Button>
      </Stack>
    </>
  );
}

export default Welcome;
