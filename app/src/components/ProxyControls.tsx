// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface ProxyControlsProps {
  className?: string;
  proxyType?: string;
  tiny?: boolean;
  variant?: 'controls-only' | 'with-type';
  onSwitch?: () => void;
}

/**
 * Visual component to display proxy relationship controls indicator
 * Used to show the control relationship between proxy and proxied accounts
 */
function ProxyControls({ proxyType, className = '', tiny = false, variant, onSwitch }: ProxyControlsProps) {
  // Auto-detect variant based on proxyType presence
  const effectiveVariant = variant || (proxyType ? 'with-type' : 'controls-only');

  // Controls only style - shows blue CONTROLS badge with arrow
  if (effectiveVariant === 'controls-only') {
    return (
      <div
        className={`group bg-primary relative flex h-[28px] cursor-pointer items-center justify-center rounded-full p-[5px] transition-all ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          onSwitch?.();
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='8'
          height='23'
          viewBox='0 0 8 23'
          className='text-primary-foreground absolute inset-0 m-auto transition-all group-hover:rotate-180'
        >
          <path
            d='M3.64645 21.9536C3.84171 22.1488 4.15829 22.1488 4.35355 21.9536L7.53553 18.7716C7.7308 18.5763 7.7308 18.2597 7.53553 18.0645C7.34027 17.8692 7.02369 17.8692 6.82843 18.0645L4 20.8929L1.17157 18.0645C0.976312 17.8692 0.659729 17.8692 0.464467 18.0645C0.269205 18.2597 0.269205 18.5763 0.464467 18.7716L3.64645 21.9536ZM4 0L3.5 1.74845e-08L3.5 21.6L4 21.6L4.5 21.6L4.5 -1.74845e-08L4 0Z'
            fill='currentColor'
          />
        </svg>
        <span
          style={{
            fontSize: '10px',
            lineHeight: '7px'
          }}
          className='bg-primary text-primary-foreground relative z-10 text-xs uppercase group-hover:hidden'
        >
          Controls
        </span>
        <span
          style={{
            fontSize: '10px',
            lineHeight: '7px'
          }}
          className='bg-primary text-primary-foreground relative z-10 hidden text-xs uppercase group-hover:inline'
        >
          Switch
        </span>
      </div>
    );
  }

  // Two-part style - shows CONTROLS + proxy type
  return tiny ? (
    <div
      className={`bg-primary pointer-events-none relative flex h-[28px] min-w-[28px] items-center justify-center rounded-full p-[5px] ${className}`}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='8'
        height='23'
        viewBox='0 0 8 23'
        className='text-primary-foreground absolute inset-0 m-auto'
      >
        <path
          d='M3.64645 21.9536C3.84171 22.1488 4.15829 22.1488 4.35355 21.9536L7.53553 18.7716C7.7308 18.5763 7.7308 18.2597 7.53553 18.0645C7.34027 17.8692 7.02369 17.8692 6.82843 18.0645L4 20.8929L1.17157 18.0645C0.976312 17.8692 0.659729 17.8692 0.464467 18.0645C0.269205 18.2597 0.269205 18.5763 0.464467 18.7716L3.64645 21.9536ZM4 0L3.5 1.74845e-08L3.5 21.6L4 21.6L4.5 21.6L4.5 -1.74845e-08L4 0Z'
          fill='currentColor'
        />
      </svg>
      <span
        style={{
          fontSize: '10px',
          lineHeight: '7px'
        }}
        className='bg-primary text-primary-foreground relative z-10 text-xs uppercase'
      >
        {proxyType}
      </span>
    </div>
  ) : (
    <div
      className={`bg-primary pointer-events-none relative flex h-[17px] items-center justify-center rounded-full ${className}`}
    >
      <span
        style={{
          fontSize: '10px',
          lineHeight: '7px'
        }}
        className='bg-primary text-primary-foreground relative z-10 px-2.5 text-xs uppercase'
      >
        Controls
      </span>
      <span
        style={{
          fontSize: '10px'
        }}
        className='border-primary bg-content1 text-primary relative z-10 flex h-[17px] items-center justify-center rounded-r-full border-1 border-l-0 px-2.5 uppercase'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='10'
          height='11'
          viewBox='0 0 10 11'
          fill='none'
          className='absolute -left-[5.5px]'
        >
          <path
            d='M9.07031 5.61133C9.46084 6.00185 9.46084 6.63487 9.07031 7.02539L5.88867 10.207C5.52255 10.5731 4.94354 10.5958 4.55078 10.2754L4.47461 10.207L1.29297 7.02539C0.90247 6.63487 0.90247 6.00185 1.29297 5.61133C1.68349 5.22081 2.31651 5.22082 2.70703 5.61133L4.18164 7.08594L4.18164 1.5C4.18164 0.947728 4.62937 0.500021 5.18164 0.5C5.73393 0.5 6.18164 0.947715 6.18164 1.5L6.18164 7.08594L7.65625 5.61133C8.04677 5.22081 8.67979 5.22082 9.07031 5.61133Z'
            fill='white'
            stroke='currentColor'
          />
        </svg>
        {proxyType}
      </span>
    </div>
  );
}

export default ProxyControls;
