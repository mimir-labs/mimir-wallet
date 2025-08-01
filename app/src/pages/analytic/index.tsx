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

import { SubApiRoot, useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Link,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs
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
          label: 'Counts',
          data: txDaily?.map((item) => item.counts) || [],
          backgroundColor: '#5F45FF'
        }
      ],
      barPercentage: 0.8, // 控制 bar 的宽度，范围 0-1
      categoryPercentage: 0.9 // 控制 bar 之间的间距，范围 0-1
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
    <Card className='col-span-2'>
      <CardBody className='gap-5 p-3 sm:p-5'>
        <p className='text-medium text-foreground font-bold'>Transaction Statistic</p>
        <Tabs color='primary'>
          <Tab key='category' title='By Category'>
            {upSm ? <div className='bg-secondary rounded-large p-3 sm:p-5'>{categoryChart}</div> : categoryChart}
          </Tab>
          <Tab key='time' title='By Time'>
            {upSm ? <div className='bg-secondary rounded-large p-3 sm:p-5'>{timeChart}</div> : timeChart}
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
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
          <Card className='flex-1'>
            <CardBody className='flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-10 sm:px-12 sm:py-5'>
              <div className='flex flex-grow items-center justify-between'>
                <div className='sm:text-medium text-small text-foreground flex items-center gap-2.5'>
                  <IconSafe className='text-primary' />
                  Multisig Transaction Executed
                </div>
                <b className='text-[24px] leading-[30px] font-extrabold sm:text-[36px] sm:leading-[43px]'>
                  {data?.total}
                </b>
              </div>
            </CardBody>
          </Card>
          <Popover placement='bottom-start'>
            <PopoverTrigger>
              <Button
                radius='md'
                variant='bordered'
                color='default'
                className='border-divider-300 bg-content1 rounded-large h-full w-auto min-w-[160px]'
                startContent={<Avatar src={selectedHistoryNetwork?.icon} className='h-4 w-4 bg-transparent' />}
                endContent={<ArrowDown className='h-4 w-4' />}
              >
                {selectedHistoryNetwork?.name}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='rounded-medium w-[200px] p-1'>
              <Listbox
                disallowEmptySelection
                selectedKeys={[selectedChain]}
                selectionMode={'single'}
                variant='flat'
                onSelectionChange={(keys) => setSelectedChain(Array.from(keys).map((key) => key.toString())[0])}
                color='primary'
              >
                {chains.map((chain) => {
                  const network = networks.find(({ key }) => key === chain);

                  return (
                    <ListboxItem
                      key={chain}
                      className='data-[hover]:bg-secondary data-[hover]:text-foreground data-[selectable=true]:focus:bg-secondary data-[selectable=true]:focus:text-foreground h-8'
                      startContent={<Avatar src={network?.icon} className='h-4 w-4 bg-transparent' />}
                    >
                      {network?.name}
                    </ListboxItem>
                  );
                })}
              </Listbox>
            </PopoverContent>
          </Popover>
        </div>

        <Card className='col-span-2 sm:col-span-1'>
          <CardBody className='gap-5 p-3 sm:p-5'>
            <p className='text-medium text-foreground font-bold'>Transaction Category</p>
            <Table
              removeWrapper
              classNames={{
                th: ['bg-transparent', 'text-tiny', 'text-foreground/50'],
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
          </CardBody>
        </Card>

        <Card className='col-span-2 sm:col-span-1'>
          <CardBody className='gap-5 p-3 sm:p-5'>
            <p className='text-medium text-foreground font-bold'>Recipients</p>
            <Table
              removeWrapper
              classNames={{
                th: ['bg-transparent', 'text-tiny', 'text-foreground/50'],
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
                      <Button
                        as={Link}
                        variant='bordered'
                        color='primary'
                        size='sm'
                        href={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?asset_network=${selectedChain}&to=${item.to}`}
                      >
                        Transfer
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

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
        <Skeleton className='bg-content1 shadow-medium rounded-large col-span-2 h-[80px]' />
        <Skeleton className='bg-content1 shadow-medium rounded-large col-span-1 h-[300px]' />
        <Skeleton className='bg-content1 shadow-medium rounded-large col-span-1 h-[300px]' />
        <Skeleton className='bg-content1 shadow-medium rounded-large col-span-2 h-[500px]' />
      </div>
    );

  if (chains.length === 0 || !address) {
    return <Empty height={200} label='no data here.' />;
  }

  return <Transaction chains={chains} address={address} />;
}

export default Analytic;
