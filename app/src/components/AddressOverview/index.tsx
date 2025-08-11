// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, DelegateeProp, MultisigAccountData } from '@/hooks/types';
import type { EdgeData, NodeData, Props } from './context';

import { Controls, type Edge, MiniMap, type Node, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import React, { useEffect, useMemo } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';

import AddressEdge from '../AddressEdge';
import { getLayoutedElements } from '../utils';
import AddressNode from './AddressNode';
import { context } from './context';

// Define node and edge types outside component to prevent recreation
const NODE_TYPES = {
  AddressNode: AddressNode
} as const;

const EDGE_TYPES = {
  AddressEdge
} as const;

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
        isLeaf: true, // Will be updated after traversal based on actual edges
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
    // Use a simpler ID generation for better performance
    const nodeId = node.parentId
      ? `${node.parentId}-${node.from}-${addressToHex(node.value.address)}`
      : addressToHex(node.value.address);

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

  // Update isLeaf based on actual edges
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);

    if (sourceNode) {
      sourceNode.data.isLeaf = false;
    }
  });
}

function AddressOverview({ account, showControls, showMiniMap, showAddressNodeOperations = true }: Props) {
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
    if (!account) return { layoutedNodes: [], layoutedEdges: [] };

    // Performance monitoring in development
    const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge<EdgeData>[] = [];

    makeNodes(account, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 400);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();

      console.log(
        `[AddressOverview] Graph computation took ${(endTime - startTime).toFixed(2)}ms for ${nodes.length} nodes and ${edges.length} edges`
      );
    }

    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [account]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>(layoutedEdges);

  // Update nodes and edges when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <context.Provider value={{ showAddressNodeOperations, account }}>
      <ReactFlow
        edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
        maxZoom={2}
        minZoom={0}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        zoomOnScroll
        // Remove attribution for cleaner UI
        proOptions={{ hideAttribution: true }}
      >
        {showMiniMap && <MiniMap pannable zoomable />}
        {showControls && <Controls showInteractive={false} />}
      </ReactFlow>
    </context.Provider>
  );
}

export default React.memo(AddressOverview);
