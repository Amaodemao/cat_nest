# amao.hnbai.com Linux 部署

本方案保留现有 Cloudflare DNS 和 Nginx，使用一个 Next.js/Payload 进程、本地 SQLite 与本地媒体目录。数据库和媒体位于代码目录之外，因此 `git pull`、重新构建和代码回滚不会覆盖数据。

## 目录结构

```text
/srv/amao-den/
├── app/                    Git 仓库
│   └── den_react/next-site
└── shared/
    ├── .env.production     生产密钥和路径
    ├── data/payload.db     SQLite 数据库
    └── media/              Payload 上传文件及生成尺寸
```

以下命令假设服务用户为 `amao`，Node.js 22、Git、Nginx、curl 和 pnpm/Corepack 已安装。

## 1. 创建目录并克隆代码

```bash
sudo useradd --system --create-home --shell /bin/bash amao
sudo mkdir -p /srv/amao-den/app /srv/amao-den/shared/data /srv/amao-den/shared/media
sudo chown -R amao:amao /srv/amao-den

sudo -u amao git clone https://github.com/Amaodemao/cat_nest.git /srv/amao-den/app
cd /srv/amao-den/app/den_react/next-site
sudo -u amao corepack enable
sudo -u amao pnpm install --frozen-lockfile
```

如果 `corepack enable` 不能写入系统 Node.js 目录，先以 root 执行一次 `corepack enable`，再以 `amao` 用户安装依赖。

## 2. 配置生产环境

```bash
sudo -u amao cp .env.production.example /srv/amao-den/shared/.env.production
sudo -u amao chmod 600 /srv/amao-den/shared/.env.production
openssl rand -hex 32
openssl rand -hex 32
```

把两次生成结果分别写入 `PAYLOAD_SECRET` 与 `COMMENT_HASH_SECRET`。保留以下站点和存储路径：

```dotenv
NEXT_PUBLIC_SITE_URL=https://amao.hnbai.com
DATABASE_URL=file:/srv/amao-den/shared/data/payload.db
MEDIA_DIR=/srv/amao-den/shared/media
```

`PAYLOAD_SECRET` 上线后不要随意更换，否则现有登录令牌会失效。

## 3. 上传本地数据库和媒体

复制前先停止本地开发服务器，避免 SQLite 正在写入。然后在本地 PowerShell 中运行：

```powershell
scp D:\github\cat_nest\den_react\next-site\payload.db amao@YOUR_VPS:/srv/amao-den/shared/data/payload.db
scp -r D:\github\cat_nest\den_react\next-site\media\* amao@YOUR_VPS:/srv/amao-den/shared/media/
```

回到 VPS 检查权限：

```bash
sudo chown -R amao:amao /srv/amao-den/shared
sudo chmod 750 /srv/amao-den/shared/data /srv/amao-den/shared/media
sudo chmod 640 /srv/amao-den/shared/data/payload.db
```

如果不复制现有数据库，Payload 会建立新数据库，并在第一次进入 `/admin` 时要求创建首个管理员。

## 4. 首次构建

构建会读取文章和 Gallery 数据来生成缓存页面，因此必须先加载生产环境变量：

```bash
cd /srv/amao-den/app/den_react/next-site
set -a
source /srv/amao-den/shared/.env.production
set +a
pnpm lint
pnpm test
pnpm build
```

## 5. 安装 systemd 服务

先确认 `/usr/bin/env pnpm --version` 在普通 shell 中可用：

```bash
sudo cp deploy/amao-den.service /etc/systemd/system/amao-den.service
sudo systemctl daemon-reload
sudo systemctl enable --now amao-den
sudo systemctl status amao-den
curl -I http://127.0.0.1:3000/
```

应用只监听 `127.0.0.1:3000`，公网请求仍由现有 Nginx 接收。

## 6. 切换 Nginx

先备份现有配置：

```bash
sudo cp /etc/nginx/sites-available/amao.hnbai.com /etc/nginx/sites-available/amao.hnbai.com.backup
```

不要直接覆盖现有 TLS 配置。保留当前证书指令，把原来提供静态文件的 `location /` 替换为 `deploy/nginx-amao.hnbai.com.conf` 中的代理配置。然后检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Cloudflare DNS 记录保持不变。建议使用 Full (strict) TLS，并确保 Cloudflare 不缓存 `/admin/*` 与 `/api/*`。

## 7. 管理员密码重置

Payload 已提供 `/admin/forgot` 和重置令牌流程。要让邮件真正送达，需要在 `.env.production` 中填写 SMTP：

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM_ADDRESS=verified-sender@hnbai.com
SMTP_FROM_NAME="Amao's Den"
```

端口 587 通常使用 `SMTP_SECURE=false`；端口 465 通常使用 `SMTP_SECURE=true`，以邮件服务商说明为准。发件地址必须经过服务商验证，并按服务商要求在 Cloudflare DNS 中添加 SPF、DKIM 等记录。

修改 SMTP 配置后重启服务，再访问 `https://amao.hnbai.com/admin/forgot` 测试。未配置 `SMTP_HOST` 时，Payload 只会把邮件写入服务端日志，无法完成远程密码重置。

## 8. 日常手动部署

代码推送到 GitHub 后，在 VPS 执行：

```bash
cd /srv/amao-den/app/den_react/next-site
bash deploy/deploy.sh
```

脚本会依次拉取当前分支、安装锁定依赖、执行 lint、停止网站、加载生产环境、构建、重新启动并请求首页健康检查。构建失败时会尝试恢复原服务。

当前数据库来自已经同步过 schema 的本地 `payload.db`。未来开始提交 Payload migration 后，在环境文件中加入 `RUN_MIGRATIONS=true`，部署脚本才会自动运行 migration。

## 9. 回滚

应用异常时可以先恢复原来的静态站：

```bash
sudo systemctl stop amao-den
sudo cp /etc/nginx/sites-available/amao.hnbai.com.backup /etc/nginx/sites-available/amao.hnbai.com
sudo nginx -t
sudo systemctl reload nginx
```

数据库与媒体位于 `/srv/amao-den/shared`，代码回滚不会删除它们。
