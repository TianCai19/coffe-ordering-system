# 咖啡订单管理系统

一个现代化的咖啡店订单管理系统，使用 Next.js + Upstash Redis + Vercel 构建。

## ✨ 功能特点

- 🎯 **实时订单管理** - 支持下单、修改、删除订单
- ⚡ **加急订单处理** - 紧急订单优先显示
- 📊 **实时统计** - 按咖啡种类和桌号统计待制作订单
- 🔄 **状态跟踪** - 实时更新咖啡制作状态
- 📚 **存档系统** - 支持历史记录查看和周期性数据结算
- 📱 **响应式设计** - 支持手机、平板、电脑
- 💾 **数据持久化** - 使用 Upstash Redis 云数据库
- 🚀 **云端部署** - 基于 Vercel 平台部署

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Upstash Redis
- **部署**: Vercel

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/TianCai19/coffe-ordering-system.git
cd coffee-ordering-system
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件并添加以下配置：

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 获取 Upstash Redis 配置

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建账号并登录
3. 创建新的 Redis 数据库
4. 复制 REST URL 和 REST Token 到环境变量

### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🌐 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 导入你的项目仓库

### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 4. 部署

Vercel 会自动部署你的应用。

## 📡 API 接口

### 订单管理

- `GET /api/orders` - 获取所有订单
- `POST /api/orders` - 创建新订单
- `PUT /api/orders/[id]` - 更新订单
- `DELETE /api/orders/[id]` - 删除订单
- `PUT /api/orders/[id]/items/[index]` - 更新单个咖啡项目状态

### 统计信息

- `GET /api/statistics` - 获取订单统计信息

### 存档管理

- `GET /api/archives` - 获取所有历史存档
- `POST /api/archives` - 存档当前数据并清空
- `DELETE /api/archives?id=[archiveId]` - 删除指定存档

## 📁 项目结构

```
├── app/
│   ├── api/                 # API 路由
│   │   ├── orders/         # 订单相关 API
│   │   ├── statistics/     # 统计相关 API
│   │   └── archives/       # 存档相关 API
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 主页面
├── components/             # React 组件
│   ├── Icons.tsx          # 图标组件
│   ├── OrderCard.tsx      # 订单卡片
│   ├── OrderModal.tsx     # 订单模态框
│   ├── Statistics.tsx     # 统计组件
│   ├── LogsModal.tsx      # 历史记录模态框
│   └── ConfirmDeleteModal.tsx # 删除确认模态框
├── lib/                   # 工具库
│   ├── redis.ts          # Redis 配置
│   ├── order-service.ts  # 订单服务
│   ├── archive-service.ts # 存档服务
│   └── api-service.ts    # API 客户端
├── types/                # TypeScript 类型定义
│   └── index.ts
├── package.json
├── next.config.js
├── tailwind.config.js
└── vercel.json           # Vercel 部署配置
```

## 📖 使用说明

### 下单流程

1. 点击餐桌号码选择桌位
2. 在弹出的订单窗口中选择咖啡种类和数量
3. 可以选择热饮或冰饮
4. 对于紧急订单，可以点击闪电图标设置为加急
5. 点击"确认下单"完成订单

### 订单管理

- **制作状态**: 点击订单卡片中的圆形按钮切换制作状态
- **修改订单**: 点击编辑按钮修改未完成的订单
- **删除订单**: 点击删除按钮删除订单
- **加急订单**: 加急订单会显示在队列前部，并有红色标识

### 数据导出与存档

#### 当前数据导出
点击右上角的下载按钮可以导出当前订单统计报告，包含：
- 按咖啡种类统计的总量
- 按桌号统计的订单详情

#### 历史记录查看
点击左上角的历史图标可以：
- 查看所有历史存档
- 浏览历史统计数据
- 导出历史记录报告
- 删除不需要的存档

#### 周期性结算
点击左上角的存档图标可以：
- 将当前所有数据存档到历史记录
- 清空当前订单数据
- 重新开始统计周期
- 适合每周六使用场景

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
