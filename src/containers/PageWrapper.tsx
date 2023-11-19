// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

function PageWrapper() {
  return (
    <Box sx={{ height: '100%', paddingTop: '56px' }}>
      <Container
        maxWidth='xl'
        sx={{
          paddingY: 3,
          height: '100%'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default PageWrapper;
