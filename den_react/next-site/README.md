# Amao's Den — Next.js + Payload

这是原 Vite 个人站的并行迁移版本。旧站仍位于仓库根目录；新站提供 Payload 管理后台、文章、媒体、Gallery 和游客评论审核。

## 本地开发

要求 Node.js 20.9+ 与 pnpm 9–11。

```powershell
Copy-Item .env.example .env
pnpm install
pnpm dev
```

打开：

- 网站：http://localhost:3000
- 后台：http://localhost:3000/admin

首次进入后台时创建第一个管理员。不要开放公开管理员注册。

也可以在安装 Docker 后运行：

```powershell
docker compose up
```

## 导入旧站内容

导入脚本读取仓库根目录的 `src/blogs` 和 `public/img/gallery`：

```powershell
pnpm import:legacy
```

脚本按文章 slug、Gallery 标题与分类去重，可以安全重复执行。`published: false` 的旧文章会作为草稿导入。

## 内容模型

- `users`：Payload 管理员登录。
- `posts`：Markdown 正文、草稿、发布状态与版本。
- `media`：在同一个后台页面管理图片文件、标题、Safe/NSFW/Gore 分类、排序、发布状态，以及自动生成的 `thumb`、`display` 尺寸。
- `gallery-items`：仅为兼容迁移前本地数据而保留并隐藏，不再由前台或后台使用。
- `comments`：游客评论，默认 `pending`，管理员批准后才公开。

## 评论防滥用

开发环境默认启用蜜罐、同源检查、内容长度限制、IP HMAC 和单进程限流。配置以下变量后还会启用 Cloudflare Turnstile：

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
COMMENT_HASH_SECRET=
```

多实例生产部署应把内存限流替换成 Redis 或网关限流。

## 页面缓存与 SEO

公开文章、Journal 和 Gallery 最长缓存 5 分钟；在 Payload 后台修改文章、媒体或评论状态时会立即刷新对应页面。站点同时提供 `/sitemap.xml` 和 `/robots.txt`。

生产环境必须把公开域名写入：

```dotenv
NEXT_PUBLIC_SITE_URL=https://example.com
```

## 数据与部署

开发环境使用被 Git 忽略的 SQLite 文件 `payload.db`，上传文件位于被忽略的 `media/`。`DATABASE_URL` 和 `MEDIA_DIR` 可以在生产环境指向代码目录之外的持久路径。

`amao.hnbai.com` 采用日本 VPS、Nginx、systemd、本地 SQLite 和本地媒体目录的部署步骤见 [deploy/README.md](deploy/README.md)。生产环境不要提交 `.env`、数据库文件或媒体文件。数据库结构变化后需要生成并执行 Payload migrations。
