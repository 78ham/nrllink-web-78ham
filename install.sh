#!/bin/sh
set -e

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { printf "${GREEN}[OK]${NC}   %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC} %s\n" "$1"; exit 1; }

# ---- Docker ----
docker info >/dev/null 2>&1 || fail "Docker 未运行"
info "Docker 就绪"

# ---- Compose ----
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  fail "Docker Compose 未安装"
fi
info "Compose 就绪"

# ---- GHCR login ----
if [ -f ".ghcr-token" ]; then
  cat .ghcr-token | tr -d '\n\r' | docker login ghcr.io -u 78ham --password-stdin >/dev/null 2>&1 \
    && info "GHCR 已登录" || warn "GHCR 登录失败，匿名拉取"
else
  warn "无 .ghcr-token，匿名拉取"
fi

# ---- Pull images ----
$DC pull || fail "镜像拉取失败"
info "镜像已拉取"

# ---- Init udphub.yaml ----
if [ ! -f udphub.yaml ]; then
  if [ -f ../nrllink-78ham/udphub.yaml ]; then
    cp ../nrllink-78ham/udphub.yaml ./udphub.yaml
    info "udphub.yaml 已从后端仓库复制"
  else
    fail "找不到 udphub.yaml"
  fi
else
  info "udphub.yaml 已存在"
fi

# ---- Start ----
$DC up -d || fail "启动失败"
info "等待后端就绪..."
i=30
while [ $i -gt 0 ]; do
  $DC ps nrllink 2>/dev/null | grep -q "healthy" && break
  i=$((i-1)); sleep 2
done

echo ""
$DC ps
echo ""
info "完成！访问 http://localhost:7891"
