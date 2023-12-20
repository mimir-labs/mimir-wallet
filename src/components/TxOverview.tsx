// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconBack } from '@mimir-wallet/assets/svg/icon-back.svg';
import { ReactComponent as IconFail } from '@mimir-wallet/assets/svg/icon-failed-fill.svg';
import { ReactComponent as IconSuccess } from '@mimir-wallet/assets/svg/icon-success-fill.svg';
import { ReactComponent as IconWaiting } from '@mimir-wallet/assets/svg/icon-waiting-fill.svg';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { getAddressMeta } from '@mimir-wallet/utils';
import { Button, Paper, SvgIcon, useTheme } from '@mui/material';
import { addressEq } from '@polkadot/util-crypto';
import React, { useEffect } from 'react';
import ReactFlow, { Edge, EdgeLabelRenderer, EdgeProps, Handle, Node, NodeProps, Position, StepEdge, useEdgesState, useNodesState } from 'reactflow';

import AddressCell from './AddressCell';

interface Props {
  tx?: Transaction;
}

type NodeData = { parentId: string | null; members: string[]; address: string; tx: Transaction | null };

const TxNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { palette } = useTheme();

  const tx = data.tx;
  const color = tx
    ? tx.status === CalldataStatus.Success
      ? palette.success.main
      : tx.status === CalldataStatus.Cancelled
      ? palette.warning.main
      : tx.status === CalldataStatus.Failed
      ? palette.error.main
      : tx.status === CalldataStatus.Pending
      ? palette.warning.main
      : tx.status === CalldataStatus.Initialized
      ? palette.warning.main
      : palette.grey[300]
    : palette.grey[300];
  const icon = tx ? (
    <SvgIcon
      component={
        tx.status === CalldataStatus.Success
          ? IconSuccess
          : tx.status === CalldataStatus.Cancelled
          ? IconBack
          : tx.status === CalldataStatus.Failed
          ? IconFail
          : tx.status === CalldataStatus.Pending
          ? IconWaiting
          : tx.status === CalldataStatus.Initialized
          ? IconWaiting
          : 'span'
      }
      inheritViewBox
      sx={{ fontSize: '1rem', color }}
    />
  ) : null;

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
            background: color
          }}
          type='source'
        />
      )}
      <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 280, height: 71, padding: 1 }}>
        <AddressCell showType value={data.address} withCopy />
        {icon}
      </Paper>
      {data.parentId && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{
            width: 10,
            height: 10,
            background: color
          }}
          type='target'
        />
      )}
    </>
  );
});

// this is a little helper component to render the actual edge label
function EdgeLabel({ label, transform }: { transform: string; label: string }) {
  return (
    <Button
      className='nodrag nopan'
      size='small'
      sx={{
        width: 'auto',
        minWidth: 0,
        position: 'absolute',
        padding: 0,
        paddingX: 0.5,
        lineHeight: 1,
        fontSize: 12,
        transform
      }}
    >
      {label}
    </Button>
  );
}

function CallEdge({ data, id, source, sourcePosition, sourceX, sourceY, target, targetPosition, targetX, targetY }: EdgeProps) {
  return (
    <>
      <StepEdge
        id={id}
        pathOptions={{
          offset: 0
        }}
        source={source}
        sourcePosition={sourcePosition}
        sourceX={sourceX}
        sourceY={sourceY}
        style={{ strokeDasharray: 'none' }}
        target={target}
        targetPosition={targetPosition}
        targetX={targetX}
        targetY={targetY}
      />
      <EdgeLabelRenderer>
        {data.startLabel && <EdgeLabel label={data.startLabel} transform={`translate(-50%, 0%) translate(${targetX + 10}px,${targetY - 6}px)`} />}
        {data.endLabel && <EdgeLabel label={data.endLabel} transform={`translate(-50%, -100%) translate(${sourceX}px,${sourceY}px)`} />}
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  TxNode
};
const edgeTypes = {
  CallEdge
};

function makeNodes(
  address: string,
  parentId: string | null,
  tx: Transaction | null,
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
    type: 'TxNode',
    data: { address, parentId, members: meta.who || [], tx },
    position: { x: xPos, y: yPos },
    connectable: false
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `${parentId}_to_${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'CallEdge',
      style: { stroke: '#d9d9d9', strokeDasharray: 'none' },
      animated: true,
      data: {}
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
        (meta.isFlexible ? tx?.children[0]?.children : tx?.children)?.find((item) => addressEq(item.sender, _address)) || null,
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

function TxOverview({ tx }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!tx) return;

    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(tx.sender, null, tx, 0, 0, 360, 90, undefined, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [tx, setEdges, setNodes]);

  return (
    <ReactFlow
      edgeTypes={edgeTypes}
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

export default React.memo(TxOverview);
