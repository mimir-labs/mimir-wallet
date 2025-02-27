// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';

import IconAdd from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question-fill.svg?react';
import { Empty } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';

import TemplateItem from './TemplateItem';
import { useSavedTemplate } from './useSavedTemplate';

function TemplateList({ onAdd, onClose }: { onAdd: () => void; onClose: () => void }) {
  const { network } = useApi();
  const { template, removeTemplate, editTemplateName } = useSavedTemplate(network);

  return (
    <Stack spacing={2} height='100%'>
      <Box display='flex' gap={0.5} alignItems='center'>
        <Typography variant='h4'>Call Template</Typography>
        <Tooltip title='Save frequently used on-chain operation templates for repeated use in the future.'>
          <SvgIcon color='primary' component={IconQuestion} inheritViewBox />
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button
          size='small'
          variant='outlined'
          color='primary'
          sx={{ justifySelf: 'end' }}
          endIcon={<SvgIcon component={IconAdd} inheritViewBox />}
          onClick={onAdd}
        >
          Add
        </Button>
        <IconButton
          sx={{ border: '1px solid', bordercolor: 'primary.main' }}
          size='small'
          color='primary'
          onClick={onClose}
        >
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
      </Box>

      <Divider />

      <Stack spacing={1} height='100%' overflow='auto' className='no-scrollbar'>
        <Typography>Saved</Typography>
        {template.length > 0 ? (
          template.map(({ name, call }, index) => (
            <TemplateItem
              key={index}
              name={name}
              call={call}
              onEditName={(name) => editTemplateName(index, name)}
              onDelete={() => removeTemplate(index)}
            />
          ))
        ) : (
          <Empty height={300} label='No saved template' />
        )}
      </Stack>

      {/* <Divider />

      <Stack spacing={1} height='calc((100% - 100px) * 0.4)' overflow='auto' className='no-scrollbar'>
        <Box display='flex' gap={0.5} alignItems='center' justifyContent='space-between'>
          <Typography>Suggestions</Typography>
          <Typography fontSize='0.75rem' color='textSecondary'>
            Check parameter before submit transactions.
          </Typography>
        </Box>

        {template.length > 0 ? (
          template.map((t) => (
            <Box key={t.name}>
              <Typography>{t.name}</Typography>
            </Box>
          ))
        ) : (
          <Empty height='100%' label='No saved template' />
        )}
      </Stack> */}
    </Stack>
  );
}

export default TemplateList;
