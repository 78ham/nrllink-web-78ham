# syntax=docker/dockerfile:1

# ---- 1. 构建前端静态资源 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# ---- 2. 前端运行容器 ----
# 独立容器：对外提供前端端口；容器内 nginx 只做同源路由
# （/api、/ws、/uploads -> 同网络组的 nrllink:9000），不承担宿主机反向代理职责。
FROM nginx:1.27-alpine AS web
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]