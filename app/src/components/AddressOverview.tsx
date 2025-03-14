// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp, MultisigAccountData } from '@/hooks/types';

import dagre from '@dagrejs/dagre';
import { Paper, useTheme } from '@mui/material';
import { blake2AsHex } from '@polkadot/util-crypto';
import React, { useEffect } from 'react';
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
} from 'reactflow';

import AddressCell from './AddressCell';
import AddressEdge from './AddressEdge';
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

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  return (
    <>
      {(data.account.type === 'multisig' || !!data.account.delegatees.length) && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 0, height: 0, top: 35, background: palette.grey[300] }}
          type='source'
        />
      )}
      <Paper sx={{ display: 'flex', alignItems: 'center', width: 270, padding: 1 }}>
        <AddressCell value={data.account.address} withCopy withAddressBook />
      </Paper>
      {!data.isTop && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ width: 0, height: 0, background: palette.grey[300] }}
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

function makeNodes(topAccount: AccountData, nodes: Node<NodeData>[] = [], edges: Edge[] = []) {
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

  function makeEdge(
    parentId: string,
    nodeId: string,
    label = '',
    delay?: number,
    color = '#d9d9d9',
    labelBgColor = '#fff'
  ): Edge {
    return {
      id: `${parentId}-${label}.${delay || 0}>${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'AddressEdge',
      data: { label, delay, color, labelBgColor }
    };
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
      ? blake2AsHex(
          `${node.parentId}-${node.from === 'delegate' ? `${node.value.proxyDelay}.${node.value.proxyType}.${node.value.proxyNetwork}` : node.from === 'member' ? 'member' : ''}-${node.value.address}`,
          64
        )
      : blake2AsHex(node.value.address, 64);

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
      edges.push(
        makeEdge(
          node.parentId,
          nodeId,
          node.from === 'delegate' ? node.value.proxyType : '',
          node.from === 'delegate' ? node.value.proxyDelay : undefined,
          node.from === 'delegate' ? '#B700FF' : '#AEAEAE',
          node.from === 'delegate' ? '#B700FF' : '#AEAEAE'
        )
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
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!account) return;

    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

    makeNodes(account, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges);

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
      maxZoom={1.5}
      minZoom={0}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      zoomOnScroll
    >
      {showMiniMap && <MiniMap pannable zoomable />}
      {showControls && <Controls />}
    </ReactFlow>
  );
}

export default React.memo(AddressOverview);
