// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Paper, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import { getAddressMeta } from '@mimirdev/utils';

import AddressCell from './AddressCell';

interface Props {
  value?: AccountId | AccountIndex | Address | string | null;
}

type NodeData = { parent: string | null; members: string[]; address: string };

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  return (
    <>
      {data.members.length > 0 && <Handle isConnectable={isConnectable} position={Position.Left} style={{ width: 0, height: 0, top: 35, background: palette.grey[300] }} type='source' />}
      <Paper sx={{ width: 220, height: 71, padding: 1 }}>
        <AddressCell showType value={data.address} withCopy />
      </Paper>
      {data.parent && <Handle isConnectable={isConnectable} position={Position.Right} style={{ width: 0, height: 0, background: palette.grey[300] }} type='target' />}
    </>
  );
});

const nodeTypes = {
  AddressNode
};

function makeNodes(address: string, parent: string | null, deepX = 0, deepY = 0, nodes: Node<NodeData>[] = [], edges: Edge[] = []) {
  const meta = getAddressMeta(address);

  const nodeId = `${address}-${deepX}`;

  nodes.push({
    id: nodeId,
    type: 'AddressNode',
    data: { address, parent, members: meta.who || [] },
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
      makeNodes(_address, address, deepX + 1, deepY + index - Math.floor(length / 2) + (length % 2 === 0 ? 0.5 : 0), nodes, edges);
    });
  }
}

function AddressOverview({ value }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!value) return;

    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(value.toString(), null, 0, 0, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [value, setEdges, setNodes]);

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

export default React.memo(AddressOverview);
