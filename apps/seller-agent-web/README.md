# Seller Agent Web

基于 Next.js App Router 和 Prisma 的代理发码系统。

## 环境变量

创建 `apps/seller-agent-web/.env`：

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/database?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
```

如果使用 Neon：

- `DATABASE_URL` 使用 pooled 连接
- `POSTGRES_URL_NON_POOLING` 使用非 pooler 连接

## 本地开发

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

`pnpm install` 后会自动执行 `prisma generate`。

## 部署到 Vercel

需要在 Vercel 项目中配置：

- `DATABASE_URL`
- `POSTGRES_URL_NON_POOLING`
- `AUTH_SECRET`

首次部署前建议先在本地完成：

```bash
pnpm db:push
pnpm db:seed
```

## 说明

- 当前数据层使用 Prisma
- 生产部署建议使用 Neon PostgreSQL
- Session、库存、代理、模板、日志都存储在数据库中
