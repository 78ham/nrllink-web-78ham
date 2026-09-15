# 反向代理配置（可选）

本项目容器**不自带对外反向代理**。默认拓扑是：

```
公网浏览器 ──> 前端容器 web:80（页面 + 同源路由）
局域网客户端 ──> 后端容器 9000（接口 / WebSocket）
公网设备   ──> 60050/udp（设备接入，直通）
```

前端容器内部的 nginx 会把 `/api`、`/ws`、`/uploads` 转发给同一 Docker 网络里的 `nrllink:9000`，
所以**页面和接口天然同源**，不配下面这些也能正常用。

什么时候需要本文档：你想用域名 + HTTPS 对外提供服务时，在宿主机再加一层反向代理**指向前端端口**即可。

---

## 方案一：反代指向前端容器（推荐）

```
浏览器 ──HTTPS──> 你的反向代理 ──HTTP──> 127.0.0.1:80（前端容器）
```

只需转发到前端端口，接口和 WebSocket 由前端容器内部处理，配置最简单。

### Nginx

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket（实时语音监控）
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_read_timeout 86400s;
        proxy_buffering    off;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

> 前端端口若不是 80（改了 `.env` 的 `WEB_PORT`），把 `proxy_pass` 改成对应端口。

### Caddy（自动 HTTPS，最省事）

```caddyfile
your-domain.com {
    encode gzip
    reverse_proxy 127.0.0.1:80
}
```

### Traefik

接入同一 Docker 网络后，让 Traefik 直接指向 `web` 服务的 80 端口即可：

```yaml
    labels:
      - traefik.enable=true
      - traefik.http.routers.nrllink.rule=Host(`your-domain.com`)
      - traefik.http.routers.nrllink.entrypoints=websecure
      - traefik.http.routers.nrllink.tls.certresolver=le
      - traefik.http.services.nrllink.loadbalancer.server.port=80
```

---

## 方案二：不用反代

- 直接用 `http://服务器IP` 访问（无 HTTPS）
- 或用 DNS 直接解析到服务器 IP，只跑 HTTP

生产建议用 HTTPS，避免登录凭证在明文链路上传输。

---

## 常见问题

**接口 404 / 页面打开但一直转圈？**
前端容器没连上后端。检查两个容器是否都在同一网络组：

```bash
docker compose ps
docker compose exec web ping -c1 nrllink   # 应能解析到后端容器
```

**语音监控连不上（WebSocket 失败）？**
如果你在外面又挂了一层反代，确认它带了 `Upgrade` / `Connection` 头，且读超时足够长（参考上面的 Nginx 示例）。

**设备连不上？**
`60050/udp` 不能被 HTTP 反向代理接管，必须在防火墙 / 安全组直接放通 UDP。

**后端接口想只开内网？**
把 `.env` 的 `API_BIND` 改成局域网网卡地址（如 `192.168.1.10`）或 `127.0.0.1`。
注意：`127.0.0.1` 只影响宿主机直连，前端容器走 Docker 网络，仍然正常。