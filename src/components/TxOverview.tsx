// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, SvgIcon, useTheme } from '@mui/material';
import { addressEq } from '@polkadot/util-crypto';
import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import { ReactComponent as IconSuccess } from '@mimirdev/assets/svg/icon-success-fill.svg';
import { CalldataStatus, type Transaction } from '@mimirdev/hooks/types';
import { getAddressMeta } from '@mimirdev/utils';

import AddressCell from './AddressCell';

interface Props {
  tx?: Transaction;
}

type NodeData = { parent: string | null; members: string[]; address: string; txs: Transaction[] };

const TxNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  const isSuccess = useMemo(() => data.txs.filter((item) => item.status === CalldataStatus.Success).length > 0, [data.txs]);

  return (
    <>
      {data.members.length > 0 && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{
            width: 10,
            height: 10,
            top: 35,
            background: isSuccess ? palette.success.main : palette.grey[300]
          }}
          type='source'
        />
      )}
      <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220, height: 71, padding: 1 }}>
        <AddressCell showType value={data.address} withCopy />
        {isSuccess && <SvgIcon component={IconSuccess} inheritViewBox sx={{ fontSize: '1rem' }} />}
      </Paper>
      {data.parent && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{
            width: 10,
            height: 10,
            background: isSuccess ? palette.success.main : palette.grey[300]
          }}
          type='target'
        />
      )}
    </>
  );
});

const nodeTypes = {
  TxNode
};

function makeNodes(address: string, parent: string | null, txs: Transaction[], deepX = 0, deepY = 0, nodes: Node<NodeData>[] = [], edges: Edge[] = []) {
  const meta = getAddressMeta(address);

  const nodeId = `${address}-${deepX}`;

  nodes.push({
    id: nodeId,
    type: 'TxNode',
    data: { address, parent, members: meta.who || [], txs },
    position: { x: deepX * -300, y: deepY * -90 + 50 }
  });

  if (parent) {
    const parentId = `${parent}-${deepX - 1}`;

    edges.push({
      id: `${parentId}_to_${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#d9d9d9', strokeDasharray: 'none' },
      animated: true
    });
  }

  if (meta.who) {
    const length = meta.who.length;

    meta.who.forEach((_address, index) => {
      const _txs: Transaction[] = [];

      for (const item of txs) {
        for (const tx of meta.isFlexible ? item?.children[0]?.children || [] : item?.children || []) {
          if (addressEq(tx.sender, _address)) {
            _txs.push(tx);
          }
        }
      }

      makeNodes(_address, address, _txs, deepX + 1, deepY + index - Math.floor(length / 2) + (length % 2 === 0 ? 0.5 : 0), nodes, edges);
    });
  }
}

function TxOverview({ tx }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!tx) return;

    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(tx.sender, null, [tx], 0, 0, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [tx, setEdges, setNodes]);

  return (
    <ReactFlow
      edges={edges}
      fitView
      fitViewOptions={{
        maxZoom: 1.5,
        nodes
      }}
      nodeTypes={nodeTypes}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
    />
  );
}

export default React.memo(TxOverview);
