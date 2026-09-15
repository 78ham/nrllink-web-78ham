#!/bin/sh
# NRL Link 更新脚本（前端 + 后端，都是常驻容器）
#
# 用法：
#   ./update.sh          拉最新镜像并更新前端 + 后端
#   ./update.sh --build  用本地代码重新构建前端镜像后更新
#   ./update.sh --web    只更新前端
#   ./update.sh --api    只更新后端
set -e

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { printf "${GREEN}[OK]${NC}   %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC} %s\n" "$1"; exit 1; }

docker info >/dev/null 2>&1 || fail "Docker 未运行"
docker compose version >/dev/null 2>&1 || fail "需要 Docker Compose V2"
DC="docker compose"
[ -f .env ] || fail "缺少 .env，请先执行 ./install.sh"

if [ -f .ghcr-token ]; then
  docker login ghcr.io -u 78ham --password-stdin < .ghcr-token >/dev/null 2>&1 || true
fi

MODE="${1:-}"

case "$MODE" in
  --build)
    # 本地重新构建前端镜像，不动后端
    info "本地构建前端镜像（不使用缓存）..."
    $DC build --no-cache web || fail "前端构建失败"
    info "重建前端容器..."
    $DC up -d --remove-orphans web || fail "前端更新失败"
    ;;
  --web)
    info "拉取前端镜像..."
    $DC pull web || fail "前端镜像拉取失败"
    info "重建前端容器..."
    $DC up -d --remove-orphans web || fail "前端更新失败"
    ;;
  --api)
    info "拉取后端镜像..."
    $DC pull nrllink || fail "后端镜像拉取失败"
    info "重建后端容器..."
    $DC up -d --remove-orphans nrllink || fail "后端更新失败"
    ;;
  *)
    info "拉取前端与后端镜像..."
    $DC pull web || fail "前端镜像拉取失败"
    $DC pull nrllink || fail "后端镜像拉取失败"
    info "重建容器..."
    $DC up -d --remove-orphans || fail "更新失败"
    ;;
esac

info "等待服务就绪..."
i=30
while [ $i -gt 0 ]; do
  $DC ps nrllink 2>/dev/null | grep -q "healthy" && break
  i=$((i-1)); sleep 2
done

echo ""
$DC ps
echo ""
info "更新完成！"
warn "浏览器若仍显示旧页面，强制刷新一下（Ctrl+F5 / Cmd+Shift+R）"