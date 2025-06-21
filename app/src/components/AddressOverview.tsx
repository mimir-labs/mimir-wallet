// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp, MultisigAccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconView from '@/assets/svg/icon-view.svg?react';
import dagre from '@dagrejs/dagre';
import { blake2AsHex } from '@polkadot/util-crypto';
import {
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import React, { useEffect } from 'react';

import { addressToHex, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Chip } from '@mimir-wallet/ui';

import Address from './Address';
import AddressCell from './AddressCell';
import AddressEdge from './AddressEdge';
import AddressName from './AddressName';
import CopyAddress from './CopyAddress';
import IdentityIcon from './IdentityIcon';
import { getLayoutedElements } from './utils';

interface Props {
  showControls?: boolean;
  showMiniMap?: boolean;
  account?: AccountData | null;
}

type NodeData = {
  isTop?: boolean;
  isLeaf?: boolean;
  account: AccountData;
  type: 'multisig' | 'proxy' | 'unknown';
  delay?: number;
  proxyType?: string;
};

type EdgeData = {
  color: string;
  tips: { label: string; delay?: number }[];
  isDash?: boolean;
};

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<Node<NodeData>>) => {
  const { meta: { isProxied, isPure, proxyNetworks, pureCreatedAt, isMultisig } = {} } = useAddressMeta(
    data.account.address
  );
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { networks } = useNetworks();

  const addressNetworks = isPure
    ? networks.filter((network) => network.genesisHash === pureCreatedAt)
    : isProxied
      ? proxyNetworks
        ? networks.filter((network) => proxyNetworks.includes(network.genesisHash))
        : []
      : [];

  const cell = data.isTop ? (
    <div className='overflow-hidden relative w-[240px] p-2.5 bg-content1 rounded-medium border-1 border-primary/5 shadow-small'>
      <div className='z-0 absolute top-0 left-0 w-full h-[30px] bg-secondary' />
      <div className='z-10 flex flex-col items-center gap-[5px] w-full h-full'>
        <IdentityIcon value={data.account.address} size={40} />

        <h6>
          <AddressName value={data.account.address} />
        </h6>

        <div className='text-foreground/50 h-[16px] flex items-center text-tiny whitespace-nowrap'>
          {addressNetworks.map((network) => (
            <Avatar key={network.genesisHash} style={{ marginRight: 4 }} src={network.icon} className='w-3 h-3' />
          ))}
          <span>
            <Address shorten value={data.account.address} />
          </span>
          <CopyAddress size='sm' address={data.account.address} className='opacity-50' />

          {!isLocalAccount(data.account.address) && !isLocalAddress(data.account.address) && (
            <Button
              isIconOnly
              color='default'
              onPress={() => {
                addAddressBook(data.account.address);
              }}
              variant='light'
              size='sm'
              className='opacity-50 text-foreground/50 w-[18px] h-[18px]'
            >
              <IconAddressBook className='w-3 h-3' />
            </Button>
          )}

          <Button
            isIconOnly
            variant='light'
            color='default'
            size='sm'
            className='opacity-50 text-foreground/50 w-[18px] h-[18px]'
            onPress={() => {
              window.open(`${window.location.origin}?address=${data.account.address}&tab=structure`, '_blank');
            }}
          >
            <IconView />
          </Button>
        </div>

        <div className='flex items-center'>
          {isMultisig && (
            <Chip color='secondary' size='sm'>
              Multisig
            </Chip>
          )}
          {(isPure || isProxied) && (
            <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
              {isPure ? 'Pure' : 'Proxied'}
            </Chip>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className='overflow-hidden relative w-[240px] p-2.5 bg-content1 rounded-medium border-1 border-primary/5 shadow-small'>
      <AddressCell
        value={data.account.address}
        withAddressBook
        withCopy
        icons={
          <Button
            isIconOnly
            variant='light'
            color='default'
            size='sm'
            className='opacity-50 text-foreground/50 w-[18px] h-[18px]'
            onPress={() => {
              window.open(`${window.location.origin}?address=${data.account.address}&tab=structure`, '_blank');
            }}
          >
            <IconView />
          </Button>
        }
      />
    </div>
  );

  return (
    <>
      {(data.account.type === 'multisig' || !!data.account.delegatees.length) && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{
            zIndex: 1,
            top: 29,
            width: 5,
            height: 18,
            left: 2.5,
            borderRadius: '10px',
            background:
              isPure || isProxied
                ? '#B700FF'
                : isMultisig
                  ? 'hsl(var(--heroui-primary))'
                  : 'hsl(var(--heroui-divider-300))'
          }}
          type='source'
        />
      )}
      {cell}
      {!data.isTop && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{
            zIndex: 1,
            top: 29,
            width: 5,
            height: 18,
            right: 2.5,
            borderRadius: '10px',
            background:
              data.type === 'proxy'
                ? '#B700FF'
                : data.type === 'multisig'
                  ? 'hsl(var(--heroui-primary))'
                  : 'hsl(var(--heroui-divider-300))'
          }}
          type='target'
        />
      )}
    </>
  );
});

const nodeTypes = {
  AddressNode
};

const edgeTypes = {
  AddressEdge: AddressEdge
};

function makeNodes(topAccount: AccountData, nodes: Node<NodeData>[] = [], edges: Edge<EdgeData>[] = []) {
  function createNode(
    id: string,
    account: AccountData,
    isTop: boolean,
    type: 'multisig' | 'proxy' | 'unknown',
    proxyType?: string,
    delay?: number
  ): Node<NodeData> {
    return {
      id,
      resizing: true,
      type: 'AddressNode',
      data: {
        account,
        isTop,
        isLeaf: account.type !== 'multisig' && account.delegatees.length === 0,
        type,
        proxyType,
        delay
      },
      position: { x: 0, y: 0 },
      connectable: false
    };
  }

  function makeEdge(parentId: string, nodeId: string, label = '', delay?: number, color = '#d9d9d9', isDash = false) {
    const id = `${parentId}->${nodeId}`;
    const exists = edges.find((edge) => edge.id === id);

    if (exists) {
      if (label && !exists.data?.tips.some((tip) => tip.label === label && tip.delay === delay)) {
        exists.data?.tips.push({ label, delay });
      }
    } else {
      edges.push({
        id,
        source: parentId,
        target: nodeId,
        type: 'AddressEdge',
        data: { color, tips: label ? [{ label, delay }] : [], isDash }
      });
    }
  }

  type NodeInfo =
    | {
        from: 'delegate';
        parent: AccountData;
        value: AccountData & DelegateeProp;
        parentId: string;
      }
    | {
        from: 'member';
        parent: MultisigAccountData;
        value: AccountData;
        parentId: string;
      }
    | {
        from: 'origin';
        parent: null;
        value: AccountData;
        parentId: string | null;
      };

  function dfs(node: NodeInfo, deep = 0) {
    const nodeId = node.parentId
      ? blake2AsHex(`${node.parentId}-[${node.from}]->${addressToHex(node.value.address)}`, 64)
      : blake2AsHex(addressToHex(node.value.address), 64);

    if (!node.parentId) {
      nodes.push(
        createNode(
          nodeId,
          node.value,
          true,
          node.from === 'delegate' ? 'proxy' : node.from === 'member' ? 'multisig' : 'unknown',
          node.from === 'delegate' ? node.value.proxyType : undefined,
          node.from === 'delegate' ? node.value.proxyDelay : undefined
        )
      );
    } else {
      nodes.push(
        createNode(
          nodeId,
          node.value,
          false,
          node.from === 'delegate' ? 'proxy' : node.from === 'member' ? 'multisig' : 'unknown',
          node.from === 'delegate' ? node.value.proxyType : undefined,
          node.from === 'delegate' ? node.value.proxyDelay : undefined
        )
      );
      makeEdge(
        node.parentId,
        nodeId,
        node.from === 'delegate' ? node.value.proxyType : node.from === 'member' ? 'multisig' : '',
        node.from === 'delegate' ? node.value.proxyDelay : undefined,
        node.from === 'delegate'
          ? '#B700FF'
          : node.from === 'member'
            ? 'hsl(var(--heroui-primary))'
            : 'hsl(var(--heroui-divider-300))',
        node.from === 'delegate' && !!node.value.isRemoteProxy
      );
    }

    // traverse the members or delegatees of the current account
    for (const child of node.value.delegatees) {
      dfs(
        {
          from: 'delegate',
          parent: node.value,
          value: child,
          parentId: nodeId
        },
        deep + 1
      );
    }

    if (node.value.type === 'multisig') {
      // traverse the member or members of the current account
      for (const child of node.value.members) {
        dfs(
          {
            from: 'member',
            parent: node.value,
            value: child,
            parentId: nodeId
          },
          deep + 1
        );
      }
    }
  }

  dfs({
    from: 'origin',
    parent: null,
    value: topAccount,
    parentId: null
  });
}

function AddressOverview({ account, showControls, showMiniMap }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);

  useEffect(() => {
    if (!account) return;

    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge<EdgeData>[] = [];

    makeNodes(account, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 400);

    setNodes(nodes);
    setEdges(edges);
  }, [account, setEdges, setNodes]);

  return (
    <ReactFlow
      edges={edges}
      fitView
      fitViewOptions={{
        maxZoom: 1.5,
        minZoom: 0.1,
        nodes
      }}
      maxZoom={2}
      minZoom={0}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      zoomOnScroll
    >
      {showMiniMap && <MiniMap pannable zoomable />}
      {showControls && <Controls showInteractive={false} />}
    </ReactFlow>
  );
}

export default React.memo(AddressOverview);
