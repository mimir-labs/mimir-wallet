// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';

import { Paper, SvgIcon, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import React, { createContext, useEffect } from 'react';
import ReactFlow, { Controls, Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconWaiting from '@mimir-wallet/assets/svg/icon-waiting-fill.svg?react';
import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';

import AddressCell from '../AddressCell';
import { AddressEdge, getLayoutedElements } from '../AddressOverview';

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

const context = createContext<State>({} as State);

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  const { transaction } = data;

  const color = transaction
    ? transaction.status < TransactionStatus.Success
      ? palette.warning.main
      : transaction.status === TransactionStatus.Success
        ? palette.success.main
        : palette.error.main
    : palette.grey[300];

  const icon = transaction ? (
    <SvgIcon
      component={
        transaction.status < TransactionStatus.Success
          ? IconWaiting
          : transaction.status === TransactionStatus.Success
            ? IconSuccess
            : transaction.status === TransactionStatus.Cancelled
              ? IconCancel
              : IconFail
      }
      inheritViewBox
      sx={{ fontSize: '1rem', color }}
    />
  ) : null;

  return (
    <>
      {!data.isLeaf && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 0, height: 0, background: palette.grey[300] }}
          type='source'
        />
      )}
      <Box>
        <Paper
          sx={{
            width: 220,
            padding: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingX: 1,
            paddingY: 0.3
          }}
        >
          <AddressCell value={data.transaction.address} withCopy withAddressBook />
          {icon}
        </Paper>
      </Box>
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
  AddressEdge
};

function makeNodes(topTransaction: Transaction, nodes: Node<NodeData>[] = [], edges: Edge[] = []) {
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

  function makeEdge(
    parentId: string,
    nodeId: string,
    label: string = '',
    delay?: number,
    color: string = '#d9d9d9',
    labelBgColor: string = '#fff'
  ): Edge {
    return {
      id: `${parentId}->${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'AddressEdge',
      data: { label, delay, color, labelBgColor }
    };
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
      edges.push(
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
          node.parent.type === TransactionType.Proxy
            ? '#B700FF'
            : node.parent.type === TransactionType.Announce
              ? '#B700FF'
              : ''
        )
      );
    }

    for (const child of node.value.children) {
      dfs({ parent: node.value, value: child });
    }
  }

  dfs({ parent: null, value: topTransaction });
}

function TxOverview({ transaction, ...props }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

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
        <Controls />
      </ReactFlow>
    </context.Provider>
  );
}

export default React.memo(TxOverview);
