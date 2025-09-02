// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconDownload from '@/assets/svg/icon-download.svg?react';
import React, { useCallback, useState } from 'react';

import { Button } from '@mimir-wallet/ui';

import { generateExampleCsv } from './parse';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

function Upload({ onUpload, accept = '*', multiple = false, maxSize = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File ${file.name} too large。max ${maxSize}MB`);

          return false;
        }
      }

      setError(null);

      return true;
    },
    [maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);

      if (validateFiles(files)) {
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [multiple, onUpload, validateFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (validateFiles(files)) {
        onUpload(multiple ? files : [files[0]]);
      }

      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    },
    [multiple, onUpload, validateFiles]
  );

  return (
    <div className='bg-secondary mx-auto w-full rounded-[10px] px-2.5 py-3'>
      <div
        data-dragging={isDragging}
        className='data-[dragging=true]:border-primary relative cursor-pointer space-y-5 rounded-lg border-2 border-dashed border-transparent p-8 transition-all duration-300 ease-in-out'
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type='file'
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
        />

        <div className='space-y-5 text-center'>
          <div className='flex justify-center'>
            <svg width='36' height='44' viewBox='0 0 36 44' fill='none'>
              <path
                d='M26 0L36 11V41.8176C35.9989 43.0232 35.1101 44 34.014 44H1.986C0.893103 43.9916 0.00870777 43.0197 0 41.8176V2.18249C0 0.976851 0.890017 0 1.986 0H26ZM16 19.8H9.99999V24.2H16V30.8H20V24.2H26V19.8H20V13.2H16V19.8Z'
                fill='#2700FF'
              />
            </svg>
          </div>

          <p className='text-foreground mb-2 text-lg font-semibold'>Drag files here or click to upload</p>

          <Button variant='bordered' size='sm' color='primary' onClick={generateExampleCsv}>
            Download example csv
            <IconDownload />
          </Button>
        </div>
      </div>

      {error && <div className='text-danger mt-2 text-sm'>{error}</div>}
    </div>
  );
}

export default React.memo(Upload);
