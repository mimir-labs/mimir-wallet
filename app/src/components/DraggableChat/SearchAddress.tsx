// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';

import AddressCell from '../AddressCell';

interface SearchAddressProps {
  eventId: string;
  accounts: string[]; // Array of account addresses
}

// Individual address item component
function AddressItem({ address }: { address: string }) {
  useQueryAccountOmniChain(address);

  return (
    <div className='border-divider-300 w-full rounded-[10px] border p-2.5'>
      <AddressCell value={address} withCopy withAddressBook />
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className='border-divider-300 bg-background flex w-full items-center justify-center rounded-[10px] border p-[10px]'>
      <div className='text-[14px] text-[#949494]'>No addresses found</div>
    </div>
  );
}

// Main SearchAddress component
function SearchAddress({ accounts }: SearchAddressProps) {
  return (
    <div className='flex w-full flex-col items-start gap-[5px]'>
      {/* Title */}
      <div className='text-foreground text-[14px] font-normal'>Searching Address ({accounts.length} found)</div>

      {/* Results list or empty state */}
      {accounts.length > 0 ? (
        accounts.map((address, index) => <AddressItem key={`${address}-${index}`} address={address} />)
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default SearchAddress;
