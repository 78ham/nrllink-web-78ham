#!/bin/sh
# NRL Link 容器部署：前端容器 + 后端容器（同一编排、同一网络组）
#
# 用法：
#   仓库内：  ./install.sh           拉镜像启动
#             ./install.sh --build   本地构建前端镜像后启动
#   服务器：  curl -fsSL https://raw.githubusercontent.com/78ham/nrllink-web-78ham/main/install.sh | sh
#
# 端口规划（可用 .env 调整）：
#   WEB_PORT  80/tcp  前端，对公网开放
#   API_PORT  9000/tcp 后端接口，默认只对本机 / 内网
#   UDP_PORT  60050/udp 设备接入，对公网开放
set -e

REPO="78ham/nrllink-web-78ham"
BRANCH="main"
RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { printf "${GREEN}[OK]${NC}   %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC} %s\n" "$1"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

have docker || fail "未找到 docker，请先安装 Docker"
docker info >/dev/null 2>&1 || fail "Docker 未运行"
info "Docker 就绪"

docker compose version >/dev/null 2>&1 || fail "需要 Docker Compose V2（docker compose 子命令）"
DC="docker compose"
info "Compose 就绪"

# ---- 定位工作目录 ----
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" 2>/dev/null && pwd || pwd)
if [ -f "${SCRIPT_DIR}/docker-compose.yml" ]; then
  cd "${SCRIPT_DIR}"
  info "在仓库目录部署：$(pwd)"
else
  TARGET="${NRL_DIR:-./nrllink}"
  mkdir -p "${TARGET}"
  cd "${TARGET}"
  info "引导模式，部署目录：$(pwd)"
  have curl || fail "引导模式需要 curl 下载编排文件"
  curl -fsSL "${RAW}/docker-compose.yml" -o docker-compose.yml || fail "下载 docker-compose.yml 失败"
  curl -fsSL "${RAW}/.env.example" -o .env.example || fail "下载 .env.example 失败"
  info "编排文件已下载"
fi

# ---- .env ----
if [ ! -f .env ]; then
  [ -f .env.example ] || fail "缺少 .env.example"
  cp .env.example .env
  info "已生成 .env（端口 / 镜像可在此修改）"
else
  info ".env 已存在"
fi

# ---- 自动生成 JWT 密钥 ----
if grep -qE '^TOKEN_KEY=$' .env 2>/dev/null; then
  if have openssl; then
    SECRET=$(openssl rand -hex 32)
  elif have head; then
    SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  elif have sha256sum; then
    SECRET=$(date +%s%N | sha256sum | cut -c1-64)
  else
    SECRET=""
  fi
  if [ -n "$SECRET" ]; then
    sed -i.bak "s|^TOKEN_KEY=$|TOKEN_KEY=${SECRET}|" .env && rm -f .env.bak
    info "已自动生成 JWT 密钥（写入 .env 的 TOKEN_KEY）"
  else
    warn "无法生成随机密钥，请手动设置 .env 里的 TOKEN_KEY，否则重启后需重新登录"
  fi
fi

# ---- GHCR 登录（可选，仅私有镜像需要） ----
if [ -f .ghcr-token ]; then
  if docker login ghcr.io -u 78ham --password-stdin < .ghcr-token >/dev/null 2>&1; then
    info "GHCR 已登录"
  else
    warn "GHCR 登录失败，改为匿名拉取"
  fi
else
  info "匿名拉取镜像（公开镜像无需登录）"
fi

# ---- 获取镜像 ----
if [ "${1:-}" = "--build" ]; then
  info "本地构建前端镜像（首次较慢）"
  $DC build web || fail "前端构建失败"
else
  info "拉取镜像..."
  $DC pull nrllink || fail "后端镜像拉取失败"
  if ! $DC pull web; then
    warn "前端镜像拉取失败，改用本地构建"
    $DC build web || fail "前端构建失败"
  fi
fi

# ---- 启动 ----
$DC up -d --remove-orphans || fail "启动失败"

info "等待服务就绪..."
i=30
while [ $i -gt 0 ]; do
  $DC ps nrllink 2>/dev/null | grep -q "healthy" && break
  i=$((i-1)); sleep 2
done

echo ""
$DC ps
echo ""

webport="$(grep -E '^WEB_PORT=' .env 2>/dev/null | tail -n1 | cut -d= -f2)"
[ -n "$webport" ] || webport=80
api="$(grep -E '^API_BIND=' .env 2>/dev/null | tail -n1 | cut -d= -f2)"
[ -n "$api" ] || api=0.0.0.0
apiport="$(grep -E '^API_PORT=' .env 2>/dev/null | tail -n1 | cut -d= -f2)"
[ -n "$apiport" ] || apiport=9000

info "完成！前端入口： http://<服务器IP>:${webport}"
info "后端接口： http://<服务器IP>:${apiport}（供局域网访问，前端容器经 Docker 网络直连）"
warn "请确认防火墙：放通前端 TCP ${webport} 与设备 UDP 60050；"
warn "务必不要把后端接口 TCP ${apiport} 暴露到公网"
info "首次部署的管理员密码： $DC logs nrllink | grep -A3 默认管理员"