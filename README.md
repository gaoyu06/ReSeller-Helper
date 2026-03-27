# Seller Workspace

当前仓库现在只把 Web 项目作为默认入口。

## 项目 A：代理发码系统（Web）

位置：`apps/seller-agent-web`

技术栈：
- Next.js App Router
- Prisma
- SQLite
- shadcn/ui

当前已实现：
- 管理后台与代理工作台双入口
- 管理员登录、代理登录、代理注册申请
- 代理审核流：注册、待审核、通过/驳回、额度配置
- 卡密类型、库存、代理、模板、日志管理
- 发码闭环：权限校验、额度校验、库存扣减、日志记录、模板渲染
- 中文界面与紧凑布局

本地启动：

```powershell
copy .\apps\seller-agent-web\.env.example .\apps\seller-agent-web\.env

pnpm install
pnpm db:push:web
pnpm db:seed:web
pnpm dev:web
```

默认地址：
- 首页：`http://127.0.0.1:3000`
- 管理后台：`http://127.0.0.1:3000/admin/login`
- 代理入口：`http://127.0.0.1:3000/agent/login`

演示账号：
- 管理员：`admin / admin123456`
- 代理：`alpha / alpha123456`
- 代理：`beta / beta123456`

## 仓库结构

- `apps/`：前端项目
- `tools/`：独立工具项目

当前独立工具项目：
- `tools/Seller.CodexConfigCli`

说明：
- C# CLI 已经从根目录剥离到独立目录
- 根目录不再承载 `.NET` 解决方案入口
- `apps/` 当前只保留正式 Web 项目 `seller-agent-web`
