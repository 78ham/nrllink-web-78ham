@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo   NRL 一键部署
echo   ============

docker info >nul 2>&1 || (echo [FAIL] Docker 未运行 & pause & exit /b 1)
echo [OK] Docker 就绪

REM 兼容 Compose V1 (docker-compose) 与 V2 (docker compose)
set DC=docker compose
docker compose version >nul 2>&1
if errorlevel 1 (
  docker-compose version >nul 2>&1
  if errorlevel 1 (echo [FAIL] Docker Compose 未安装 & pause & exit /b 1)
  set DC=docker-compose
)
echo [OK] Compose 就绪 (!DC!)

if exist ".ghcr-token" (
  set /p T=<".ghcr-token"
  echo !T! | docker login ghcr.io -u 78ham --password-stdin >nul 2>&1
  if errorlevel 1 (echo [WARN] GHCR 登录失败，将尝试匿名拉取) else (echo [OK] GHCR 已登录)
) else (
  echo [WARN] 无 .ghcr-token，匿名拉取（公开镜像通常可匿名）
)

if not exist "udphub.yaml" (
  if exist "..\nrllink-78ham\udphub.yaml" (
    copy "..\nrllink-78ham\udphub.yaml" udphub.yaml >nul
    echo [OK] udphub.yaml 已复制
  ) else (
    echo [FAIL] 找不到 udphub.yaml
    pause & exit /b 1
  )
) else (
  echo [OK] udphub.yaml 已存在
)

!DC! pull
!DC! up -d

echo.
!DC! ps
echo.
echo [OK] 完成！访问 http://localhost:7891
pause
