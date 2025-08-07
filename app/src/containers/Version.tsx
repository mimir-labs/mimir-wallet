// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

function Version() {
  return (
    <div className='z-0 flex items-center gap-5'>
      <span>Version: {import.meta.env.VERSION}</span>
      <a
        className='text-primary'
        href='https://github.com/mimir-labs/mimir-wallet'
        target='_blank'
        rel='noopener noreferrer'
      >
        Github
      </a>
      <a className='text-primary' href='https://t.me/+t7vZ1kXV5h1kNGQ9' target='_blank' rel='noopener noreferrer'>
        Report Bug
      </a>
      <a className='text-primary' href='https://docs.mimir.global' target='_blank' rel='noopener noreferrer'>
        Docs
      </a>
    </div>
  );
}

export default Version;
