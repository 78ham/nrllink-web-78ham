@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo   NRL Link 容器部署（前端容器 + 后端容器）
echo   =========================================

docker info >nul 2>&1 || (echo [FAIL] Docker 未运行 ^& pause ^& exit /b 1)
echo [OK] Docker 就绪

REM 依赖 depends_on / healthcheck 等 Compose V2 行为
set DC=docker compose
docker compose version >nul 2>&1
if errorlevel 1 (echo [FAIL] 需要 Docker Compose V2（docker compose 子命令） ^& pause ^& exit /b 1)
echo [OK] Compose 就绪

if not exist ".env" (
  if not exist ".env.example" (echo [FAIL] 缺少 .env.example ^& pause ^& exit /b 1)
  copy ".env.example" ".env" >nul
  echo [OK] 已生成 .env
) else (
  echo [OK] .env 已存在
)

if exist ".ghcr-token" (
  set /p T=<".ghcr-token"
  echo !T! | docker login ghcr.io -u 78ham --password-stdin >nul 2>&1
  if errorlevel 1 (echo [WARN] GHCR 登录失败，将尝试匿名拉取) else (echo [OK] GHCR 已登录)
) else (
  echo [OK] 匿名拉取镜像（公开镜像无需登录）
)

!DC! pull nrllink
if errorlevel 1 (echo [FAIL] 后端镜像拉取失败 ^& pause ^& exit /b 1)

!DC! pull web
if errorlevel 1 (
  echo [WARN] 前端镜像拉取失败，改用本地构建
  !DC! build web
  if errorlevel 1 (echo [FAIL] 前端构建失败 ^& pause ^& exit /b 1)
)

!DC! up -d --remove-orphans
if errorlevel 1 (echo [FAIL] 启动失败 ^& pause ^& exit /b 1)

echo.
!DC! ps
echo.
echo [OK] 前端入口 http://服务器IP:80
echo [OK] 后端接口默认只对内网，由前端容器经 Docker 网络访问
echo [OK] 请确认防火墙已放通 UDP 60050（设备接入）
echo [OK] 首次部署的管理员密码： !DC! logs nrllink
echo [OK] 更新请执行 update.sh（Git Bash），或手动 docker compose pull 后 up -d
pause