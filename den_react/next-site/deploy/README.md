# amao.hnbai.com 生产部署

本文记录当前已经验证的生产架构和手动部署流程。

- Debian 12 x86_64 VPS
- Cloudflare DNS 与代理
- Cloudflare SSL/TLS `Full (strict)`
- Nginx 负责 HTTPS、静态站和反向代理
- Next.js 16 与 Payload 3 由 systemd 管理
- SQLite 和媒体文件保存在 VPS 本地
- GitHub `main` 是唯一生产分支

## 1. 生产结构

```text
Internet
  -> Cloudflare HTTPS
  -> Nginx HTTPS :443
     -> amao.hnbai.com
        -> http://127.0.0.1:3000
        -> Next.js + Payload
     -> hnbai.com / www.hnbai.com
        -> /var/www/hnbai.com
```

VPS 目录：

```text
/srv/amao-den/
├── app/                              Git 仓库，跟踪 main
│   ├── den_react/next-site/          Amao's Den 应用
│   └── hnbai.com/                    静态站源码副本
├── shared/
│   ├── .env.production               生产密钥与配置
│   ├── data/payload.db               SQLite 数据库
│   └── media/                        Payload 媒体文件
└── build-backups/                    可选的临时构建备份

/var/www/hnbai.com/                   www.hnbai.com 当前静态站
```

代码更新不会覆盖 `/srv/amao-den/shared`。Journal、评论、管理员和媒体元数据保存在 `payload.db`；图片文件保存在 `shared/media`。

## 2. 安装 Node.js 与 pnpm

不要把 Node.js 只安装在 root 的 NVM 目录中，否则 `amao` 和 systemd 无法使用。以下示例安装已经验证的 Node.js `v22.23.1` 和 pnpm `11.7.0`：

```bash
apt update
apt install -y ca-certificates curl xz-utils

NODE_VERSION=v22.23.1
NODE_ARCH=linux-x64

cd /tmp
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-${NODE_ARCH}.tar.xz"
curl -fsSLO "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"
grep " node-${NODE_VERSION}-${NODE_ARCH}.tar.xz$" SHASUMS256.txt | sha256sum -c -

install -d /opt/nodejs
tar -xJf "node-${NODE_VERSION}-${NODE_ARCH}.tar.xz"
mv "node-${NODE_VERSION}-${NODE_ARCH}" /opt/nodejs/

ln -sfn "/opt/nodejs/node-${NODE_VERSION}-${NODE_ARCH}" /opt/nodejs/current
ln -sfn /opt/nodejs/current/bin/node /usr/local/bin/node
ln -sfn /opt/nodejs/current/bin/npm /usr/local/bin/npm
ln -sfn /opt/nodejs/current/bin/npx /usr/local/bin/npx

npm install --global --prefix /usr/local pnpm@11.7.0

node --version
npm --version
pnpm --version
```

## 3. 创建服务用户与目录

root 是 VPS 管理用户，`amao` 是运行应用和拥有代码文件的服务用户。

```bash
id amao >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash amao

install -d -o amao -g amao /srv/amao-den/app
install -d -o amao -g amao /srv/amao-den/shared/data
install -d -o amao -g amao /srv/amao-den/shared/media

sudo -u amao -H node --version
sudo -u amao -H pnpm --version
```

首次克隆：

```bash
sudo -u amao -H git clone \
  https://github.com/Amaodemao/cat_nest.git \
  /srv/amao-den/app

sudo -u amao -H git \
  -C /srv/amao-den/app \
  switch main
```

如果 `/srv/amao-den/app` 已经存在且非空，不要再次执行 `git clone`。使用以下命令检查：

```bash
sudo -u amao -H git -C /srv/amao-den/app status --short
sudo -u amao -H git -C /srv/amao-den/app branch --show-current
```

不要用 root 直接操作这个仓库，否则可能出现 `detected dubious ownership`。始终使用 `sudo -u amao -H git ...`。

## 4. 生产环境配置

```bash
cd /srv/amao-den/app/den_react/next-site

sudo -u amao -H cp \
  .env.production.example \
  /srv/amao-den/shared/.env.production

chown amao:amao /srv/amao-den/shared/.env.production
chmod 600 /srv/amao-den/shared/.env.production

openssl rand -hex 32
openssl rand -hex 32
```

把两次随机值分别写入 `PAYLOAD_SECRET` 和 `COMMENT_HASH_SECRET`。关键配置如下：

```dotenv
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000

NEXT_PUBLIC_SITE_URL=https://amao.hnbai.com
PAYLOAD_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
COMMENT_HASH_SECRET=REPLACE_WITH_ANOTHER_LONG_RANDOM_SECRET
DATABASE_URL=file:/srv/amao-den/shared/data/payload.db
MEDIA_DIR=/srv/amao-den/shared/media
```

上线后不要随意更换 `PAYLOAD_SECRET`，否则现有登录令牌会失效。

## 5. 导入 SQLite 和媒体

从本地上传已有数据前，停止本地开发服务器，避免 SQLite 正在写入。

本地 PowerShell：

```powershell
scp D:\github\cat_nest\den_react\next-site\payload.db `
  amao@YOUR_VPS:/srv/amao-den/shared/data/payload.db

scp -r D:\github\cat_nest\den_react\next-site\media\* `
  amao@YOUR_VPS:/srv/amao-den/shared/media/
```

VPS：

```bash
chown -R amao:amao /srv/amao-den/shared
chmod 750 /srv/amao-den/shared/data /srv/amao-den/shared/media
chmod 640 /srv/amao-den/shared/data/payload.db
```

不导入数据库时，Payload 会创建新数据库，并在首次进入 `/admin` 时要求创建管理员。

## 6. 本地验证与 VPS 构建

在本地开发机完成质量检查：

```powershell
cd D:\github\cat_nest\den_react\next-site
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

1 GB 左右的 VPS 可能在 ESLint 使用默认 512 MB Node.js 堆时发生 OOM。生产 VPS 不需要重复运行 lint 和测试；GitHub 中准备部署的提交应已在本地验证。

VPS 构建必须加载生产环境，因为构建过程会读取 Payload 数据：

```bash
sudo -u amao -H bash -c '
  set -e
  set -a
  source /srv/amao-den/shared/.env.production
  set +a

  cd /srv/amao-den/app/den_react/next-site
  pnpm install --frozen-lockfile
  pnpm build
'
```

如果 VPS 构建也因内存不足失败，先检查：

```bash
free -h
swapon --show
```

再考虑为 VPS 配置 swap。不要通过无限重试并行构建来解决内存不足。

## 7. systemd 服务

安装仓库中的服务文件：

```bash
cp \
  /srv/amao-den/app/den_react/next-site/deploy/amao-den.service \
  /etc/systemd/system/amao-den.service

systemctl daemon-reload
systemctl enable --now amao-den

sleep 3
systemctl status amao-den --no-pager --full
curl -I http://127.0.0.1:3000/
```

应用必须只监听 `127.0.0.1:3000`。systemd 使用 Node.js 的完整路径直接运行 Next.js，避免 `pnpm start -- --hostname` 参数解析问题。

常用诊断：

```bash
journalctl -u amao-den --since "10 minutes ago" --no-pager
ss -ltnp | grep -E ':(80|443|3000)\b'
```

## 8. Cloudflare Origin Certificate

在 Cloudflare 控制台进入 `SSL/TLS -> Origin Server -> Create Certificate`，创建包含以下主机名的 RSA 证书：

```text
hnbai.com
*.hnbai.com
```

`*.hnbai.com` 覆盖 `amao.hnbai.com` 和 `www.hnbai.com`，但不覆盖裸域名 `hnbai.com`，所以两项都需要。

保存到 VPS：

```text
/etc/ssl/cloudflare/hnbai.com.pem
/etc/ssl/cloudflare/hnbai.com.key
```

权限：

```bash
chown root:root \
  /etc/ssl/cloudflare/hnbai.com.pem \
  /etc/ssl/cloudflare/hnbai.com.key

chmod 644 /etc/ssl/cloudflare/hnbai.com.pem
chmod 600 /etc/ssl/cloudflare/hnbai.com.key
```

验证：

```bash
openssl x509 \
  -in /etc/ssl/cloudflare/hnbai.com.pem \
  -noout -subject -issuer -dates -ext subjectAltName

openssl pkey \
  -in /etc/ssl/cloudflare/hnbai.com.key \
  -check -noout
```

不要把私钥提交到 Git 或发送到聊天中。

## 9. Nginx 虚拟主机

必须为 Amao 和静态站分别配置 443 server block，否则 `www.hnbai.com` 可能落入 Amao 的默认 HTTPS 虚拟主机。

Amao：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name amao.hnbai.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name amao.hnbai.com;

    ssl_certificate /etc/ssl/cloudflare/hnbai.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/hnbai.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 90s;
    }
}
```

静态站：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name hnbai.com www.hnbai.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hnbai.com www.hnbai.com;

    ssl_certificate /etc/ssl/cloudflare/hnbai.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/hnbai.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/hnbai.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

加载配置：

```bash
nginx -t
systemctl reload nginx
```

Cloudflare Origin Certificate 不在普通 curl 的公共信任库中，所以绕过 Cloudflare 测试源站时需要 `-k`：

```bash
curl -k --resolve amao.hnbai.com:443:127.0.0.1 \
  -I https://amao.hnbai.com/

curl -k --resolve www.hnbai.com:443:127.0.0.1 \
  -I https://www.hnbai.com/
```

确认两个源站虚拟主机正确后，在 Cloudflare 使用 `Full (strict)`。只有在 `Full (strict)` 已生效后，才把 80 server block 改成 HTTPS 重定向；Flexible 模式配合源站 HTTPS 重定向可能造成循环。

Cloudflare 不应缓存：

```text
/admin/*
/api/*
```

## 10. 管理员密码重置

Payload 提供 `/admin/forgot`。要真正发送重置邮件，在 `.env.production` 中填写：

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM_ADDRESS=verified-sender@hnbai.com
SMTP_FROM_NAME="Amao's Den"
```

端口 587 通常使用 `SMTP_SECURE=false`，端口 465 通常使用 `SMTP_SECURE=true`。按邮件服务商要求配置 SPF 和 DKIM。

修改后：

```bash
systemctl restart amao-den
```

然后访问 `https://amao.hnbai.com/admin/forgot` 测试。未配置 `SMTP_HOST` 时，邮件只会写入服务日志。

## 11. 日常手动部署

生产只跟踪 `main`。先在本地完成 lint、测试、构建并推送 `main`，再在 VPS 执行以下步骤。

当前以本节的分步命令为准。仓库中的 `deploy/deploy.sh` 会在 VPS 上运行 lint，1 GB 左右的机器可能因此 OOM，不建议直接用于当前生产服务器。

检查仓库：

```bash
sudo -u amao -H git -C /srv/amao-den/app fetch origin
sudo -u amao -H git -C /srv/amao-den/app status --short
sudo -u amao -H git -C /srv/amao-den/app branch --show-current
```

`status --short` 应无输出，分支应为 `main`。更新代码和依赖：

```bash
sudo -u amao -H git -C /srv/amao-den/app pull --ff-only origin main

sudo -u amao -H bash -c '
  set -e
  set -a
  source /srv/amao-den/shared/.env.production
  set +a

  cd /srv/amao-den/app/den_react/next-site
  pnpm install --frozen-lockfile
'
```

停止、构建、启动：

```bash
systemctl stop amao-den

sudo -u amao -H bash -c '
  set -e
  set -a
  source /srv/amao-den/shared/.env.production
  set +a

  cd /srv/amao-den/app/den_react/next-site
  pnpm build
'

systemctl start amao-den
sleep 3
systemctl status amao-den --no-pager --full
curl -I http://127.0.0.1:3000/
```

注意：一个 `sudo ... bash -c` 中的 `set -e` 不会让外层交互 shell 停止执行。如果验证或构建失败，不要继续执行后续停止/启动步骤。逐段确认命令成功。

最后检查公网：

```bash
curl -I https://amao.hnbai.com/
curl -I https://amao.hnbai.com/gallery
curl -I https://amao.hnbai.com/journal
curl -I https://amao.hnbai.com/admin
curl -I https://www.hnbai.com/
```

## 12. 数据备份

代码构建备份不能替代数据备份。需要一致的简单备份时，可以接受短暂停机：

```bash
systemctl stop amao-den

BACKUP_DIR="/srv/amao-den/backups/$(date +%Y%m%d-%H%M%S)"
install -d -o amao -g amao "$BACKUP_DIR"

cp -a /srv/amao-den/shared/data/payload.db "$BACKUP_DIR/"
cp -a /srv/amao-den/shared/media "$BACKUP_DIR/"

systemctl start amao-den
```

如果存在 `payload.db-wal` 或 `payload.db-shm`，这是 SQLite 的正常运行文件。停止服务后再复制主数据库最容易保证一致性。

## 13. 回滚与恢复

代码回滚不会删除 `/srv/amao-den/shared`。首先记录当前状态：

```bash
sudo -u amao -H git -C /srv/amao-den/app log --oneline -10
```

紧急回到一个已知可用提交时，可以临时进入 detached HEAD：

```bash
sudo -u amao -H git -C /srv/amao-den/app switch --detach KNOWN_GOOD_COMMIT
```

然后重新安装依赖、构建并重启。恢复生产主线：

```bash
sudo -u amao -H git -C /srv/amao-den/app switch main
sudo -u amao -H git -C /srv/amao-den/app pull --ff-only origin main
```

数据库结构发生变化后，代码回滚可能需要匹配的数据库备份。未来开始提交 Payload migrations 后，再启用正式 migration 流程，不要仅依靠运行时自动同步 schema。

## 14. 最终健康检查

```bash
sudo -u amao -H git -C /srv/amao-den/app status --short
sudo -u amao -H git -C /srv/amao-den/app branch --show-current
systemctl is-enabled amao-den nginx
systemctl status amao-den nginx --no-pager --full
nginx -t
ss -ltnp | grep -E ':(80|443|3000)\b'
```

预期结果：

- Git 工作区干净并跟踪 `main`
- Nginx 监听 80 和 443
- Next.js 只监听 `127.0.0.1:3000`
- `amao.hnbai.com` 返回 Next.js/Payload
- `www.hnbai.com` 返回独立静态站
- `/admin` 响应包含 `private, no-cache, no-store`
