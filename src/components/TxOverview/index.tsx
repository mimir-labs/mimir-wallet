// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type {
  AccountData,
  DelegateeProp,
  FilterPath,
  FilterPathWithoutId,
  MultisigAccountData,
  Transaction
} from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import { Paper, SvgIcon, useTheme } from '@mui/material';
import { alpha, Box } from '@mui/system';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import ReactFlow, { Controls, Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconSuccessOutlined from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import IconWaiting from '@mimir-wallet/assets/svg/icon-waiting-fill.svg?react';
import { filterPathId, useWallet } from '@mimir-wallet/hooks';
import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';

import AddressCell from '../AddressCell';
import { AddressEdge, getLayoutedElements } from '../AddressOverview';

interface State {
  onApprove?: (call: IMethod | HexString, path: FilterPath[]) => void;
}

interface Props extends State {
  account?: AccountData | null;
  call?: IMethod | HexString | null;
  transaction?: Transaction;
}

type NodeData = {
  isTop?: boolean;
  isLeaf?: boolean;
  topAccount: AccountData;
  account: AccountData;
  transaction?: Transaction | null;
  call?: IMethod | HexString | null;
  path: FilterPath[];
  approvalForThisPath: boolean;
};

const context = createContext<State>({} as State);

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { accountSource } = useWallet();
  const { palette } = useTheme();
  const { onApprove } = useContext(context);

  const source = useMemo(() => accountSource(data.account.address), [accountSource, data.account.address]);

  const { call, transaction } = data;

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
      {(data.account.type === 'multisig' || !!data.account.delegatees.length) && (
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
            paddingY: 0.3,
            borderBottomLeftRadius: data.approvalForThisPath && call && source ? 0 : undefined,
            borderBottomRightRadius: data.approvalForThisPath && call && source ? 0 : undefined
          }}
        >
          <AddressCell value={data.account.address} withCopy />
          {icon}
        </Paper>
        {data.approvalForThisPath && call && source && (
          <Box sx={{ display: 'flex' }}>
            <LoadingButton
              color='success'
              fullWidth
              startIcon={<SvgIcon component={IconSuccessOutlined} inheritViewBox />}
              sx={({ palette }) => ({ borderRadius: 0, bgcolor: alpha(palette.success.main, 0.1) })}
              variant='text'
              onClick={() => onApprove?.(call, data.path)}
            >
              Approve
            </LoadingButton>
          </Box>
        )}
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

function makeNodes(
  topAccount: AccountData,
  call?: IMethod | HexString | null,
  topTransaction?: Transaction | null,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = []
) {
  function createNode(
    id: string,
    account: AccountData,
    isTop: boolean,
    path: FilterPath[],
    approvalForThisPath: boolean,
    transaction?: Transaction | null
  ): Node<NodeData> {
    return {
      id,
      resizing: true,
      type: 'AddressNode',
      data: {
        topAccount,
        account,
        isTop,
        isLeaf: account.type !== 'multisig' && account.delegatees.length === 0,
        call,
        path,
        approvalForThisPath,
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

  type NodeInfo =
    | {
        from: 'delegate';
        parent: AccountData;
        value: AccountData & DelegateeProp;
        parentId: string;
        approvalForThisPath: boolean;
      }
    | {
        from: 'member';
        parent: MultisigAccountData;
        value: AccountData;
        parentId: string;
        approvalForThisPath: boolean;
      }
    | {
        from: 'origin';
        parent: null;
        value: AccountData;
        parentId: string | null;
        approvalForThisPath: boolean;
      };

  function dfs(deep: number, node: NodeInfo, path: FilterPath[], transaction?: Transaction | null) {
    if (node.from === 'delegate') {
      const p: FilterPathWithoutId = {
        type: 'proxy',
        real: node.parent.address,
        proxyType: node.value.proxyType,
        delay: node.value.proxyDelay,
        address: node.value.address
      } as FilterPath;

      path.push({
        id: filterPathId(deep, p),
        ...p
      });
    } else if (node.from === 'member') {
      const p: FilterPathWithoutId = {
        type: 'multisig',
        multisig: node.parent.address,
        threshold: node.parent.threshold,
        otherSignatures: node.parent.members
          .filter((item) => !addressEq(item.address, node.value.address))
          .map((item) => item.address),
        address: node.value.address
      };

      path.push({
        id: filterPathId(deep, p),
        ...p
      });
    } else {
      const p: FilterPathWithoutId = { type: 'origin', address: node.value.address };

      path.push({ id: filterPathId(deep, p), ...p });
    }

    const approvalForThisPath: boolean =
      node.approvalForThisPath &&
      (!transaction ||
        (transaction.type === TransactionType.Proxy
          ? transaction.status !== TransactionStatus.Success
          : transaction.status === TransactionStatus.Pending));

    const nodeId = node.parentId ? `${node.parentId}_${JSON.stringify(node.value)}` : JSON.stringify(node.value);

    if (!node.parent) {
      nodes.push(createNode(nodeId, node.value, true, path.slice(), approvalForThisPath, transaction));
    } else {
      nodes.push(createNode(nodeId, node.value, false, path.slice(), approvalForThisPath, transaction));
      edges.push(
        makeEdge(
          node.parentId,
          nodeId,
          node.from === 'delegate' ? node.value.proxyType : '',
          node.from === 'delegate' ? node.value.proxyDelay : undefined,
          node.from === 'delegate' ? '#B700FF' : '#AEAEAE',
          node.from === 'delegate' ? '#B700FF' : '#AEAEAE'
        )
      );
    }

    // traverse the members or delegatees of the current account
    for (const child of node.value.delegatees) {
      if (transaction) {
        if (transaction.type === TransactionType.Announce) {
          if (addressEq(transaction.delegate, child.address)) {
            dfs(
              deep + 1,
              {
                from: 'delegate',
                parent: node.value,
                value: child,
                parentId: nodeId,
                approvalForThisPath
              },
              path,
              transaction.children.find(
                (item) =>
                  item.section === 'proxy' &&
                  (item.method === 'proxyAnnounced' || item.method === 'announce') &&
                  addressEq(item.address, child.address)
              )
            );
          }
        }

        if (transaction.type === TransactionType.Proxy) {
          if (addressEq(transaction.delegate, child.address)) {
            dfs(
              deep + 1,
              {
                from: 'delegate',
                parent: node.value,
                value: child,
                parentId: nodeId,
                approvalForThisPath
              },
              path,
              transaction.children.find(
                (item) => item.section === 'proxy' && item.method === 'proxy' && addressEq(item.address, child.address)
              )
            );
          }
        }
      } else {
        dfs(
          deep + 1,
          {
            from: 'delegate',
            parent: node.value,
            value: child,
            parentId: nodeId,
            approvalForThisPath
          },
          path,
          null
        );
      }
    }

    if (node.value.type === 'multisig' && (!transaction || transaction.type === TransactionType.Multisig)) {
      // traverse the member or members of the current account
      for (const child of node.value.members) {
        dfs(
          deep + 1,
          {
            from: 'member',
            parent: node.value,
            value: child,
            parentId: nodeId,
            approvalForThisPath
          },
          path,
          transaction?.children.find(
            (item) =>
              item.section === 'multisig' &&
              (item.method === 'asMulti' || item.method === 'approveAsMulti' || item.method === 'asMultiThreshold1') &&
              addressEq(item.address, child.address)
          )
        );
      }
    }

    path.pop();
  }

  dfs(
    0,
    {
      from: 'origin',
      parent: null,
      value: topAccount,
      parentId: null,
      approvalForThisPath:
        !topTransaction ||
        (topTransaction.type === TransactionType.Proxy
          ? topTransaction.status !== TransactionStatus.Success
          : topTransaction.status === TransactionStatus.Pending)
    },
    [],
    topTransaction
  );
}

function TxOverview({ account, call, transaction, ...props }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!account) return;

    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

    makeNodes(account, call, transaction, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 270, 70);

    setNodes(nodes);
    setEdges(edges);
  }, [account, call, setEdges, setNodes, transaction]);

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
