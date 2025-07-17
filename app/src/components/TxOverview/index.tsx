// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AccountData,
  DelegateeProp,
  FilterPath,
  FilterPathWithoutId,
  MultisigAccountData,
  Transaction
} from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconFail from '@/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconSuccessOutlined from '@/assets/svg/icon-success-outlined.svg?react';
import IconWaiting from '@/assets/svg/icon-waiting-fill.svg?react';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { filterPathId } from '@/hooks/useFilterPaths';
import { useAccountSource } from '@/wallet/useWallet';
import { blake2AsHex } from '@polkadot/util-crypto';
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
import React, { createContext, useContext, useEffect } from 'react';

import { addressEq, addressToHex } from '@mimir-wallet/polkadot-core';

import AddressCell from '../AddressCell';
import AddressEdge from '../AddressEdge';
import TxButton from '../TxButton';
import { getLayoutedElements } from '../utils';

interface State {
  api: ApiPromise;
  transaction: Transaction;
  onApprove?: () => void;
}

interface Props extends State {
  account: AccountData;
  call?: IMethod | HexString | null;
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

type EdgeData = {
  color: string;
  tips: { label: string; delay?: number }[];
  isDash?: boolean;
};

const context = createContext<State>({} as State);

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<Node<NodeData>>) => {
  const { api, transaction: topTransaction, onApprove } = useContext(context);
  const source = useAccountSource(data.account.address);

  const { call, transaction } = data;

  const Icon = transaction
    ? transaction.status < TransactionStatus.Success
      ? IconWaiting
      : transaction.status === TransactionStatus.Success
        ? IconSuccess
        : transaction.status === TransactionStatus.Cancelled
          ? IconCancel
          : IconFail
    : null;
  const icon = Icon ? (
    <Icon
      data-success={transaction && transaction.status === TransactionStatus.Success}
      data-failed={
        transaction &&
        transaction.status > TransactionStatus.Success &&
        transaction.status !== TransactionStatus.Cancelled
      }
      data-cancelled={transaction && transaction.status === TransactionStatus.Cancelled}
      data-pending={transaction && transaction.status < TransactionStatus.Success}
      className='data-[success=true]:text-success data-[failed=true]:text-danger data-[cancelled=true]:text-danger data-[pending=true]:text-warning h-4 w-4'
    />
  ) : null;
  const borderColor = transaction
    ? transaction.status < TransactionStatus.Success
      ? source
        ? 'hsl(var(--heroui-primary-50))'
        : 'hsl(var(--heroui-divider-300))'
      : transaction.status === TransactionStatus.Success
        ? 'hsl(var(--heroui-success))'
        : transaction.status === TransactionStatus.Cancelled
          ? 'hsl(var(--heroui-danger))'
          : 'hsl(var(--heroui-danger))'
    : source
      ? 'hsl(var(--heroui-primary-50))'
      : 'hsl(var(--heroui-divider-300))';

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
      <div
        className='bg-content1 rounded-medium'
        style={{
          border: '1px solid hsl(var(--heroui-divider-300))',
          borderColor,
          backgroundColor: source ? 'hsl(var(--heroui-secondary))' : undefined,
          boxShadow: source ? 'var(--heroui-box-shadow-small)' : undefined
        }}
      >
        <div className='flex w-[220px] items-center justify-between p-2.5 px-2.5 py-[3px]'>
          <AddressCell value={data.account.address} withCopy />
          {icon}
        </div>
        {topTransaction && data.approvalForThisPath && call && source && (
          <div className='flex'>
            <TxButton
              color='primary'
              fullWidth
              variant='solid'
              radius='md'
              startContent={<IconSuccessOutlined />}
              accountId={topTransaction.address}
              filterPaths={data.path}
              transaction={topTransaction}
              getCall={() => api.createType('Call', topTransaction.call)}
              onDone={onApprove}
            >
              Approve
            </TxButton>
          </div>
        )}
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

function makeNodes(
  topAccount: AccountData,
  topTransaction: Transaction,
  call?: IMethod | HexString | null,
  nodes: Node<NodeData>[] = [],
  edges: Edge<EdgeData>[] = []
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
        address: node.value.address,
        genesisHash: node.value.proxyNetwork
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

    const nodeId = node.parentId
      ? blake2AsHex(`${node.parentId}-[${node.from}]->${addressToHex(node.value.address)}`, 64)
      : blake2AsHex(addressToHex(node.value.address), 64);

    if (!node.parent) {
      nodes.push(createNode(nodeId, node.value, true, path.slice(), approvalForThisPath, transaction));
    } else {
      nodes.push(createNode(nodeId, node.value, false, path.slice(), approvalForThisPath, transaction));
      makeEdge(
        node.parentId,
        nodeId,
        node.from === 'delegate' ? node.value.proxyType : '',
        node.from === 'delegate' ? node.value.proxyDelay : undefined,
        node.from === 'delegate' ? '#B700FF' : '#AEAEAE',
        node.from === 'delegate' && node.value.isRemoteProxy ? true : false
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
                (item) =>
                  ((item.section === 'proxy' && item.method === 'proxy') ||
                    (item.section === 'remoteProxyRelayChain' && item.method === 'remoteProxyWithRegisteredProof')) &&
                  addressEq(item.address, child.address)
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

function TxOverview({ account, call, transaction, api, onApprove }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge<EdgeData>[] = [];

    makeNodes(account, transaction, call, initialNodes, initialEdges);
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 270, 70);

    setNodes(nodes);
    setEdges(edges);
  }, [account, call, setEdges, setNodes, transaction]);

  return (
    <context.Provider value={{ api, transaction, onApprove }}>
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
