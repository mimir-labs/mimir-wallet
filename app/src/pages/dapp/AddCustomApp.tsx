// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomDappOption } from '@/config';

import IconEdit from '@/assets/svg/icon-edit.svg?react';
import { Input } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import { useDebounceFn } from '@/hooks/useDebounceFn';
import { isValidURL } from '@/utils';
import { fetchAppMetadata } from '@/utils/proxy';
import React, { useCallback, useRef, useState } from 'react';

import {
  Alert,
  Avatar,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from '@mimir-wallet/ui';

function AddCustomApp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState('');
  const [findApp, setFindApp] = useState<CustomDappOption>();
  const { addCustom } = useDapps();

  const handleClose = useCallback(() => {
    onClose();
    setFindApp(undefined);
    setError(undefined);
    setIsLoading(false);
  }, [onClose]);

  const onInput = useDebounceFn(async (val: string) => {
    if (val && !isValidURL(val)) {
      setError(new Error('Invalid URL'));

      return;
    }

    if (!val) {
      setFindApp(undefined);
      setError(undefined);

      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetchAppMetadata(val);

      if (response.success && response.data) {
        const { name, description, icon } = response.data;

        setFindApp({
          id: `custom-app-${val}`,
          url: val,
          name: name || 'Unknown App',
          description: description || '',
          icon
        });

        setEdit(name || 'Unknown App');
        setError(undefined);
      } else {
        setError(new Error(response.error || 'Unable to fetch app information'));
        setFindApp(undefined);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch app information';

      setError(new Error(errorMessage));
      setFindApp(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Add New Customized App</ModalHeader>
        <Divider />
        <ModalBody>
          <Input
            label='Url'
            placeholder='eg. https://app.uniswap.org'
            variant='bordered'
            labelPlacement='outside'
            onChange={onInput}
            endContent={isLoading ? <Spinner size='sm' /> : null}
          />

          {error && <Alert color='danger' title={error?.message} />}

          {findApp && (
            <div className='shadow-medium border-secondary rounded-medium flex items-center gap-5 border-1 p-5'>
              <Avatar src={findApp.icon} className='h-[50px] w-[50px] flex-shrink-0 bg-transparent' radius='none' />
              <div>
                <div className='flex items-center gap-2'>
                  <div
                    ref={editRef}
                    suppressContentEditableWarning
                    contentEditable
                    className='text-medium font-bold outline-none'
                    onInput={(e) => setFindApp({ ...findApp, name: e.currentTarget.textContent || '' })}
                  >
                    {edit}
                  </div>
                  <Button
                    size='sm'
                    isIconOnly
                    variant='light'
                    className='text-foreground/50'
                    onPress={() => {
                      editRef.current?.focus();
                    }}
                  >
                    <IconEdit />
                  </Button>
                </div>
                <p className='text-tiny text-foreground/50 mt-[5px]'>{findApp.description}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            disabled={!findApp}
            fullWidth
            color='primary'
            radius='full'
            onPress={
              findApp
                ? () => {
                    addCustom(findApp);
                    handleClose();
                  }
                : undefined
            }
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddCustomApp);
