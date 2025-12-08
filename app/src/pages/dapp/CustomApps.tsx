// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mimir-wallet/ui';
import { useMedia, useToggle } from 'react-use';

import AddCustomApp from './AddCustomApp';

import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';

function CustomApps() {
  const [isOpen, toggleOpen] = useToggle(false);
  const { customApps, removeCustom } = useDapps();
  const isMobile = useMedia('(max-width: 768px)');

  return (
    <>
      <div
        className={
          isMobile
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-6'
        }
      >
        <div
          key="add-custom-app"
          className="card-root relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-5 p-5"
          onClick={toggleOpen}
        >
          <Button
            className="h-16 w-16"
            variant="light"
            isIconOnly
            size="lg"
            radius="full"
            onClick={toggleOpen}
          >
            <IconAdd className="text-primary h-16 w-16" />
          </Button>
          <h3 className="text-center text-2xl font-bold">
            Add New Customized App
          </h3>
          <p className="text-foreground/50 text-center text-xs">
            You can add apps not listed but support Mimir SDK.
          </p>
        </div>

        {customApps.map((app) => (
          <DappCell
            key={app.id}
            supportedChains={true}
            onDelete={removeCustom}
            variant={isMobile ? 'mobile' : 'default'}
            {...app}
            icon={app.icon || ''}
          />
        ))}
      </div>

      <AddCustomApp isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default CustomApps;
