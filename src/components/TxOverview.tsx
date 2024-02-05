// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { ReactComponent as IconCancel } from '@mimir-wallet/assets/svg/icon-cancel.svg';
import { ReactComponent as IconFail } from '@mimir-wallet/assets/svg/icon-failed-fill.svg';
import { ReactComponent as IconFailOutlined } from '@mimir-wallet/assets/svg/icon-failed-outlined.svg';
import { ReactComponent as IconSuccess } from '@mimir-wallet/assets/svg/icon-success-fill.svg';
import { ReactComponent as IconSuccessOutlined } from '@mimir-wallet/assets/svg/icon-success-outlined.svg';
import { ReactComponent as IconWaiting } from '@mimir-wallet/assets/svg/icon-waiting-fill.svg';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { getAddressMeta } from '@mimir-wallet/utils';
import { LoadingButton } from '@mui/lab';
import { alpha, Box, Button, Paper, SvgIcon, useTheme } from '@mui/material';
import { addressEq } from '@polkadot/util-crypto';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Edge, EdgeLabelRenderer, EdgeProps, Handle, Node, NodeProps, Position, StepEdge, useEdgesState, useNodesState } from 'reactflow';

import AddressCell from './AddressCell';

interface Props {
  tx?: Transaction;
  approveFiltered?: Filtered;
  cancelFiltered?: Filtered;
}

type NodeData = {
  parentId: string | null;
  members: string[];
  address: string;
  sourceTx: Transaction;
  tx: Transaction | null;
  isMultisig?: boolean;
  approveFiltered?: Filtered;
  cancelFiltered?: Filtered;
};

const TxNode = React.memo(({ data, id, isConnectable }: NodeProps<NodeData>) => {
  const { address, approveFiltered, cancelFiltered, isMultisig, members, parentId, sourceTx } = data;
  const { api } = useApi();
  const { palette } = useTheme();
  const { addQueue } = useTxQueue();
  const [approveLoading, setApproveLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const destTx = sourceTx.top;

  const [accounts, canApprove, cancelAccounts, canCancel] = useMemo(() => {
    if (isMultisig) {
      return [{}, false, {}, false];
    }

    const _accounts: Record<string, string | undefined> = {};
    const _cancelAccounts: Record<string, string | undefined> = {};

    let lastAddress: string;
    let canApprove = true;
    let canCancel = true;

    let _approveFiltered = approveFiltered;
    let _cancelFiltered = cancelFiltered;

    id.split('-').forEach((address) => {
      if (address === 'null') {
        return;
      }

      if (lastAddress) {
        if (!_approveFiltered?.[address]) {
          canApprove = false;
        }

        if (!_cancelFiltered?.[address]) {
          canCancel = false;
        }

        _approveFiltered = _approveFiltered?.[address];
        _cancelFiltered = _cancelFiltered?.[address];

        _accounts[lastAddress] = address;
        _cancelAccounts[lastAddress] = address;
      }

      lastAddress = address;
    });

    return [_accounts, canApprove, _cancelAccounts, canCancel];
  }, [approveFiltered, cancelFiltered, id, isMultisig]);

  const handleApprove = useCallback(
    (filtered: Filtered) => {
      setApproveLoading(true);
      addQueue({
        filtered,
        accounts,
        extrinsic: api.tx[sourceTx.call.section][sourceTx.call.method](...sourceTx.call.args),
        destCall: destTx.call,
        destSender: destTx.sender,
        accountId: sourceTx.sender,
        isApprove: true,
        transaction: destTx,
        onFinalized: () => setApproveLoading(false),
        onError: () => setApproveLoading(false),
        onReject: () => setApproveLoading(false)
      });
    },
    [addQueue, api.tx, accounts, destTx, sourceTx]
  );

  const handleCancel = useCallback(
    (filtered: Filtered) => {
      setCancelLoading(true);
      addQueue({
        filtered,
        accounts: cancelAccounts,
        extrinsic: api.tx[sourceTx.call.section][sourceTx.call.method](...sourceTx.call.args),
        destCall: destTx.call,
        destSender: destTx.sender,
        accountId: sourceTx.sender,
        isCancelled: true,
        transaction: destTx,
        onFinalized: () => setCancelLoading(false),
        onError: () => setCancelLoading(false),
        onReject: () => setCancelLoading(false)
      });
    },
    [addQueue, api.tx, cancelAccounts, destTx, sourceTx]
  );

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
          ? IconCancel
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
      {members.length > 0 && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Left}
          style={{
            width: 10,
            height: 10,
            top: 30,
            background: color
          }}
          type='source'
        />
      )}
      <Paper sx={{ width: 280, overflow: 'hidden' }}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingX: 1, paddingY: 0.3 }}>
          <AddressCell showType size='small' value={address} withCopy />
          {icon}
        </Box>
        <Box sx={{ display: 'flex' }}>
          {canCancel && cancelFiltered && (
            <LoadingButton
              color='error'
              fullWidth
              loading={cancelLoading}
              onClick={() => handleCancel(cancelFiltered)}
              startIcon={<SvgIcon component={IconFailOutlined} inheritViewBox />}
              sx={({ palette }) => ({ borderRadius: 0, bgcolor: alpha(palette.error.main, 0.1) })}
              variant='text'
            >
              Cancel
            </LoadingButton>
          )}
          {canApprove && approveFiltered && (
            <LoadingButton
              color='success'
              fullWidth
              loading={approveLoading}
              onClick={() => handleApprove(approveFiltered)}
              startIcon={<SvgIcon component={IconSuccessOutlined} inheritViewBox />}
              sx={({ palette }) => ({ borderRadius: 0, bgcolor: alpha(palette.success.main, 0.1) })}
              variant='text'
            >
              Approve
            </LoadingButton>
          )}
        </Box>
      </Paper>
      {parentId && (
        <Handle
          isConnectable={isConnectable}
          position={Position.Right}
          style={{
            width: 10,
            height: 10,
            top: 30,
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
  sourceTx: Transaction,
  tx: Transaction | null,
  xPos: number,
  yPos: number,
  xOffset: number,
  yOffset: number,
  approveFiltered?: Filtered,
  cancelFiltered?: Filtered,
  onYChange?: (offset: number) => void,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = []
): void {
  const meta = getAddressMeta(address);

  const nodeId = `${parentId}-${address}`;

  const node: Node<NodeData> = {
    id: nodeId,
    type: 'TxNode',
    data: { approveFiltered, cancelFiltered, address, parentId, members: meta.who || [], sourceTx, tx, isMultisig: meta.isMultisig },
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
        sourceTx,
        (meta.isFlexible ? tx?.children[0]?.children : tx?.children)?.find((item) => addressEq(item.sender, _address)) || null,
        nextX,
        nextY,
        xOffset,
        yOffset,
        approveFiltered,
        cancelFiltered,
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

function TxOverview({ approveFiltered, cancelFiltered, tx }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!tx) return;

    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(tx.sender, null, tx, tx, 0, 0, 360, 110, approveFiltered, cancelFiltered, undefined, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [tx, setEdges, setNodes, approveFiltered, cancelFiltered]);

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
