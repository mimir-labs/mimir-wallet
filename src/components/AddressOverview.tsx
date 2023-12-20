// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { getAddressMeta } from '@mimir-wallet/utils';
import { Paper, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import AddressCell from './AddressCell';

interface Props {
  value?: AccountId | AccountIndex | Address | string | null;
}

type NodeData = { parentId: string | null; members: string[]; address: string };

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  return (
    <>
      {data.members.length > 0 && <Handle isConnectable={isConnectable} position={Position.Left} style={{ width: 0, height: 0, top: 35, background: palette.grey[300] }} type='source' />}
      <Paper sx={{ width: 220, height: 71, padding: 1 }}>
        <AddressCell showType value={data.address} withCopy />
      </Paper>
      {data.parentId && <Handle isConnectable={isConnectable} position={Position.Right} style={{ width: 0, height: 0, background: palette.grey[300] }} type='target' />}
    </>
  );
});

const nodeTypes = {
  AddressNode
};

function makeNodes(
  address: string,
  parentId: string | null,
  xPos: number,
  yPos: number,
  xOffset: number,
  yOffset: number,
  onYChange?: (offset: number) => void,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = []
): void {
  const meta = getAddressMeta(address);

  const nodeId = `${parentId}-${address}`;

  const node: Node<NodeData> = {
    id: nodeId,
    resizing: true,
    type: 'AddressNode',
    data: { address, parentId, members: meta.who || [] },
    position: { x: xPos, y: yPos },
    connectable: false
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `${parentId}_to_${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#d9d9d9' },
      animated: true
    });
  }

  if (meta.who) {
    const nextX = xPos - xOffset;
    const childCount = meta.who.length;

    const startY = yPos - ((childCount - 1) * yOffset) / 2;
    let nextY = startY;

    meta.who.forEach((_address, index) => {
      makeNodes(
        _address,
        nodeId,
        nextX,
        nextY,
        xOffset,
        yOffset,
        (offset: number) => {
          onYChange?.(offset);
          nextY += offset;
        },
        nodes,
        edges
      );

      if (index < childCount - 1) {
        nextY += yOffset * (getAddressMeta(_address).who?.length || 1);
      }
    });

    const oldY = node.position.y;

    node.position.y = (nextY + startY) / 2;
    onYChange?.(node.position.y - oldY);
  }
}

function AddressOverview({ value }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!value) return;

    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(value.toString(), null, 0, 0, 300, 90, undefined, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [value, setEdges, setNodes]);

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
    />
  );
}

export default React.memo(AddressOverview);
