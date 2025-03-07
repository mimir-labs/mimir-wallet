// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

function ToggleSidebar({ style, onClick }: { onClick: () => void; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='14'
      height='18'
      viewBox='0 0 14 18'
      fill='none'
      onClick={onClick}
      style={{ zIndex: 100, cursor: 'pointer', position: 'fixed', top: 0, bottom: 0, margin: 'auto', ...style }}
    >
      <path d='M0 0H5C9.97056 0 14 4.02944 14 9C14 13.9706 9.97056 18 5 18H0V0Z' fill='#2700FF' />
      <path
        opacity='0.9'
        d='M6 5.14258L8.52249 8.38578C8.80335 8.74689 8.80335 9.25255 8.52249 9.61366L6 12.8569'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        opacity='0.9'
        d='M2 5.14258L4.52249 8.38578C4.80335 8.74689 4.80335 9.25255 4.52249 9.61366L2 12.8569'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  );
}

export default ToggleSidebar;
