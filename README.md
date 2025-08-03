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

复制示例环境变量文件并配置：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 文件，填入你的真实配置：

```env
# Upstash Redis 配置
UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_very_long_token_string

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **重要提示**：
> - 确保 URL 以 `https://` 开头
> - Token 是一个很长的字符串，请完整复制
> - 不要在这些值周围添加引号
> - `.env.local` 文件不会被提交到 Git（已在 .gitignore 中）

### 4. 获取 Upstash Redis 配置

#### 步骤 1：创建 Upstash 账户
1. 访问 [Upstash Console](https://console.upstash.com/)
2. 使用 GitHub/Google 账号注册或创建新账户
3. 验证邮箱地址

#### 步骤 2：创建 Redis 数据库
1. 在 Upstash 控制台中，点击 "Create Database"
2. 配置数据库：
   - **Name**: `coffee-ordering-system`（或你喜欢的名字）
   - **Region**: 选择离你最近的区域（如 `us-east-1` 或 `eu-west-1`）
   - **Type**: 选择 "Pay as you go"（免费额度足够小项目使用）
3. 点击 "Create"

#### 步骤 3：获取连接信息
1. 数据库创建后，点击数据库名称进入详情页
2. 找到 "REST API" 部分
3. 复制以下信息：
   - **UPSTASH_REDIS_REST_URL**: 类似 `https://us1-settled-cat-12345.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: 一个很长的字符串

#### 步骤 4：测试连接
将配置添加到 `.env.local` 后，运行开发服务器：
```bash
npm run dev
```
如果在浏览器控制台看到 Redis 相关错误，请检查：
- URL 和 Token 是否正确复制
- 是否有多余的空格
- Upstash 数据库是否处于活跃状态

### 5. 运行开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

#### 本地开发调试

如果遇到问题，请检查以下内容：

1. **Redis 连接状态**：
   - 打开浏览器开发者工具（F12）
   - 查看控制台是否有 Redis 相关错误
   - 成功连接时会显示：`Using Upstash Redis` 或 `Using Memory Store`

2. **环境变量检查**：
   ```bash
   # 在项目根目录运行，检查环境变量是否正确加载
   node -e "console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL)"
   ```

3. **依赖问题**：
   ```bash
   # 清理并重新安装依赖
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **端口冲突**：
   - 如果 3000 端口被占用，Next.js 会自动使用 3001
   - 或手动指定端口：`npm run dev -- -p 3001`

## 🌐 部署到 Vercel

### 方法一：通过 Vercel Dashboard（推荐）

#### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 在 Vercel 中导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库 `coffe-ordering-system`
5. 点击 "Import"

#### 3. 配置环境变量

在项目导入后的配置页面，或者在项目的 Settings > Environment Variables 中添加：

| Name | Value | Environment |
|------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | `https://your-redis-url.upstash.io` | Production, Preview, Development |
| `UPSTASH_REDIS_REST_TOKEN` | `your-redis-token` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-preview.vercel.app` | Preview |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

#### 4. 部署

配置完成后，Vercel 会自动开始部署。

### 方法二：通过 Vercel CLI

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 设置环境变量

```bash
# 生产环境
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# 预览环境
vercel env add UPSTASH_REDIS_REST_URL preview
vercel env add UPSTASH_REDIS_REST_TOKEN preview

# 开发环境
vercel env add UPSTASH_REDIS_REST_URL development
vercel env add UPSTASH_REDIS_REST_TOKEN development
```

#### 4. 部署

```bash
vercel --prod
```

### 常见部署问题排查

#### 问题1：环境变量未生效
**症状**：应用启动但无法连接到 Redis，或显示使用内存存储
**解决方案**：
1. 检查 Vercel Dashboard 中环境变量是否正确设置
2. 确保环境变量名称完全匹配：`UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`
3. 环境变量值不要包含引号或多余空格
4. 重新部署项目以应用环境变量更改：
   ```bash
   # 在 Vercel 中触发重新部署
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

#### 问题2：Redis 连接错误
**症状**：控制台显示 Redis 连接失败
**解决方案**：
1. 验证 Upstash Redis URL 格式：应该是 `https://xxxxx.upstash.io`
2. 检查 Token 是否完整复制（通常很长，包含字母和数字）
3. 确保 Upstash Redis 数据库状态为 "Active"
4. 测试 Redis 连接：
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://your-redis-url.upstash.io/ping
   # 应该返回：{"result":"PONG"}
   ```

#### 问题3：构建失败
**症状**：Vercel 构建过程中出现错误
**解决方案**：
1. 检查构建日志中的具体错误信息
2. 常见问题及解决：
   - **TypeScript 错误**：已配置忽略，但可检查类型定义
   - **依赖缺失**：确保 `package.json` 中包含所有必要依赖
   - **内存不足**：Vercel 免费版有内存限制，优化代码或升级计划

#### 问题4：应用运行但功能异常
**症状**：页面加载但订单功能不工作
**解决方案**：
1. 检查浏览器控制台的 JavaScript 错误
2. 验证 API 路由是否正常工作：
   - 访问 `https://your-app.vercel.app/api/orders`
   - 应该返回空数组 `[]` 而不是错误
3. 检查网络面板中的 API 请求状态

## 🔧 故障排除与监控

### 生产环境调试

1. **查看 Vercel 部署日志**：
   - 访问 Vercel Dashboard > 项目 > Functions
   - 查看实时日志和错误信息

2. **监控 Redis 使用情况**：
   - 在 Upstash Console 中查看数据库指标
   - 监控连接数和存储使用量

3. **性能优化建议**：
   - 启用 Vercel Analytics
   - 使用 Redis 过期时间管理存储
   - 定期清理不必要的历史数据

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
