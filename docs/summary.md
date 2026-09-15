# 迁移整理摘要

## 概览
- 前端已升级到 Vue3 + Vite + Pinia
- Element Plus 兼容问题已集中修复
- 统一弹窗/提示样式，顶部 toast 可见且可堆叠
- 路由切换为 hash 模式，硬刷新不再 404

## 测试
- 使用 Vitest + jsdom（Node16 需固定 jsdom@22.1.0）
- 运行：
  - `npm run test:unit`

## 发布
- 构建：`npm run build:prod`
- 容器部署（推荐）：`./install.sh` 启动前端容器 + 后端容器；`./update.sh` 更新
  参见根 README 的「Docker 部署」章节
- 镜像方式：前端 `ghcr.io/78ham/nrllink-web:latest`，后端 `ghcr.io/78ham/nrllink:latest`

## 待办
- 扩展测试：store/权限/关键组件更多用例
- Element Plus 主题覆盖效果逐页核验