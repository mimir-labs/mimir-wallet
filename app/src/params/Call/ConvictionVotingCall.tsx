// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { FormatBalance } from '@/components';
import React, { forwardRef, useMemo } from 'react';

import FunctionArgs from './FunctionArgs';
import { mergeClasses } from './utils';

interface VoteInfo {
  pollIndex: string;
  conviction: number;
  balance: string | null;
  voteType: 'Standard' | 'Split' | 'SplitAbstain';
  aye?: string;
  nay?: string;
  abstain?: string;
  vote: 'Aye' | 'Nay' | 'Split' | 'Abstain';
}

const ConvictionVotingCall = forwardRef<HTMLDivElement | null, CallProps>((props, ref) => {
  const { call, className, showFallback, fallbackComponent: FallbackComponent = FunctionArgs } = props;

  const voteInfo = useMemo<VoteInfo | null>(() => {
    try {
      const args = call.args;

      if (args.length < 2) return null;

      const pollIndex = args[0].toString();
      const voteArg = args[1] as any; // Type assertion for Polkadot substrate types

      // Parse vote structure based on Polkadot substrate types
      const voteInfo: VoteInfo = {
        pollIndex,
        conviction: 0,
        balance: null,
        voteType: 'Standard',
        vote: 'Aye'
      };

      if (voteArg.isStandard) {
        const standard = voteArg.asStandard;

        voteInfo.voteType = 'Standard';
        voteInfo.vote = standard.vote.isAye ? 'Aye' : 'Nay';
        voteInfo.conviction = standard.vote.conviction?.toNumber() || 0;
        voteInfo.balance = standard.balance?.toString() || null;
      } else if (voteArg.isSplit) {
        const split = voteArg.asSplit;

        voteInfo.voteType = 'Split';
        voteInfo.vote = 'Split';
        voteInfo.aye = split.aye?.toString() || '0';
        voteInfo.nay = split.nay?.toString() || '0';
      } else if (voteArg.isSplitAbstain) {
        const splitAbstain = voteArg.asSplitAbstain;

        voteInfo.voteType = 'SplitAbstain';
        voteInfo.vote = 'Abstain';
        voteInfo.aye = splitAbstain.aye?.toString() || '0';
        voteInfo.nay = splitAbstain.nay?.toString() || '0';
        voteInfo.abstain = splitAbstain.abstain?.toString() || '0';
      }

      return voteInfo;
    } catch (error) {
      console.error('Failed to parse conviction voting call:', error);

      return null;
    }
  }, [call.args]);

  if (!voteInfo) {
    return showFallback ? <FallbackComponent ref={ref} {...props} /> : null;
  }

  const getConvictionMultiplier = (conviction: number): string => {
    const multipliers = ['0.1X', '1X', '2X', '4X', '8X', '16X', '32X'];

    return multipliers[conviction] || '1X';
  };

  const getVoteColor = (vote: string): string => {
    switch (vote) {
      case 'Aye':
        return 'bg-success';
      case 'Nay':
        return 'bg-danger';
      case 'Split':
        return 'bg-warning';
      case 'Abstain':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderVoteAmount = () => {
    if (voteInfo.voteType === 'Standard' && voteInfo.balance) {
      return <FormatBalance value={voteInfo.balance} withCurrency />;
    }

    if (voteInfo.voteType === 'Split') {
      return (
        <div className='flex flex-col text-sm'>
          <div>
            Aye: <FormatBalance value={voteInfo.aye || '0'} withCurrency />
          </div>
          <div>
            Nay: <FormatBalance value={voteInfo.nay || '0'} withCurrency />
          </div>
        </div>
      );
    }

    if (voteInfo.voteType === 'SplitAbstain') {
      return (
        <div className='flex flex-col text-sm'>
          <div>
            Aye: <FormatBalance value={voteInfo.aye || '0'} withCurrency />
          </div>
          <div>
            Nay: <FormatBalance value={voteInfo.nay || '0'} withCurrency />
          </div>
          <div>
            Abstain: <FormatBalance value={voteInfo.abstain || '0'} withCurrency />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={ref} className={mergeClasses('grid w-full grid-cols-5 items-center gap-4', className)}>
      {/* Vote Icon and Conviction */}
      <div className='relative col-span-1 h-[36px] w-[36px]'>
        {/* Vote Icon - using a simple icon representation */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='36'
          height='36'
          viewBox='0 0 36 36'
          fill='none'
          className='text-primary'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M19 34C28.3889 34 36 26.3889 36 17C36 7.61116 28.3889 0 19 0C9.61116 0 2 7.61116 2 17C2 26.3889 9.61116 34 19 34ZM11.6135 21.0908L15.0783 24.5556H21.0315L27.2954 18.2915C28.2971 17.29 28.7504 16.5941 28.7504 16.0565C28.7504 15.5082 28.3287 14.8441 27.3272 13.8425L23.0896 9.60502L11.6135 21.0908ZM23.6323 7.91257L23.2681 7.54857C20.7485 5.02886 19.125 5.0394 16.5842 7.58019L9.58387 14.5805C7.04311 17.1213 7.03257 18.7448 9.55225 21.2645L12.8433 24.5555H8.45736C8.02512 24.5555 7.66667 24.9141 7.66667 25.3462C7.66667 25.7784 8.02512 26.1369 8.45736 26.1369H29.5426C29.9748 26.1369 30.3333 25.7784 30.3333 25.3462C30.3333 24.9141 29.9748 24.5555 29.5426 24.5555H23.2664L28.4131 19.4091C30.9538 16.8682 30.9644 15.2447 28.4446 12.725L23.664 7.94444C23.6589 7.939 23.6537 7.93362 23.6484 7.92827C23.6431 7.92294 23.6376 7.91771 23.6323 7.91257Z'
            fill='currentColor'
          />
        </svg>
        {/* Conviction multiplier badge */}
        {voteInfo.voteType === 'Standard' && (
          <div className='border-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white'>
            <span className='text-primary text-[10px] leading-none font-black'>
              {getConvictionMultiplier(voteInfo.conviction)}
            </span>
          </div>
        )}
      </div>

      {/* Poll Index */}
      <div className='text-primary col-span-1 text-base font-bold'>#{voteInfo.pollIndex}</div>

      {/* Proposal Title - placeholder as we don't have proposal data */}
      <div className='text-foreground col-span-1 text-center text-base font-bold'>Referendum Vote</div>

      {/* Vote Amount */}
      <div className='text-foreground col-span-1 text-right text-base font-bold'>{renderVoteAmount()}</div>

      {/* Vote Direction Badge */}
      <div className='col-span-1 flex flex-row-reverse'>
        <div className={`rounded-[20px] px-2.5 py-0.5 ${getVoteColor(voteInfo.vote)}`}>
          <span className='text-base font-bold text-white'>{voteInfo.vote}</span>
        </div>
      </div>
    </div>
  );
});

ConvictionVotingCall.displayName = 'ConvictionVotingCall';

export default React.memo(ConvictionVotingCall);
