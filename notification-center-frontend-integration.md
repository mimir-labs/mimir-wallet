# 通知中心前端集成文档

## 概述

通知中心提供实时的区块链交易通知功能，支持 WebSocket 实时推送和 REST API 查询。本文档详细说明了前端如何集成通知中心的所有功能。

## 核心功能

- 通过 WebSocket 实时接收交易通知
- 支持游标分页的历史通知查询
- 多账户通知批量查询
- 区块链重组时自动清理通知
- 三种通知类型：交易创建、交易批准、交易执行

## REST API 接口

### 1. 查询单个地址的通知

获取指定区块链地址的通知列表，支持过滤和分页。

**接口地址：** `GET /api/notification/:address`

**路径参数：**
- `address`：区块链地址（以 0x 开头的十六进制字符串）

**查询参数：**
| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|--------|
| cursor | number | 否 | 分页游标（通知ID） | - |
| limit | number | 否 | 返回数量 | 20 |
| type | string | 否 | 通知类型过滤 | - |
| startDate | string | 否 | 开始时间（ISO 8601格式） | - |
| endDate | string | 否 | 结束时间（ISO 8601格式） | - |
| genesisHash | string | 否 | 链的创世哈希 | - |

**通知类型（type）可选值：**
- `transaction_created` - 交易创建
- `transaction_approved` - 交易批准
- `transaction_executed` - 交易执行

**响应格式：**
```typescript
interface NotificationResponse {
  notifications: Array<{
    id: number;                    // 通知ID
    notificationType: string;       // 通知类型
    transactionId: number;          // 交易ID
    address: string;                // 关联地址
    signer: string;                 // 签名者地址
    triggerAddress: string;         // 触发地址
    section?: string;               // 模块名称
    method?: string;                // 方法名称
    status: 'pending' | 'success' | 'failed';  // 通知状态
    genesisHash: string;            // 链的创世哈希
    metadata?: Record<string, any>; // 元数据
    createdAt: string;              // 创建时间
    updatedAt: string;              // 更新时间
  }>;
  nextCursor?: number;              // 下一页游标
}
```

**请求示例：**
```bash
GET /api/notification/0x1234567890abcdef?limit=50&type=transaction_executed
```

**响应示例：**
```json
{
  "notifications": [
    {
      "id": 123,
      "notificationType": "transaction_executed",
      "transactionId": 456,
      "address": "0x1234567890abcdef",
      "signer": "0xabcdef1234567890",
      "triggerAddress": "0x9876543210fedcba",
      "section": "balances",
      "method": "transfer",
      "status": "success",
      "genesisHash": "0x91b171bb158e2d3848fa23a9f1c25182...",
      "metadata": {
        "type": "proxy",
        "originalStatus": 3
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:31:00Z"
    }
  ],
  "nextCursor": 122
}
```

### 2. 批量查询多个地址的通知

同时查询多个地址的通知，适用于钱包应用管理多个账户的场景。

**接口地址：** `POST /api/notification/batch`

**请求体：**
```typescript
interface BatchQueryRequest {
  addresses: string[];  // 地址数组
  cursor?: number;      // 分页游标
  limit?: number;       // 返回数量（默认20，最大100）
  type?: string;        // 通知类型过滤
  startDate?: string;   // 开始时间
  endDate?: string;     // 结束时间
  genesisHash?: string; // 链的创世哈希
}
```

**响应格式：** 与单地址查询相同

**请求示例：**
```json
{
  "addresses": [
    "0x1234567890abcdef",
    "0xfedcba0987654321"
  ],
  "limit": 30,
  "type": "transaction_created"
}
```

## WebSocket 集成

### 连接配置

**WebSocket 地址：** `ws://your-server/notification-push`

**传输协议：** 仅支持 WebSocket（不支持轮询）

### Socket.IO 客户端配置

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('ws://your-server', {
  path: '/notification-push',
  transports: ['websocket'],  // 仅使用 WebSocket
  reconnection: true,          // 自动重连
  reconnectionDelay: 1000,     // 重连延迟
  reconnectionAttempts: 5      // 重连尝试次数
});

// 连接事件
socket.on('connect', () => {
  console.log('已连接到通知服务');
});

// 断开连接事件
socket.on('disconnect', () => {
  console.log('已断开连接');
});

// 错误处理
socket.on('error', (error) => {
  console.error('WebSocket 错误:', error);
});
```

### 订阅通知

```typescript
interface SubscriptionData {
  address: string;              // 要监听的区块链地址
  lastNotificationId?: number;   // 可选：获取此ID之后的通知
}

// 订阅地址通知
const subscriptionData: SubscriptionData = {
  address: '0x1234567890abcdef',
  lastNotificationId: 456  // 可选：不传则返回最近100条
};

socket.emit('subscribe', subscriptionData);

// 监听初始通知（历史数据）
socket.on('initial-notifications', (data: InitialNotificationsResponse) => {
  console.log('收到历史通知:', data);
  // data.notifications: 历史通知数组
  // data.hasMore: 是否还有更多通知
  // data.nextCursor: 下一页游标
});

// 监听新的实时通知
socket.on('new-notification', (notification: Notification) => {
  console.log('收到新通知:', notification);
  // 处理新通知（如：显示提示、更新界面）
});

// 处理订阅错误
socket.on('subscription-error', (error) => {
  console.error('订阅错误:', error);
});
```

### 取消订阅

```typescript
// 取消订阅某个地址
socket.emit('unsubscribe', { 
  address: '0x1234567890abcdef' 
});
```

### 完整示例：React Hook 实现

```typescript
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: number;
  notificationType: string;
  transactionId: number;
  address: string;
  signer: string;
  triggerAddress: string;
  section?: string;
  method?: string;
  status: 'pending' | 'success' | 'failed';
  genesisHash: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotifications(address: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | undefined>();

  useEffect(() => {
    if (!address) return;

    // 创建 WebSocket 连接
    const newSocket = io('ws://your-server', {
      path: '/notification-push',
      transports: ['websocket']
    });

    // 连接成功后订阅
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('subscribe', { address });
    });

    // 处理断开连接
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 接收历史通知
    newSocket.on('initial-notifications', (data) => {
      setNotifications(data.notifications);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    });

    // 接收新通知
    newSocket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // 处理错误
    newSocket.on('subscription-error', (error) => {
      console.error('订阅错误:', error);
    });

    setSocket(newSocket);

    // 清理函数
    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe', { address });
        newSocket.close();
      }
    };
  }, [address]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!socket || !address || !nextCursor) return;

    socket.emit('subscribe', { 
      address, 
      lastNotificationId: nextCursor 
    });
  }, [socket, address, nextCursor]);

  return {
    notifications,
    isConnected,
    hasMore,
    loadMore
  };
}
```

## 通知类型说明

### 1. 交易创建（transaction_created）
当新的多签或代理交易被发起时触发。

### 2. 交易批准（transaction_approved）
当交易收到签名者的批准时触发。

### 3. 交易执行（transaction_executed）
当交易成功执行或执行失败时触发。

## 状态值说明

- `pending` - 待处理：交易等待批准或执行
- `success` - 成功：交易执行成功
- `failed` - 失败：交易执行失败

## 重要说明

### 过滤逻辑
通知系统会自动过滤以下类型的交易：
- 多签和代理包装交易
- 系统调用（system、timestamp、parachainSystem）
- 批量操作（batch、batchAll、forceBatch）
- 只有实际的业务交易才会生成通知

### 区块链重组处理
- 区块链重组时会自动清理相关通知
- 交易被回滚时，对应的通知会被删除
- 基于状态的清理机制确保数据一致性

### WebSocket 行为说明
- **初始数据**：订阅时不传 `lastNotificationId`，返回最近 100 条通知
- **增量数据**：传入 `lastNotificationId`，只返回更新的通知
- **实时推送**：新通知会立即推送给所有订阅者
- **房间管理**：每个地址有独立的房间 `notification:${address}`

### 最佳实践

#### 1. 连接管理
- 实现网络中断后的重连逻辑
- 组件卸载或地址变更时取消订阅
- 优雅处理连接错误

#### 2. 数据处理
- 在本地状态/store 中存储通知
- 根据通知 ID 实现去重
- 为大数据集实现分页处理

#### 3. 界面更新
- 初始加载时显示加载状态
- 突出显示实时通知
- 已读/未读状态仅在前端实现

#### 4. 性能优化
- 限制同时订阅的数量
- 多地址查询使用批量接口
- 长列表实现虚拟滚动

## 错误处理

### REST API 错误
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
```

### WebSocket 错误
```typescript
socket.on('subscription-error', (error: {
  address: string;
  error: string;
}) => {
  // 处理订阅错误
  console.error(`地址 ${error.address} 订阅失败:`, error.error);
});
```

## 从轮询迁移到 WebSocket

如果你的应用当前使用轮询方式更新通知，请按以下步骤迁移：

1. **替换轮询逻辑**：使用 WebSocket 订阅替代定时请求
2. **生命周期管理**：在组件生命周期中正确清理连接
3. **状态管理**：添加连接状态管理
4. **数据处理**：同时处理历史和实时数据
5. **降级方案**：WebSocket 失败时回退到 REST API

## 测试方法

### REST API 测试
```bash
# 获取单个地址的通知
curl -X GET "http://localhost:3000/api/notification/0x1234567890abcdef?limit=10"

# 批量查询
curl -X POST "http://localhost:3000/api/notification/batch" \
  -H "Content-Type: application/json" \
  -d '{"addresses":["0x1234567890abcdef"],"limit":20}'
```

### WebSocket 测试
在浏览器控制台测试：
```javascript
// 创建连接
const socket = io('ws://localhost:3000', {
  path: '/notification-push',
  transports: ['websocket']
});

// 连接成功后订阅
socket.on('connect', () => {
  console.log('已连接');
  socket.emit('subscribe', {
    address: '0x1234567890abcdef'
  });
});

// 监听通知
socket.on('initial-notifications', (data) => {
  console.log('历史通知:', data);
});

socket.on('new-notification', (notification) => {
  console.log('新通知:', notification);
});
```

## Vue 3 集成示例

```typescript
// composables/useNotifications.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

export function useNotifications(address: string) {
  const notifications = ref<Notification[]>([]);
  const isConnected = ref(false);
  const socket = ref<Socket | null>(null);

  onMounted(() => {
    socket.value = io('ws://your-server', {
      path: '/notification-push',
      transports: ['websocket']
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      socket.value?.emit('subscribe', { address });
    });

    socket.value.on('initial-notifications', (data) => {
      notifications.value = data.notifications;
    });

    socket.value.on('new-notification', (notification) => {
      notifications.value.unshift(notification);
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.emit('unsubscribe', { address });
      socket.value.close();
    }
  });

  return {
    notifications,
    isConnected
  };
}
```

## 常见问题

### Q: 如何处理多账户切换？
A: 切换账户时，先取消订阅旧地址，再订阅新地址。

### Q: 断线重连后需要重新订阅吗？
A: 需要。在 `connect` 事件中重新发送订阅请求。

### Q: 如何实现无限滚动加载？
A: 使用 `lastNotificationId` 参数获取更多历史数据。

### Q: 通知的已读状态如何管理？
A: 已读/未读状态完全由前端管理，后端不存储此信息。

## 支持

如有问题或需要帮助，请参考后端服务文档或联系开发团队。