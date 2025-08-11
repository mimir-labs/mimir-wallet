// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconFail from '@/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconWaiting from '@/assets/svg/icon-waiting-fill.svg?react';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import {
  Controls,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import React, { createContext, useEffect, useMemo } from 'react';

import AddressCell from '../AddressCell';
import AddressEdge from '../AddressEdge';
import { getLayoutedElements } from '../utils';

interface Props {
  transaction: Transaction;
}

type NodeData = {
  isTop?: boolean;
  isLeaf?: boolean;
  transaction: Transaction;
};

type EdgeData = {
  color: string;
  tips: { label: string; delay?: number }[];
  isDash?: boolean;
};

const context = createContext({});

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<Node<NodeData>>) => {
  const { transaction } = data;

  const icon =
    transaction.status < TransactionStatus.Success ? (
      <IconWaiting className='text-warning h-4 w-4' />
    ) : transaction.status === TransactionStatus.Success ? (
      <IconSuccess className='text-success h-4 w-4' />
    ) : transaction.status === TransactionStatus.Cancelled ? (
      <IconCancel className='text-danger h-4 w-4' />
    ) : (
      <IconFail className='text-danger h-4 w-4' />
    );

  return (
    <>
      {!data.isLeaf && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ zIndex: 1, top: 22, left: 0, width: 0, height: 0 }}
          className='bg-divider-300'
          type='source'
        />
      )}
      <div>
        <div className='bg-content1 border-divider-300 flex w-[220px] items-center justify-between rounded-[10px] border-1 px-2.5 py-[3px]'>
          <AddressCell value={data.transaction.address} withCopy withAddressBook />
          {icon}
        </div>
      </div>
      {!data.isTop && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ zIndex: 1, top: 22, right: 0, width: 0, height: 0 }}
          className='bg-divider-300'
          type='target'
        />
      )}
    </>
  );
});

// Define node and edge types outside component to prevent recreation
const NODE_TYPES = {
  AddressNode
} as const;

const EDGE_TYPES = {
  AddressEdge
} as const;

function makeNodes(topTransaction: Transaction, nodes: Node<NodeData>[] = [], edges: Edge<EdgeData>[] = []) {
  function createNode(id: string, transaction: Transaction, isTop: boolean): Node<NodeData> {
    return {
      id,
      resizing: true,
      type: 'AddressNode',
      data: {
        isTop,
        isLeaf: true, // Will be updated after traversal based on actual edges
        transaction
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

  type NodeType = {
    parent: Transaction | null;
    value: Transaction;
  };

  function dfs(node: NodeType) {
    const nodeId = node.value.id.toString();

    if (!node.parent) {
      nodes.push(createNode(nodeId, node.value, true));
    } else {
      nodes.push(createNode(nodeId, node.value, false));
      makeEdge(
        node.parent.id.toString(),
        nodeId,
        node.parent.type === TransactionType.Proxy
          ? 'Proxy'
          : node.parent.type === TransactionType.Announce
            ? 'Announce'
            : '',
        undefined,
        node.parent.type === TransactionType.Proxy
          ? '#B700FF'
          : node.parent.type === TransactionType.Announce
            ? '#B700FF'
            : '',
        node.parent.type === TransactionType.Proxy && node.parent.isRemoteProxy ? true : false
      );
    }

    for (const child of node.value.children) {
      dfs({ parent: node.value, value: child });
    }
  }

  dfs({ parent: null, value: topTransaction });

  // Update isLeaf based on actual edges
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);

    if (sourceNode) {
      sourceNode.data.isLeaf = false;
    }
  });
}

function HistoryTxOverview({ transaction, ...props }: Props) {
  // Memoize the context value
  const contextValue = useMemo(() => props, [props]);

  // Memoize fitView options
  const fitViewOptions = useMemo(
    () => ({
      maxZoom: 1.5,
      minZoom: 0.1
    }),
    []
  );

  // Memoize the graph computation with performance monitoring
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    // Performance monitoring in development
    const startTime = import.meta.env.DEV ? performance.now() : 0;

    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge<EdgeData>[] = [];

    makeNodes(transaction, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 330, 70);

    // Log performance in development
    if (import.meta.env.DEV) {
      const endTime = performance.now();

      console.log(
        `[HistoryTxOverview] Graph computation took ${(endTime - startTime).toFixed(2)}ms for ${nodes.length} nodes and ${edges.length} edges`
      );
    }

    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [transaction]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>(layoutedEdges);

  // Update nodes and edges when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <context.Provider value={contextValue}>
      <ReactFlow
        edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
        maxZoom={1.5}
        minZoom={0.1}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        zoomOnScroll
        // Remove attribution for cleaner UI
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </context.Provider>
  );
}

export default React.memo(HistoryTxOverview);
