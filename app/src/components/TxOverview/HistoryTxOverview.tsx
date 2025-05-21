// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

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
import React, { createContext, useEffect } from 'react';

import AddressCell from '../AddressCell';
import AddressEdge from '../AddressEdge';
import { getLayoutedElements } from '../utils';

interface State {
  onApprove?: (call: IMethod | HexString, path: FilterPath[]) => void;
}

interface Props extends State {
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
};

const context = createContext<State>({} as State);

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<Node<NodeData>>) => {
  const { transaction } = data;

  const icon =
    transaction.status < TransactionStatus.Success ? (
      <IconWaiting className='text-warning w-4 h-4' />
    ) : transaction.status === TransactionStatus.Success ? (
      <IconSuccess className='text-success w-4 h-4' />
    ) : transaction.status === TransactionStatus.Cancelled ? (
      <IconCancel className='text-danger w-4 h-4' />
    ) : (
      <IconFail className='text-danger w-4 h-4' />
    );

  return (
    <>
      {!data.isLeaf && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 0, height: 0 }}
          className='bg-divider-300'
          type='source'
        />
      )}
      <div>
        <div className='w-[220px] flex items-center justify-between px-2.5 py-[3px] bg-content1 rounded-medium border-1 border-divider-300'>
          <AddressCell value={data.transaction.address} withCopy withAddressBook />
          {icon}
        </div>
      </div>
      {!data.isTop && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ width: 0, height: 0 }}
          className='bg-divider-300'
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
  AddressEdge
};

function makeNodes(topTransaction: Transaction, nodes: Node<NodeData>[] = [], edges: Edge<EdgeData>[] = []) {
  function createNode(id: string, transaction: Transaction, isTop: boolean): Node<NodeData> {
    return {
      id,
      resizing: true,
      type: 'AddressNode',
      data: {
        isTop,
        isLeaf: transaction.children.length === 0,
        transaction
      },
      position: { x: 0, y: 0 },
      connectable: false
    };
  }

  function makeEdge(parentId: string, nodeId: string, label = '', delay?: number, color = '#d9d9d9') {
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
        data: { color, tips: label ? [{ label, delay }] : [] }
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
            : ''
      );
    }

    for (const child of node.value.children) {
      dfs({ parent: node.value, value: child });
    }
  }

  dfs({ parent: null, value: topTransaction });
}

function TxOverview({ transaction, ...props }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge<EdgeData>[] = [];

    makeNodes(transaction, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 270, 70);

    setNodes(nodes);
    setEdges(edges);
  }, [setEdges, setNodes, transaction]);

  return (
    <context.Provider value={props}>
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
        edgeTypes={edgeTypes}
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        zoomOnScroll
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </context.Provider>
  );
}

export default React.memo(TxOverview);
