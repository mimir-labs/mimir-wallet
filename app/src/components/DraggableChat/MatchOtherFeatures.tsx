// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconGlobal from '@/assets/svg/icon-global.svg?react';
// Import icons
import IconQr from '@/assets/svg/icon-qr.svg?react';
import { events } from '@/events';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useQrAddress } from '@/hooks/useQrAddress';
import { useWallet } from '@/wallet/useWallet';
import { isAddress } from '@polkadot/util-crypto';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mimir-wallet/ui';

interface Props {
  eventId: string;
  type: 'qrcode' | 'walletconnect' | 'connectWallet' | 'fund' | 'explorer' | 'watchlist';
  address?: string; // Required for qrcode, explorer, watchlist
}

// Feature type configuration mapping
const featureConfig = {
  qrcode: {
    title: 'Generate QR Code',
    icon: <IconQr className='h-[30px] w-[30px]' />,
    buttonText: 'View',
    requiresAddress: true
  },
  walletconnect: {
    title: 'Wallet Connect',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
        <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72919)' />
        <path
          d='M9.89115 11.3442C12.9884 8.2186 18.0116 8.2186 21.1088 11.3442L21.4813 11.7179C21.6381 11.8744 21.6381 12.1269 21.4813 12.2834L20.2071 13.571C20.1287 13.6467 20.0062 13.6467 19.9278 13.571L19.4132 13.0509C17.252 10.8696 13.748 10.8696 11.5868 13.0509L11.0379 13.6064C10.9595 13.6821 10.837 13.6821 10.7586 13.6064L9.47949 12.3238C9.32267 12.1673 9.32267 11.9148 9.47949 11.7583L9.89115 11.3442ZM23.7454 14.0053L24.8824 15.1515C25.0392 15.308 25.0392 15.5605 24.8824 15.717L19.7612 20.8826C19.6043 21.0391 19.3544 21.0391 19.2025 20.8826L15.5711 17.2167C15.5319 17.1763 15.4681 17.1763 15.4289 17.2167L11.7975 20.8826C11.6407 21.0391 11.3908 21.0391 11.2388 20.8826L6.11762 15.717C5.96079 15.5605 5.96079 15.308 6.11762 15.1515L7.25458 14.0053C7.4114 13.8487 7.66134 13.8487 7.81326 14.0053L11.4447 17.6712C11.4839 17.7115 11.5476 17.7115 11.5868 17.6712L15.2182 14.0053C15.375 13.8487 15.625 13.8487 15.7769 14.0053L19.4083 17.6712C19.4475 17.7115 19.5112 17.7115 19.5504 17.6712L23.1818 14.0053C23.3387 13.8487 23.5886 13.8487 23.7454 14.0053Z'
          fill='white'
        />
        <defs>
          <linearGradient id='paint0_linear_24181_72919' x1='0' y1='15' x2='30' y2='15' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#2700FF' />
            <stop offset='1' stop-color='#0094FF' />
          </linearGradient>
        </defs>
      </svg>
    ),
    buttonText: 'Connect',
    requiresAddress: false
  },
  connectWallet: {
    title: 'Connected Wallets',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
        <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72926)' />
        <path
          d='M20.6 8V10.8L20.6361 10.8005C21.3926 10.8196 22 11.4389 22 12.2V15H18.5C17.7268 15 17.1 15.6268 17.1 16.4C17.1 17.1732 17.7268 17.8 18.5 17.8H22V19.4354C22 20.8518 20.8518 22 19.4354 22H10.5646C9.14821 22 8 20.8518 8 19.4354V10.1C8 8.9402 8.9402 8 10.1 8H20.6ZM18.5743 15.947C18.8158 15.8076 19.1134 15.8076 19.3549 15.947C19.5964 16.0865 19.7451 16.3442 19.7451 16.623C19.7451 16.9019 19.5964 17.1595 19.3549 17.299C19.1134 17.4384 18.8158 17.4384 18.5743 17.299C18.3328 17.1595 18.1841 16.9019 18.1841 16.623C18.1841 16.3442 18.3328 16.0865 18.5743 15.947ZM19.2 9.4H10.1C9.7134 9.4 9.4 9.7134 9.4 10.1C9.4 10.4866 9.7134 10.8 10.1 10.8H19.2V9.4Z'
          fill='white'
        />
        <defs>
          <linearGradient id='paint0_linear_24181_72926' x1='0' y1='15' x2='30' y2='15' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#2700FF' />
            <stop offset='1' stop-color='#0094FF' />
          </linearGradient>
        </defs>
      </svg>
    ),
    buttonText: 'View',
    requiresAddress: false
  },
  fund: {
    title: 'Fund',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30C23.2843 30 30 23.2843 30 15ZM14.5638 7.58348C15.2252 6.92099 15.2252 5.84687 14.5638 5.18437C13.9024 4.52188 12.83 4.52188 12.1686 5.18437L6.86251 10.4991L11.1968 15.9258C11.7811 16.6574 12.847 16.776 13.5774 16.1908C14.3078 15.6055 14.4262 14.5379 13.8419 13.8063L12.6559 12.3214H17.6003C19.4711 12.3214 20.9877 13.8405 20.9877 15.7143C20.9877 17.5881 19.4711 19.1071 17.6003 19.1071H9.13201C8.19663 19.1071 7.43835 19.8667 7.43835 20.8036C7.43835 21.7405 8.19663 22.5 9.13201 22.5H17.6003C21.3419 22.5 24.375 19.4619 24.375 15.7143C24.375 11.9666 21.3419 8.92857 17.6003 8.92857H13.2209L14.5638 7.58348Z'
          fill='url(#paint0_linear_24181_72918)'
        />
        <defs>
          <linearGradient id='paint0_linear_24181_72918' x1='0' y1='15' x2='30' y2='15' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#2700FF' />
            <stop offset='1' stop-color='#0094FF' />
          </linearGradient>
        </defs>
      </svg>
    ),
    buttonText: 'View',
    requiresAddress: false
  },
  explorer: {
    title: 'Blockchain Explorer',
    icon: <IconGlobal className='h-[30px] w-[30px]' />,
    buttonText: 'View',
    requiresAddress: true
  },
  watchlist: {
    title: 'Add New Contact',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
        <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72916)' />
        <path
          d='M15.375 7.75C16.2172 7.75 16.9004 8.43316 16.9004 9.27539V13.8496H21.4746C22.3168 13.8496 23 14.5328 23 15.375C23 16.2172 22.3168 16.9004 21.4746 16.9004H16.9004V21.4746C16.9004 22.3168 16.2172 23 15.375 23C14.5328 23 13.8496 22.3168 13.8496 21.4746V16.9004H9.27539C8.43316 16.9004 7.75 16.2172 7.75 15.375C7.75 14.5328 8.43316 13.8496 9.27539 13.8496H13.8496V9.27539C13.8496 8.43316 14.5328 7.75 15.375 7.75Z'
          fill='white'
        />
        <defs>
          <linearGradient id='paint0_linear_24181_72916' x1='0' y1='15' x2='30' y2='15' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#2700FF' />
            <stop offset='1' stop-color='#0094FF' />
          </linearGradient>
        </defs>
      </svg>
    ),
    buttonText: 'Add',
    requiresAddress: true
  }
};

// Section titles for different feature types
const sectionTitles: Record<Props['type'], string> = {
  qrcode: 'QR Code',
  walletconnect: 'Wallet Connect',
  connectWallet: 'Connected Wallets',
  fund: 'Fund',
  explorer: 'Explorer',
  watchlist: 'Add New Contact'
};

function MatchOtherFeatures({ eventId, type, address }: Props) {
  const config = featureConfig[type];

  // Validate required address for certain types
  const isValidAddress = address ? isAddress(address) : false;
  const hasRequiredAddress = !config.requiresAddress || isValidAddress;

  return (
    <div className='flex w-full flex-col items-start gap-[5px]'>
      {/* Title - dynamically show based on feature type */}
      <div className='text-foreground text-[14px] font-normal'>{sectionTitles[type]}</div>

      {/* Feature item */}
      <FeatureItem
        eventId={eventId}
        type={type}
        address={address}
        config={config}
        hasRequiredAddress={hasRequiredAddress}
      />
    </div>
  );
}

// Individual feature item component
function FeatureItem({
  type,
  address,
  config,
  hasRequiredAddress
}: {
  eventId: string;
  type: Props['type'];
  address?: string;
  config: (typeof featureConfig)[Props['type']];
  hasRequiredAddress: boolean;
}) {
  const { icon: Icon, title, buttonText } = config;

  // Hooks
  const qrAddress = useQrAddress();
  const addressExplorer = useAddressExplorer();
  const { openWallet } = useWallet();
  const { addAddressBook } = useAccount();
  const navigate = useNavigate();

  const handleAction = useCallback(() => {
    switch (type) {
      case 'qrcode':
        if (address) {
          qrAddress.open(address);
        }

        break;

      case 'walletconnect':
        events.emit('walletconnect');
        break;

      case 'connectWallet':
        openWallet();
        break;

      case 'fund':
        navigate('/explorer/mimir://app/transfer');
        break;

      case 'explorer':
        if (address) {
          addressExplorer.open(address);
        }

        break;

      case 'watchlist':
        if (address) {
          addAddressBook(address, true);
        }

        break;

      default:
        throw new Error(`Unsupported feature type: ${type}`);
    }
  }, [type, address, qrAddress, addressExplorer, openWallet, addAddressBook, navigate]);

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        {Icon}
        <div className='text-foreground text-[14px] font-bold'>{title}</div>
      </div>

      {/* Right side: Action button */}
      <Button size='sm' color='secondary' disabled={!hasRequiredAddress} onClick={handleAction}>
        {buttonText}
      </Button>
    </div>
  );
}

export default MatchOtherFeatures;
