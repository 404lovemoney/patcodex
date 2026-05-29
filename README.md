# 沐绒宠物洗护

一个面向宠物洗护门店的 Next.js 官网与预约管理系统。项目包含品牌首页、服务展示、环境轮播、到店预约、预约入库、后台登录、表格化预约管理、筛选分页、状态更新与 CSV 导出，适合部署到 Netlify 并接入 Netlify Database 或兼容 PostgreSQL 的数据库。

## 页面展示

> 展示图片来自项目现有页面素材，统一放在 `docs/images` 目录，便于 GitHub 直接预览。

### 首页主视觉

![首页主视觉](docs/images/home.png)

### 接待与零售休息区

![接待与零售休息区](docs/images/reception.png)

### 洗护水疗区

![洗护水疗区](docs/images/spa.png)

### 造型与宠物休息区

![造型与宠物休息区](docs/images/styling.png)

### 门店地图

![门店地图](docs/images/map.png)

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Next.js 15 App Router |
| UI 渲染 | React 19 |
| 开发语言 | TypeScript |
| 样式方案 | CSS Modules 风格的全局 CSS |
| 数据库 | PostgreSQL、Netlify Database、Supabase 兼容迁移 |
| 服务端接口 | Next.js Route Handlers |
| 部署平台 | Netlify |
| 代码质量 | ESLint 9、eslint-config-next |

## 项目功能

- 品牌官网首页：展示门店定位、洗护服务、护理流程、套餐价格、用户反馈和门店地图。
- 店内环境展示：接待区、洗护水疗区、造型休息区轮播展示。
- 在线预约：提交姓名、电话、宠物类型、服务项目、预约日期和备注。
- 表单防护：包含基础字段校验、蜜罐字段和提交频率限制。
- 预约入库：通过 PostgreSQL 保存预约数据，并保留原始表单 payload。
- 通知扩展：支持配置 `BOOKING_NOTIFICATION_WEBHOOK_URL` 在预约成功后发送通知。
- 预约后台：通过 `/admin/login` 登录后访问 `/admin/bookings`，支持状态筛选、日期筛选、客户姓名/手机号搜索、分页、状态更新、详情弹窗和 CSV 导出。
- SEO 基础：内置 Metadata、Open Graph、Twitter Card、robots 和 sitemap。
- 主题切换：支持浅色、深色和跟随系统偏好。

## 目录结构

```text
.
├── app
│   ├── admin/login                # 后台登录页面
│   ├── admin/bookings             # 预约管理后台页面
│   ├── api/bookings               # 用户预约提交接口
│   ├── api/admin/login            # 后台登录接口
│   ├── api/admin/bookings         # 后台预约查询、导出与状态更新接口
│   ├── components                 # 首页与业务组件
│   ├── config                     # 首页文案、预约选项、SEO 配置
│   ├── lib                        # 数据库、校验、通知、后台业务逻辑
│   ├── globals.css                # 全局样式
│   ├── layout.tsx                 # 根布局与站点元信息
│   └── page.tsx                   # 官网首页
├── assets                         # 原始视觉素材
├── docs
│   ├── database.md                # 数据库与预约后台说明
│   └── images                     # README 页面展示图
├── netlify/database/migrations    # Netlify Database 迁移
├── public/assets                  # 页面静态图片资源
├── scripts                        # 数据迁移脚本
├── supabase/migrations            # Supabase 兼容迁移
├── netlify.toml                   # Netlify 构建配置
├── next.config.mjs                # Next.js 配置
├── package.json                   # 项目脚本与依赖
└── tsconfig.json                  # TypeScript 配置
```

## 启动命令

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 生产构建

```bash
npm run build
```

### 生产启动

```bash
npm run start
```

### 代码检查

```bash
npm run lint
```

### 迁移预约数据到 Netlify Database

```bash
npm run migrate:bookings:netlify
```

## 环境变量

复制 `.env.example` 为 `.env.local`，并根据本地或部署环境填写。

```env
SESSION_DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@POOLER_HOST:5432/postgres"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-your-admin-password"
ADMIN_TOKEN="replace-with-your-admin-token"
BOOKING_NOTIFICATION_WEBHOOK_URL=""
```

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `SESSION_DATABASE_URL` | 本地必填 | 本地开发时使用的 PostgreSQL 连接字符串。 |
| `ADMIN_USERNAME` | 后台必填 | 后台登录账号。 |
| `ADMIN_PASSWORD` | 后台必填 | 后台登录密码。 |
| `ADMIN_TOKEN` | 后台必填 | 登录成功后返回给前端并用于后台 API 鉴权的管理令牌。 |
| `BOOKING_NOTIFICATION_WEBHOOK_URL` | 可选 | 预约创建成功后的通知 Webhook 地址。 |

Netlify 运行时会自动提供 `NETLIFY=true`。当该变量为 `true` 时，项目会通过 `@netlify/database` 获取数据库连接字符串，不直接读取 `NETLIFY_DATABASE_URL`。

## 部署方式

### Netlify 部署

1. 将项目推送到 GitHub。
2. 在 Netlify 创建站点并连接该仓库。
3. 确认构建配置：

```toml
[build]
command = "npm run build"
publish = ".next"
```

4. 在 Netlify 环境变量中配置：

```env
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-admin-password"
ADMIN_TOKEN="your-production-admin-token"
BOOKING_NOTIFICATION_WEBHOOK_URL="optional-webhook-url"
```

5. 创建并连接 Netlify Database，然后执行 `netlify/database/migrations` 中的迁移。
6. 触发部署，部署完成后访问站点首页、`/admin/login` 与 `/admin/bookings` 验证预约链路。

### Supabase / PostgreSQL 部署

如果使用 Supabase 或其他 PostgreSQL 服务：

1. 创建数据库实例。
2. 执行 `supabase/migrations` 中的 SQL 迁移。
3. 在本地 `.env.local` 或部署平台中配置 `SESSION_DATABASE_URL`。
4. 执行 `npm run build` 验证生产构建。

## 后台入口

```text
/admin/login
/admin/bookings
```

先访问 `/admin/login` 输入管理员账号和密码。登录成功后前端会把接口返回的 token 保存到 `localStorage.booking_admin_token`，再跳转到 `/admin/bookings`。

预约管理页为后台表格视图，支持：

- 状态、日期、客户姓名/手机号筛选。
- 每页 10 条分页。
- 查看预约详情弹窗。
- 确认预约、取消预约、标记完成。
- 导出当前筛选结果为 Excel 友好的 UTF-8 CSV。

后台 API 使用 `Authorization: Bearer <token>` 鉴权；如果返回 401，前端会清除本地 token 并跳转回登录页。

## 相关文档

- [数据库与预约后台说明](docs/database.md)
