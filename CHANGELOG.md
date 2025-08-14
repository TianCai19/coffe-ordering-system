# 变更日志 (Changelog)

所有显著的更改都会记录在此文件中。

日期: 2025-08-14

## 本次迭代内容

### 新增
- 支持“姓名优先”的加急订单（无桌号，仅记录顾客姓名）。
- 桌号范围扩展至 1–24。

### 变更
- 整体 UI 切换为英文显示（主页面、统计、日志、确认删除等）。
- 菜单更新为当前饮品清单，并集中管理到 `lib/menu.ts`。
- “已完成”分区仍可切换单品状态（防止误操作后无法修正）。
- 导出/统计统一使用英文标注（Hot/Iced）。

### 后端 / API
- 类型更新（`types/index.ts`）：
  - `Order.tableNumber?: number`（可选）
  - 新增 `Order.customerName?: string`
  - `CreateOrderRequest`/`UpdateOrderRequest` 支持 `customerName?`，并沿用 `items: { name, temperature, isUrgent }[]`。
- `POST /api/orders` 接受 `customerName`，并校验“`tableNumber` 或 `customerName` 至少提供其一”。
- 统计逻辑优化（`lib/order-service.ts#getStatistics`）：
  - 仅在存在 `tableNumber` 时累加桌号统计。
  - 统计键统一为英文（Hot/Iced）。

### 前端 / UI
- `app/page.tsx`
  - 新增“Priority order (name only)”按钮，打开无桌号（姓名）下单流程。
  - `TABLE_COUNT` 调整为 24。
  - 完成区 `OrderCard` 也可传入 `onUpdateItemStatus`，支持状态回退。
  - 导出报告切换为英文内容。
- `components/OrderModal.tsx`
  - 采用集中菜单 `lib/menu.ts`。
  - 英文表述；无桌号时要求输入 `Customer Name`。
  - 产出 `CreateOrderRequest['items']` 结构。
- `components/OrderCard.tsx`
  - 标头优先显示 `Customer: {name}`，否则 `Table: {number}`。
  - 徽标英文化（Urgent/Completed、Hot/Iced）。
- `components/Statistics.tsx`、`LogsModal.tsx`、`ConfirmDeleteModal.tsx`
  - 全面英文化，结构与功能保持一致。

### 其他
- 新增 `next-env.d.ts`，确保 TS/JSX 类型环境齐全。
- 类型与严格模式
  - 在多处补充了显式类型（例如 `Object.entries`/`reduce` 回调参数、事件类型等）。
  - 尽量避免 `flatMap` 的编译目标差异，改用 `reduce` 构造数组。

## 迁移与注意事项
- 部署前请执行依赖安装并启动开发：
  - `npm install`
  - `npm run dev`
- 环境变量按 `README.md` 指引配置（Upstash Redis 连接等）。
- 历史数据兼容：
  - 旧订单未含 `customerName` 不受影响；统计与导出会跳过无桌号的“按桌统计”项。

## 验收与测试清单
- 下单：
  - [ ] 桌号订单（包含 Hot/Iced、加急标记）。
  - [ ] 姓名优先订单（无桌号，需输入姓名）。
- 队列显示：
  - [ ] 姓名优先/加急订单位于前列。
  - [ ] 桌号合并视图排序（按桌/按时间）。
- 完成区：
  - [ ] 仍可点击单品回退为 `preparing`。
- 统计与导出：
  - [ ] 统计为英文 Hot/Iced，数量正确。
  - [ ] 导出 TXT 报告包含总览与按桌详情（仅限有桌号的订单）。

## 后续规划（Next）
- 类型与构建：
  - [ ] 清理残余 TS/ESLint 警告，收敛到零告警。
- 体验与功能：
  - [ ] （可选）引入多语言切换（中文/英文）。
  - [ ] 增加端到端测试（Playwright/Cypress）。
  - [ ] 可配置菜单（后台或 `.json` 配置）。
