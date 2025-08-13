// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0
import type { ChartData } from 'chart.js';

import { useAccount } from '@/accounts/useAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconSafe from '@/assets/svg/icon-safe.svg?react';
import { AddressRow, Empty, FormatBalance } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMultiChainStats, useQueryStats } from '@/hooks/useQueryStats';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import { SubApiRoot, useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@mimir-wallet/ui';

const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'top' as const
    },
    title: {
      display: false,
      text: 'Transactions'
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#666',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        stepSize: 1,
        precision: 0,
        color: '#666',
        font: {
          size: 12
        },
        padding: 10
      },
      beginAtZero: true
    }
  }
};

const doughnutOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: false,
      text: 'Transactions'
    }
  }
};

const colors = [
  '#E74C3C',
  '#E67E22',
  '#F1C40F',
  '#2ECC71',
  '#3498DB',
  '#9B59B6',
  '#A0522D',
  '#34495E',
  '#BDC3C7',
  '#D35400'
];

function Chart({
  txDaily,
  callOverview
}: {
  txDaily?: Array<{ time: string; address: string; counts: number }>;
  callOverview?: {
    section: string;
    method: string;
    counts: number;
  }[];
}) {
  const upSm = useMediaQuery('sm');
  const chartData: ChartData<'bar', number[], string> = useMemo(
    () => ({
      labels: txDaily?.map((item) => dayjs(Number(item.time)).format('YYYY-MM-DD')) || [],
      datasets: [
        {
          label: 'Transactions',
          data: txDaily?.map((item) => item.counts) || [],
          backgroundColor: 'rgba(39, 0, 255, 0.8)',
          hoverBackgroundColor: 'rgba(39, 0, 255, 1)',
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 'flex',
          maxBarThickness: 60
        }
      ]
    }),
    [txDaily]
  );
  const categoryChartData: ChartData<'doughnut', number[], string> = useMemo(
    () => ({
      labels: callOverview?.map((item) => `${item.section}.${item.method}`) || [],
      datasets: [{ data: callOverview?.map((item) => item.counts) || [], backgroundColor: colors }],
      hoverOffset: 4
    }),
    [callOverview]
  );

  const timeChart =
    txDaily && txDaily.length > 0 ? (
      <div className='mx-auto h-[40dvh] max-h-full w-full max-w-full sm:h-[600px]'>
        <Bar data={chartData} options={options} />
      </div>
    ) : (
      <Empty label='no transactions' height={200} />
    );

  const categoryChart =
    callOverview && callOverview.length > 0 ? (
      <div className='mx-auto aspect-square h-[600px] max-h-full w-full max-w-full'>
        <Doughnut data={categoryChartData} options={doughnutOptions} />
      </div>
    ) : (
      <Empty label='no transactions' height={200} />
    );

  return (
    <div className='bg-background shadow-medium col-span-2 flex flex-col gap-5 rounded-[20px] p-3 sm:p-5'>
      <p className='text-foreground text-base font-bold'>Transaction Statistic</p>
      <div className='grid grid-cols-1 gap-2.5 lg:grid-cols-2'>
        <div className='col-span-1'>
          {upSm ? <div className='bg-secondary rounded-[20px] p-3 sm:p-5'>{categoryChart}</div> : categoryChart}
        </div>
        <div className='col-span-1'>
          {upSm ? <div className='bg-secondary rounded-[20px] p-3 sm:p-5'>{timeChart}</div> : timeChart}
        </div>
      </div>
    </div>
  );
}

function Transaction({ chains, address }: { chains: string[]; address: string }) {
  const [selectedChain, setSelectedChain] = useState<string>(chains[0]);
  const [data] = useQueryStats(selectedChain, address);
  const { networks } = useNetworks();

  const callOverview = useMemo(
    () =>
      data?.callOverview?.map(({ section, method, counts }, index) => ({
        order: index + 1,
        action: `${section}.${method}`,
        count: counts
      })) || [],
    [data]
  );

  const transferBook = useMemo(
    () => data?.transferBook.map((item, index) => ({ order: index + 1, ...item })) || [],
    [data]
  );

  const selectedHistoryNetwork = useMemo(() => {
    return networks.find(({ key }) => key === selectedChain);
  }, [networks, selectedChain]);

  return (
    <SubApiRoot network={selectedChain}>
      <div className='grid grid-cols-2 gap-2.5 sm:gap-5'>
        <div className='col-span-2 flex gap-5'>
          <div className='bg-background shadow-medium col-span-2 flex w-full flex-col items-stretch justify-between gap-3 rounded-[20px] p-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-10 sm:p-5 sm:px-12 sm:py-5'>
            <div className='flex flex-grow items-center justify-between'>
              <div className='text-foreground flex items-center gap-2.5 text-sm sm:text-base'>
                <IconSafe className='text-primary' />
                Multisig Transaction Executed
              </div>
              <b className='text-[24px] leading-[30px] font-extrabold sm:text-[36px] sm:leading-[43px]'>
                {data?.total}
              </b>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                radius='md'
                variant='bordered'
                className='shadow-medium bg-content1 h-full w-auto min-w-[160px] rounded-[20px] border-transparent text-inherit'
              >
                <Avatar src={selectedHistoryNetwork?.icon} className='h-4 w-4 bg-transparent' />
                {selectedHistoryNetwork?.name}
                <ArrowDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='bottom' align='end' className='w-[200px] border-none p-2'>
              <DropdownMenuRadioGroup value={selectedChain} onValueChange={(value) => setSelectedChain(value)}>
                {chains.map((chain) => {
                  const network = networks.find(({ key }) => key === chain);

                  return (
                    <DropdownMenuRadioItem key={chain} value={chain} className='h-8'>
                      <Avatar src={network?.icon} className='h-4 w-4 bg-transparent' />
                      {network?.name}
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='bg-background shadow-medium col-span-2 flex flex-col gap-5 rounded-[20px] p-3 sm:col-span-1 sm:p-5'>
          <p className='text-foreground text-base font-bold'>Transaction Category</p>
          <Table
            removeWrapper
            classNames={{
              th: ['bg-transparent', 'text-xs', 'text-foreground/50'],
              td: ['text-foreground']
            }}
          >
            <TableHeader>
              <TableColumn>Order</TableColumn>
              <TableColumn>Call</TableColumn>
              <TableColumn>Transaction Count</TableColumn>
            </TableHeader>
            <TableBody items={callOverview} emptyContent={<Empty label='No items' height={150} />}>
              {(item) => (
                <TableRow key={item.order}>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='bg-background shadow-medium col-span-2 flex flex-col gap-5 rounded-[20px] p-3 sm:col-span-1 sm:p-5'>
          <p className='text-foreground text-base font-bold'>Recipients</p>
          <Table
            removeWrapper
            classNames={{
              th: ['bg-transparent', 'text-xs', 'text-foreground/50'],
              td: ['text-foreground']
            }}
          >
            <TableHeader>
              <TableColumn>Order</TableColumn>
              <TableColumn>Address</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn align='end'>Operation</TableColumn>
            </TableHeader>
            <TableBody items={transferBook} emptyContent={<Empty label='No items' height={150} />}>
              {(item) => (
                <TableRow key={item.to}>
                  <TableCell>{item.order}</TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <AddressRow value={item.to} />
                  </TableCell>
                  <TableCell>
                    <FormatBalance value={item.amount} withCurrency />
                  </TableCell>
                  <TableCell align='right'>
                    <Button asChild variant='bordered' color='primary' size='sm'>
                      <Link
                        to={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?asset_network=${selectedChain}&to=${item.to}`}
                      >
                        Transfer
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Chart txDaily={data?.transactionCounts} callOverview={data?.callOverview} />
      </div>
    </SubApiRoot>
  );
}

function Analytic() {
  const { current: address } = useAccount();
  const [stats, isFetched, isFetching] = useMultiChainStats(address);
  const chains = Object.keys(stats);

  if (!isFetched && isFetching)
    return (
      <div className='grid grid-cols-2 gap-2.5 sm:gap-5'>
        <Skeleton className='bg-content1 shadow-medium col-span-2 h-[80px] rounded-[20px]' />
        <Skeleton className='bg-content1 shadow-medium col-span-1 h-[300px] rounded-[20px]' />
        <Skeleton className='bg-content1 shadow-medium col-span-1 h-[300px] rounded-[20px]' />
        <Skeleton className='bg-content1 shadow-medium col-span-2 h-[500px] rounded-[20px]' />
      </div>
    );

  if (chains.length === 0 || !address) {
    return <Empty height={200} label='no data here.' />;
  }

  return <Transaction chains={chains} address={address} />;
}

export default Analytic;
