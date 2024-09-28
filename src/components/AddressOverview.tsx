// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp, MultisigAccountData } from '@mimir-wallet/hooks/types';

import dagre from '@dagrejs/dagre';
import { alpha, Chip, Paper, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState
} from 'reactflow';

import AddressCell from './AddressCell';

interface Props {
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

export function getLayoutedElements(nodes: Node[], edges: Edge[], nodeWidth = 330, nodeHeight = 70, direction = 'RL') {
  const isHorizontal = direction === 'LR' || direction === 'RL';

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
}

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
        <AddressCell
          namePost={
            data.type !== 'unknown' ? (
              <>
                <Chip
                  color={data.type === 'multisig' ? 'secondary' : data.type === 'proxy' ? 'default' : 'primary'}
                  label={data.type === 'multisig' ? 'Multisig' : data.type === 'proxy' ? 'Proxy' : 'Origin'}
                  size='small'
                  sx={data.type === 'proxy' ? { bgcolor: alpha('#B700FF', 0.05), color: '#B700FF' } : {}}
                />
                {data.type === 'proxy' && data.proxyType && (
                  <Chip color='secondary' label={`${data.proxyType}:${data.delay || 0}`} size='small' />
                )}
              </>
            ) : null
          }
          value={data.account.address}
          withCopy
        />
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

  function makeEdge(parentId: string, nodeId: string, label: string): Edge {
    return {
      id: `${parentId}->${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#d9d9d9' },
      label
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

  function dfs(node: NodeInfo) {
    const nodeId = node.parentId ? `${node.parentId}_${JSON.stringify(node.value)}` : JSON.stringify(node.value);

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
      edges.push(makeEdge(node.parentId, nodeId, node.from === 'delegate' ? 'Proxy' : 'Member'));
    }

    // traverse the members or delegatees of the current account
    for (const child of node.value.delegatees) {
      dfs({
        from: 'delegate',
        parent: node.value,
        value: child,
        parentId: nodeId
      });
    }

    if (node.value.type === 'multisig') {
      // traverse the member or members of the current account
      for (const child of node.value.members) {
        dfs({
          from: 'member',
          parent: node.value,
          value: child,
          parentId: nodeId
        });
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

function AddressOverview({ account }: Props) {
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
      minZoom={0.1}
      nodeTypes={nodeTypes}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      zoomOnScroll
    >
      <MiniMap pannable zoomable />
      <Controls />
    </ReactFlow>
  );
}

export default React.memo(AddressOverview);
