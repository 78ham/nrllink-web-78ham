# NRL Link Web - HAM互联管理后台

基于 **Vue 3** + **Vite** + **Element Plus** + **Pinia** 的 NRL 无线电网络互联系统管理前端。

**原作**: BH4RPN (BG4VKI) | **78ham 二次开发** | **版本**: 4.1.0 | **许可证**: MIT

---

## 目录

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [路由设计](#路由设计)
- [状态管理 (Pinia)](#状态管理-pinia)
- [API 接口模块](#api-接口模块)
- [页面详解](#页面详解)
- [组件系统](#组件系统)
- [工具函数](#工具函数)
- [指令系统](#指令系统)
- [国际化](#国际化)
- [样式与主题](#样式与主题)
- [WebSocket 集成](#websocket-集成)
- [构建与部署](#构建与部署)

---

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式 (默认连接 js.nrlptt.com)
npm run dev

# 构建生产版本
npm run build:prod

# 构建预发布版本
npm run build:stage

# 预览构建结果
npm run preview

# 运行单元测试
npm run test:unit

# 代码检查
npm run lint

# 创建新组件/页面
npm run new
```

### 环境变量

| 文件 | 变量 | 说明 |
|------|------|------|
| `.env.development` | `VITE_BASE_API=/dev-api` | 开发代理前缀 |
| `.env.production` | `VITE_BASE_API=/` | 生产API前缀 |
| `.env.staging` | `VITE_BASE_API=/stage-api` | 预发布API前缀 |

开发模式下，Vite 代理 `/dev-api` → `https://js.nrlptt.com/`（配置在 `vite.config.js`）。

---

## 项目结构

```
nrllink-web-78ham/
├── index.html                        # HTML入口(安全区域CSS变量、主题色)
├── package.json                      # v4.1.0, Vue3.5 + Vite7 + Element Plus 2.13
├── vite.config.js                    # Vite配置(别名/代理/自动导入/代码分割)
├── babel.config.js                   # Babel(@vue/app预设)
├── .env.development                  # 开发环境变量
├── .env.production                   # 生产环境变量
├── .env.staging                      # 预发布环境变量
├── .eslintrc.js                      # ESLint(Vue3-推荐,2空格,单引号,无分号)
├── .postcssrc.js                     # PostCSS(autoprefixer)
├── plopfile.js                       # Plop代码生成器配置
│
├── public/
│   ├── favicon.ico                   # 网站图标
│   ├── index.html                    # 备用入口
│   ├── manifest.json                 # PWA Manifest
│   ├── sw.js                         # Service Worker
│   ├── images/                       # 静态图片(logo, nezha系列)
│   └── icons/                        # PWA图标(72-512px)
│
├── src/
│   ├── main.js                       # 应用入口(注册插件/全局组件/图标)
│   ├── App.vue                       # 根组件(el-config-provider + router-view)
│   ├── settings.js                   # 全局设置(title/tagsView/fixedHeader等)
│   ├── permission.js                 # 路由守卫(登录检查/权限过滤/NProgress)
│   │
│   ├── api/                          # API接口层 (19个模块)
│   │   ├── user.js                   # 登录/用户信息/密码/资料更新
│   │   ├── device.js                 # 设备CRUD/AT指令/参数修改
│   │   ├── groups.js                 # 群组CRUD/加入/设备列表
│   │   ├── relay.js                  # 中继频率CRUD
│   │   ├── server.js                 # 服务器CRUD
│   │   ├── employee.js              # 用户管理(管理员)
│   │   ├── register.js              # 注册管理
│   │   ├── platform.js              # 平台信息/服务器列表
│   │   ├── homepage.js              # 首页CMS(板块/公告/图片)
│   │   ├── billing.js              # 计费(套餐/订单)
│   │   ├── role.js                  # 角色/路由权限
│   │   ├── weixin.js               # 微信(绑定码/消息)
│   │   ├── alipay.js               # 支付宝
│   │   ├── article.js              # 文章管理
│   │   ├── dataquery.js            # 数据统计查询
│   │   ├── notices.js              # 通知消息
│   │   ├── operatorlog.js          # 操作日志
│   │   ├── remote-search.js        # 远程搜索
│   │   └── report.js               # 统计报表
│   │
│   ├── store/                        # Pinia状态管理 (7个模块)
│   │   ├── index.js                  # Pinia实例创建
│   │   └── modules/
│   │       ├── app.js                # 侧边栏/设备/语言/布局大小
│   │       ├── errorLog.js           # 错误日志收集
│   │       ├── permission.js         # 动态路由生成(角色过滤/计费过滤)
│   │       ├── settings.js           # 全局设置/平台主题
│   │       ├── tagsView.js           # 标签页(visitedViews/cachedViews)
│   │       └── user.js               # 用户认证(token/角色/路由)
│   │
│   ├── router/
│   │   └── index.js                  # 路由配置(constantRoutes + asyncRoutes)
│   │
│   ├── views/                        # 页面视图 (20+页面)
│   │   ├── login/                    # 登录门户(含ServerList/SupportLinks/实时监控)
│   │   ├── dashboard/                # 仪表盘(统计/公告/实时监控/图表组件)
│   │   ├── pub/                      # 公开页面(设备/群组/中继)
│   │   ├── setup/                    # 管理后台(用户/群组/服务器/注册/角色/计费)
│   │   ├── renew/                    # 续费页面(套餐/支付)
│   │   ├── log/                      # 操作日志
│   │   ├── register/                 # 用户自助注册
│   │   ├── profile/                  # 用户资料
│   │   ├── excel/                    # Excel导入导出
│   │   ├── error-page/               # 401/404错误页
│   │   └── redirect/                 # 路由重定向
│   │
│   ├── layout/                       # 布局系统
│   │   ├── index.vue                 # 主布局(侧边栏+导航栏+标签页+主内容+移动端标签栏)
│   │   └── components/
│   │       ├── AppMain.vue           # 主内容区(<router-view> + <keep-alive>)
│   │       ├── Navbar.vue            # 顶部导航(面包屑/全屏/语言/主题/用户菜单)
│   │       ├── Sidebar/              # 侧边栏(Logo/菜单项/递归渲染)
│   │       ├── TagsView/             # 标签页(已访问视图/右键菜单)
│   │       └── Settings/             # 全局设置面板
│   │
│   ├── components/                   # 组件系统 (30+组件)
│   │   ├── platform/                 # 平台专用组件
│   │   │   ├── LivePlatformStats.vue # 实时平台统计
│   │   │   └── RealtimeMonitorPanel.vue # WebSocket实时通话监控面板
│   │   ├── Charts/                   # 图表组件
│   │   │   ├── Keyboard.vue          # 键盘图表
│   │   │   ├── LineMarker.vue        # 折线标记图
│   │   │   ├── MixChart.vue          # 混合图表(柱状+折线)
│   │   │   └── mixins/resize.js      # 图表自适应
│   │   └── [30+通用组件]              # 见下方组件系统章节
│   │
│   ├── utils/                        # 工具函数 (14个模块)
│   │   ├── auth.js                   # Token Cookie管理
│   │   ├── request.js                # Axios封装(拦截器/JWT头/错误处理)
│   │   ├── index.js                  # 工具函数集(32个函数)
│   │   ├── system.js                 # 系统常量(设备/群组类型选项 + AT命令文档)
│   │   ├── ctcss.js                  # CTCSS亚音选项(39个频率)
│   │   ├── theme.js                  # ElementPlus主题 + 平台主题
│   │   ├── i18n.js                   # 国际化标题生成
│   │   ├── validate.js               # 表单验证器
│   │   ├── permission.js             # 权限检查
│   │   ├── clipboard.js             # 剪贴板
│   │   ├── open-window.js            # 弹窗
│   │   ├── scroll-to.js             # 平滑滚动
│   │   ├── error-log.js             # 全局错误收集
│   │   └── get-page-title.js         # 页面标题
│   │
│   ├── directive/                    # 自定义指令 (6个)
│   │   ├── clipboard/                # v-clipboard (剪贴板)
│   │   ├── el-drag-dialog/           # v-el-drag-dialog (对话框拖拽)
│   │   ├── el-table/                 # v-el-height-adaptive-table (表格自适应)
│   │   ├── permission/               # v-permission (权限控制)
│   │   ├── sticky.js                # v-sticky (粘性定位)
│   │   └── waves/                    # v-waves (水波纹效果)
│   │
│   ├── lang/                         # 国际化
│   │   ├── index.js                  # i18n初始化(zh/en)
│   │   ├── zh.js                     # 中文翻译(565行)
│   │   └── en.js                     # 英文翻译(565行)
│   │
│   ├── styles/                       # 样式系统
│   │   ├── index.scss                # 全局样式入口
│   │   ├── variables.js              # JS变量(侧边栏颜色/宽度)
│   │   ├── variables.scss            # SCSS变量(颜色/侧边栏)
│   │   ├── themes.js                 # 6套平台主题定义
│   │   ├── platform-theme.scss       # 平台主题CSS变量
│   │   ├── btn.scss                  # 按钮样式
│   │   ├── element-ui.scss           # Element Plus覆盖
│   │   ├── element-variables.scss    # Element Plus变量
│   │   ├── mixin.scss                # SCSS混入
│   │   ├── mobile.scss              # 移动端样式
│   │   ├── sidebar.scss             # 侧边栏样式
│   │   └── transition.scss          # 过渡动画
│   │
│   ├── filters/
│   │   └── index.js                  # 全局过滤器(时间/数字格式化)
│   │
│   ├── icons/                        # SVG图标系统
│   │   ├── index.js                  # SvgIcon全局注册
│   │   ├── svgo.yml                  # SVG优化配置
│   │   └── svg/                      # 60+ SVG图标文件
│   │
│   ├── vendor/                       # 第三方工具
│   │   ├── Export2Excel.js           # 导出Excel(多表头/合并/自动列宽)
│   │   └── Export2Zip.js            # 导出ZIP压缩文件
│   │
│   └── workers/
│       └── alawDecode.worker.js      # Web Worker: G.711 A-law音频解码
│
├── tests/                            # 单元测试
│   └── unit/
│       ├── components/               # 组件测试
│       ├── store/                    # Store测试(6个模块)
│       └── utils/                    # 工具函数测试
│
├── plop-templates/                   # Plop模板
│   ├── component/                    # 组件模板
│   └── view/                         # 页面模板
│
└── docs/
    ├── summary.md                    # 项目摘要
    └── vue3-migration.md            # Vue3迁移记录
```

---

## 路由设计

### 常量路由 (constantRoutes)

所有用户均可访问，无需鉴权:

| 路径 | 视图 | 说明 |
|------|------|------|
| `/redirect/:path` | redirect/index | 路由重定向处理器 |
| `/login` | login/index | 登录门户 |
| `/register` | register/index | 用户自助注册 |
| `/auth-redirect` | login/auth-redirect | OAuth回调 |
| `/404` | error-page/404 | 404错误页 |
| `/401` | error-page/401 | 401未授权页 |
| `/` | dashboard/index | 仪表盘(首页, affix固定) |
| `/profile` | profile/index | 用户资料(hidden隐藏) |

### 动态路由 (asyncRoutes)

根据角色和计费状态动态添加:

#### 公众路由 (roles: ['ham'])

| 路径 | 视图 | 说明 |
|------|------|------|
| `/public/totaldevices` | pub/device | 在线设备管理(列表/参数修改/AT指令/1W/2W配置) |
| `/public/groups` | pub/groups | 公共群组浏览(加入/退出群组) |
| `/public/relay` | pub/relay | 中继频率查询 |

#### 续费路由 (roles: ['ham'], requiresBilling)

| 路径 | 视图 | 说明 |
|------|------|------|
| `/renew/index` | renew/index | 续费页面(套餐选择/微信支付/订单查询) |

#### 管理路由 (roles: ['master'])

| 路径 | 子路由 | 视图 | 角色 | 说明 |
|------|--------|------|------|------|
| `/setup` | `publicgroup` | setup/groups | admin | 群组管理(创建/编辑/删除) |
| `/setup` | `server` | setup/server | admin | 服务器管理(CRUD) |
| `/setup` | `users` | setup/users | admin | 用户管理(CRUD/角色分配) |
| `/setup` | `register` | setup/register | admin | 注册审批(审核/拒绝) |
| `/setup` | `billing-packages` | setup/billing-packages | admin | 计费套餐管理 |
| `/setup` | `roles` | setup/role | admin | 角色与路由权限管理 |

#### 日志路由 (roles: ['admin'])

| 路径 | 视图 | 说明 |
|------|------|------|
| `/log/operatorlog` | log/operatorlog | 操作日志查看(按操作员/事件类型/日期筛选) |

### 路由守卫 (permission.js)

```
router.beforeEach:
  1. NProgress.start()
  2. isLoggedIn?
     ├─ 否: /login,/register,/auth-redirect → 放行
     ├─ 否: 白名单 → 放行
     └─ 否: 其他 → 重定向到/login
  3. isLoggedIn? 是:
     ├─ 已获取角色 → 放行
     └─ 未获取角色:
        ├─ 调用 store.user.getInfo() 获取用户信息
        ├─ 调用 store.permission.generateRoutes(roles, billingEnabled)
        │   ├─ asyncRoutes 按角色过滤
        │   └─ 按 requiresBilling 过滤
        ├─ router.addRoute() 动态注册
        └─ next({...to, replace:true}) 重新进入

router.afterEach:
  1. 应用平台主题
  2. NProgress.done()
```

### 路由重置

```js
// 用户登出/切换角色时调用
resetRouter() → createRouter() 新实例 → matcher替换
```

---

## 状态管理 (Pinia)

### useAppStore

| State | 类型 | 说明 |
|-------|------|------|
| `sidebar` | `{opened, withoutAnimation}` | 侧边栏状态(cookie持久化) |
| `device` | `string` | 'desktop'/'mobile' |
| `language` | `string` | 'zh'/'en'(cookie或浏览器语言) |
| `size` | `string` | 'medium'/'small'/'mini'(cookie) |

| Actions | 说明 |
|---------|------|
| `toggleSideBar()` | 切换侧边栏 |
| `closeSideBar({withoutAnimation})` | 关闭侧边栏 |
| `toggleDevice(device)` | 切换设备类型 |
| `setLanguage(language)` | 设置语言(cookie+i18n) |
| `setSize(size)` | 设置组件大小(cookie) |

### useUserStore

| State | 类型 | 说明 |
|-------|------|------|
| `token` | `string` | JWT令牌(cookie: Admin-Token) |
| `id` | `number` | 用户ID |
| `name` | `string` | 用户姓名 |
| `phone` | `string` | 手机号 |
| `callsign` | `string` | 呼号 |
| `dmrid` | `string` | DMR ID |
| `mdcid` | `string` | MDC ID |
| `status` | `number` | 状态 |
| `expire_time` | `string` | 过期时间 |
| `package_type` | `number` | 套餐类型 |
| `billing_enabled` | `boolean` | 计费是否启用 |
| `avatar` | `string` | 头像URL |
| `introduction` | `string` | 自我介绍 |
| `roles` | `string[]` | 角色列表 |
| `routes` | `object[]` | 动态路由配置 |

| Actions | API调用 | 说明 |
|---------|---------|------|
| `login(userInfo)` | POST /user/login | 登录→保存token |
| `getInfo()` | GET /user/info | 获取用户信息→填充state |
| `logout()` | POST /user/logout | 登出→清空state→重置token→重置路由 |
| `resetToken()` | - | 清空token和roles |
| `changeRoles(role)` | - | 切换角色(用于测试) |

### usePermissionStore

| State | 类型 | 说明 |
|-------|------|------|
| `routes` | `RouteRecordRaw[]` | 完整路由(constantRoutes + 过滤后的asyncRoutes) |
| `addRoutes` | `RouteRecordRaw[]` | 动态添加的路由 |

| Actions | 说明 |
|---------|------|
| `generateRoutes(roles, billingEnabled)` | 按角色和计费状态过滤asyncRoutes, 合并constantRoutes |

### useSettingsStore

| State | 类型 | 说明 |
|-------|------|------|
| `title` | `string` | 页面标题("HAM互联") |
| `theme` | `string` | Element Plus主题色(#1890ff) |
| `platformThemeKey` | `string` | 平台主题键(localStorage: nrl-platform-theme) |
| `showSettings` | `boolean` | 显示设置面板 |
| `tagsView` | `boolean` | 启用标签页 |
| `fixedHeader` | `boolean` | 固定头部 |
| `sidebarLogo` | `boolean` | 侧边栏Logo |

| Actions | 说明 |
|---------|------|
| `changeSetting({key, value})` | 动态修改设置 |
| `setPlatformTheme(key)` | 切换平台主题 |

### useTagsViewStore

| State | 类型 | 说明 |
|-------|------|------|
| `visitedViews` | `View[]` | 已访问视图列表 |
| `cachedViews` | `string[]` | 缓存的视图名称(用于keep-alive) |

| Actions | 说明 |
|---------|------|
| `addView(view)` | 添加视图(自动判断noCache/affix) |
| `delView(view)` | 关闭视图 |
| `delOthersViews(view)` | 关闭其他 |
| `delAllViews()` | 关闭全部 |

### useErrorLogStore

| State | 类型 | 说明 |
|-------|------|------|
| `logs` | `ErrorLog[]` | 错误日志列表(err/info/warning/vue) |

---

## API 接口模块

所有模块使用 `@/utils/request` 导出的 axios 实例:
- `baseURL`: 环境变量 `VITE_BASE_API`
- `withCredentials: true`
- `timeout: 10000ms`
- 请求头: `X-Token` (自动从cookie读取)

### 响应拦截器

```
res.code === 20000 → 成功, 返回data
res.code === 20001 → 警告, Promise.reject(message)
res.code === 50008|50012|50014 → Token错误, 弹窗提示重新登录
```

---

### user.js - 用户认证

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `login(data)` | POST | `/user/login` | `{username, password}` → `{token}` |
| `getInfo(token)` | GET | `/user/info` | Query: token |
| `logout()` | POST | `/user/logout` | 登出 |
| `addUser(optype, data)` | POST | `/user/adduser` | `{optype, data}` |
| `password(data)` | POST | `/user/password` | 修改密码 |
| `updateProfile(data)` | POST | `/user/profile/update` | 更新个人资料 |

### device.js - 设备管理 (12个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchDeviceList(data)` | POST | `/device/db/list` | 查询设备列表(分页/筛选) |
| `fetchMyDeviceList(data)` | POST | `/device/mydevlist` | 我的设备 |
| `queryDevice(data)` | POST | `/device/query` | 查询设备参数(EEPROM) |
| `bingDevice(data)` | POST | `/device/binddevice` | 绑定设备 |
| `changeDeviceAT(data)` | POST | `/device/at` | AT指令 |
| `changeDeviceParm(data)` | POST | `/device/change` | 修改设备参数 |
| `changeDevice1w(data)` | POST | `/device/change1w` | 修改1W模块 |
| `changeDevice2w(data)` | POST | `/device/change2w` | 修改2W模块 |
| `fetchDeviceStats(data)` | POST | `/device/stats` | 设备统计 |
| `createDevice(data)` | POST | `/device/create` | 创建设备 |
| `updateDevice(data)` | POST | `/device/update` | 更新设备 |
| `deleteDevice(data)` | POST | `/device/delete` | 删除设备 |

### groups.js - 群组管理 (9个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchGroupList(data)` | POST | `/group/list` | 公共群组列表 |
| `fetchGroupDevicesList(data)` | POST | `/group/device/list` | 群组内设备列表 |
| `fetchGroupListMini(data)` | POST | `/group/list/mini` | 迷你群组列表 |
| `fetchMyGroupList(data)` | POST | `/room/list` | 我的房间列表 |
| `joinGroup(data)` | POST | `/group/joinGroup` | 加入群组 |
| `fetchGroupStats(data)` | POST | `/group/stats` | 群组统计 |
| `createGroup(data)` | POST | `/group/create` | 创建群组 |
| `updateGroup(data)` | POST | `/group/update` | 更新群组 |
| `deleteGroup(data)` | POST | `/group/delete` | 删除群组 |

### relay.js - 中继频率 (4个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchRelayList(data)` | POST | `/relay/list` | 频率列表 |
| `createRelay(data)` | POST | `/relay/create` | 添加频率 |
| `updateRelay(data)` | POST | `/relay/update` | 更新频率 |
| `deleteRelay(data)` | POST | `/relay/delete` | 删除频率 |

### server.js - 服务器管理 (5个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchServerList(data)` | POST | `/server/list` | 服务器列表 |
| `fetchServerStats(data)` | POST | `/server/stats` | 服务器统计 |
| `createServer(data)` | POST | `/server/create` | 创建服务器 |
| `updateServer(data)` | POST | `/server/update` | 更新服务器 |
| `deleteServer(data)` | POST | `/server/delete` | 删除服务器 |

### employee.js - 用户管理 (8个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchEmployeeList(data)` | POST | `/user/list` | 用户列表 |
| `fetchEmployeeAllList(data)` | POST | `/user/alllist` | 全部用户列表 |
| `fetchEmployee(id)` | GET | `/user/detail` | 用户详情 |
| `fetchEmployeeListsByRole(role)` | GET | `/user/emplistbyrole` | 按角色查询 |
| `createEmployee(data)` | POST | `/user/create` | 创建用户 |
| `updateEmployee(data)` | POST | `/user/update` | 更新用户 |
| `deleteEmployee(data)` | POST | `/user/delete` | 删除用户 |
| `changearea(data)` | POST | `/user/changearea` | 变更区域 |

### register.js - 注册管理 (7个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `createReg(data)` | POST | `/user/reg/create` | JSON格式注册 |
| `createRegUpload(data)` | POST | `/user/reg/create` | multipart上传注册 |
| `listReg(data)` | POST | `/user/reg/list` | 注册列表 |
| `getImage(data)` | POST | `/user/reg/image/get` | 获取注册图片 |
| `updateReg(data)` | POST | `/user/reg/update` | 更新注册 |
| `addReg(data)` | POST | `/user/reg/add` | 审批通过(创建用户) |
| `deleteReg(data)` | POST | `/user/reg/delete` | 删除注册 |

### homepage.js - 首页CMS (12个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `fetchHomepageSections()` | GET | `/api/homepage/sections` | 公开板块列表 |
| `fetchHomepageAnnouncements(params)` | GET | `/api/homepage/announcements` | 公开公告列表 |
| `fetchHomepageAnnouncement(id)` | GET | `/api/homepage/announcements` | 公告详情 |
| `fetchAdminSections()` | GET | `/api/admin/homepage/sections` | 管理员板块列表 |
| `updateAdminSection(data)` | POST | `/api/admin/homepage/sections/update` | UPSERT板块 |
| `deleteAdminSection(data)` | POST | `/api/admin/homepage/sections/delete` | 删除板块 |
| `createAnnouncement(data)` | POST | `/api/admin/homepage/announcements/create` | 创建公告 |
| `updateAnnouncement(data)` | POST | `/api/admin/homepage/announcements/update` | 更新公告 |
| `deleteAnnouncement(data)` | POST | `/api/admin/homepage/announcements/delete` | 删除公告 |
| `uploadHomepageImage(file)` | POST | `/api/admin/homepage/images/upload` | 上传图片(FormData) |
| `fetchHomepageImages()` | GET | `/api/admin/homepage/images/list` | 图片列表 |
| `deleteHomepageImage(data)` | POST | `/api/admin/homepage/images/delete` | 删除图片 |

### billing.js - 计费 (7个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `getBillingInfo()` | GET | `/billing/info` | 计费状态+我的信息 |
| `fetchBillingPackages()` | GET | `/billing/packages/list` | 套餐列表 |
| `createBillingPackage(data)` | POST | `/billing/packages/create` | 创建套餐 |
| `updateBillingPackage(data)` | POST | `/billing/packages/update` | 更新套餐 |
| `deleteBillingPackage(data)` | POST | `/billing/packages/delete` | 删除套餐 |
| `createBillingOrder(data)` | POST | `/billing/order/create` | 创建支付订单 |
| `queryBillingOrder(data)` | POST | `/billing/order/query` | 查询订单状态 |

### role.js - 角色权限 (5个接口)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `getRoutes()` | GET | `/roles/routes` | 获取路由配置 |
| `setRoutes(data)` | POST | `/roles/updateroutes` | 保存路由配置 |
| `getRoles()` | GET | `/roles/list` | 角色列表 |
| `addRole(data)` | POST | `/roles/create` | 创建角色 |
| `updateRole(id, data)` | PUT | `/roles/create?key=${id}` | 更新角色 |
| `deleteRole(id)` | DELETE | `/roles/create?key=${id}` | 删除角色 |

### 其他API模块

| 模块 | 接口数 | 关键函数 |
|------|--------|----------|
| `platform.js` | 2 | `getplatforminfo()`, `fetchPlatformList()` |
| `dataquery.js` | 2 | `fetchAccountList()`, `fetchTotalStats()` |
| `weixin.js` | 3 | `phonecode()`, `fetchWeiXinMsgByOpenID()`, `fetchWeiXinMsgContent()` |
| `operatorlog.js` | 1 | `fetchOperatorLogList()` |
| `alipay.js` | 1 | `purchasealipay()` |
| `article.js` | 5 | 文章CRUD+PV统计 |
| `notices.js` | 7 | 通知CRUD+审核+发送 |
| `remote-search.js` | 2 | 用户搜索+交易列表 |
| `report.js` | 8 | 各类统计报表 |

---

## 页面详解

### 登录门户 (`views/login/index.vue`)

大型登录门户页面，包含以下功能模块:

**功能特性**:
- 品牌展示(Logo、名称、描述)
- 用户名/密码登录(大写锁定检测)
- 语言切换按钮(zh/en)
- 6套平台主题切换器
- 实时平台统计面板(在线设备/连接客户端/音频订阅)
- 浮动面板系统(支持拖拽/缩放/关闭/层级管理):
  - **支持链接面板**: NRL官网、BH4TDV淘宝店、73HAM App、NRL iOS App、NRL Desktop、NRL保姆、QQ群
  - **监控面板**: WebSocket实时通话监控
  - **服务器列表面板**: 显示所有互联服务器(排序:本地优先→在线优先→名称)
- 注册对话框(嵌入式RegisterView)
- 页脚(ICP备案、技术支持、版权)
- 微信小程序浮层二维码

### 仪表盘 (`views/dashboard/index.vue`)

```
┌──────────────────────────────────────────────────────┐
│  4个统计卡片                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 总设备    │ │ 在线设备  │ │ 在线浏览器 │ │ 音频订阅  ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
├──────────────────────────────────────────────────────┤
│  CMS公告区域 (最近5条)                                  │
├──────────────────────────────────────────────────────┤
│  实时监控面板 (RealtimeMonitorPanel)                    │
└──────────────────────────────────────────────────────┘
```

### 设备管理 (`views/pub/device.vue`)

最复杂的页面之一，支持:

**列表功能**:
- 呼号搜索、群组筛选、在线过滤
- 表格/卡片视图切换
- 列: ID, 呼号-SSID(在线/离线标识), DMR-ID, 状态(收/发按钮), 优先级, 名称, QTH, 当前群组, RF类型, 频道, 型号, 总通话时间, 总流量, 最近通话时长, 最近通话时间

**对话框**:
- **编辑对话框**: 名称、DMR-ID、群组、优先级、型号、RF类型、频道名
- **参数修改对话框**: 
  - IP/密码设置(本地IP、网关、子网掩码、DNS、目标域名、呼号-SSID)
  - 设备设置(DCD选择、PTT启用、PTT反转、尾音、继电器、码率、按键功能等)
  - Moto信道选择
  - 1W模块设置(接收/发射频率、接收/发射CTCSS、SQL等级、音量、MIC灵敏度/加密)
  - 2W模块设置(接收/发射频率、CTCSS、音量、省电、SQL、MIC、TOT)
  - 中继模板快捷应用(applyrelay/applyrelay2w)
- **AT指令对话框**: 50+ AT命令(AT+CALL/AT+FREQ/AT+DUPLEX/AT+APRS等), 每个命令有独立输入和文档说明

**状态控制**:
- `updateStatus()`: 位掩码切换(bit0=禁收, bit1=禁发)

### 群组管理 (`views/pub/groups.vue`)

卡片式群组浏览:

**功能**:
- 群组名称搜索
- 群组卡片: 类型渐变色头部、名称、在线设备数/总设备数、类型标签
- "我要加入"按钮 → 弹窗显示可加入的设备(在线/离线)
- "已加入设备(x)"按钮 → 弹窗显示已加入设备列表

### 中继频率 (`views/pub/relay.vue`)

**功能**:
- 名称/创建者搜索
- 表格/卡片视图切换
- 表格列: ID、名称、上行/下行频率、TX/RX CTCSS、创建者、状态、创建/更新时间、备注、操作
- 创建/编辑对话框: 名称、上下行频率、TX/RX CTCSS选择器(39个标准CTCSS频率)、备注

### 续费页面 (`views/renew/index.vue`)

**功能**:
- 用户信息摘要(呼号/姓名/过期时间/状态标签)
- 套餐选择(卡片式, 显示月数/名称/价格)
- 创建订单 → 显示微信支付二维码
- 订单状态轮询(每5秒自动查询)
- 支付成功自动更新

### 操作日志 (`views/log/operatorlog.vue`)

**功能**:
- 操作员下拉筛选(异步加载)
- 事件类型搜索
- 日期范围选择器
- 表格/卡片视图切换
- 排序(时间倒序)

### 管理后台页面 (views/setup/)

| 页面 | 功能 |
|------|------|
| `groups.vue` | 公共群组CRUD(名称/类型/密码/白名单/备注) |
| `server.vue` | 服务器CRUD |
| `users.vue` | 用户管理(姓名/呼号/DMRID/MDCID/角色/状态) |
| `register.vue` | 注册审批(查看/通过/拒绝, 查看执照图片) |
| `billing-packages.vue` | 套餐管理(名称/月数/单价/状态) |
| `role.vue` | 角色管理 + 路由权限编辑器 |

---

## 组件系统

### 平台专用组件

#### LivePlatformStats
> 三列实时统计卡片(在线设备/连接客户端/音频订阅), 可选居中布局
```html
<LivePlatformStats :online-devices="5" :connected-clients="3" :total-subs="10" :centered="true" />
```

#### RealtimeMonitorPanel
> WebSocket实时通话监控面板
- Props: 无(自管理WebSocket连接)
- 功能: 显示所有可访问房间(含活跃状态和发言人数), 订阅/取消订阅房间
- 数据: 房间列表(roomStates), 最近通话(recentCalls), 连接状态(wsConnected), 全局统计(wsStats)
- WebSocket: `wss://<host>/api/ws/monitor?token=<JWT>`

### 布局组件

#### Layout (`layout/index.vue`)
```
┌──────────────────────────────────────────┐
│ Navbar (面包屑/全屏/语言/主题/用户菜单)    │
├──────────────────────────────────────────┤
│ Sidebar │ AppMain (<router-view>)        │
│ (菜单树) │  ┌─ TagsView ──────────────┐  │
│         │  │ Tab1 │ Tab2 │ Tab3 │ ... │  │
│         │  └──────────────────────────┘  │
│         │  ┌─ 页面内容 ───────────────┐  │
│         │  │  <router-view> +         │  │
│         │  │  <keep-alive>            │  │
│         │  │  </keep-alive>           │  │
│         │  └──────────────────────────┘  │
├──────────────────────────────────────────┤
│ MobileTabBar (仅移动端显示)               │
└──────────────────────────────────────────┘
```

#### Sidebar
- SidebarItem.vue: 递归菜单项渲染
  - 无子菜单 → Link.vue
  - 有子菜单 → el-sub-menu + 递归 SidebarItem
- 支持图标、隐藏菜单(meta.hidden)、alwaysShow
- Logo.vue: 侧边栏Logo(展开/收起时自适应)

#### Navbar
- 汉堡菜单(切换侧边栏)
- 面包屑导航
- 全屏切换(Screenfull)
- 语言选择器(LangSelect)
- 布局大小选择器(SizeSelect)
- 平台主题选择器
- 用户头像下拉菜单(资料/退出)

#### TagsView
- 已访问视图标签页
- 右键菜单: 关闭/关闭其他/关闭全部
- 滚动面板(ScrollPane)
- 与 keep-alive 缓存联动

### 通用组件

| 组件 | 路径 | 功能 |
|------|------|------|
| BackToTop | components/BackToTop | 回到顶部按钮(滚动超过300px显示) |
| Breadcrumb | components/Breadcrumb | 基于路由的面包屑 |
| Charts/Keyboard | components/Charts | 键盘式图表 |
| Charts/LineMarker | components/Charts | 带标记的折线图 |
| Charts/MixChart | components/Charts | 柱状+折线混合图表 |
| DndList | components/DndList | 拖拽排序列表(vuedraggable) |
| DragSelect | components/DragSelect | 拖拽多选 |
| Dropzone | components/Dropzone | 文件拖放上传区 |
| ErrorLog | components/ErrorLog | 错误日志查看面板 |
| GithubCorner | components/GithubCorner | GitHub角标 |
| Hamburger | components/Hamburger | 侧边栏切换汉堡图标 |
| HeaderSearch | components/HeaderSearch | 全局搜索(基于Fuse.js模糊搜索路由) |
| ImageCropper | components/ImageCropper | 图片裁剪工具 |
| JsonEditor | components/JsonEditor | CodeMirror JSON编辑器 |
| Kanban | components/Kanban | 看板组件(vuedraggable) |
| LangSelect | components/LangSelect | 语言选择器下拉 |
| MDinput | components/MDinput | Material Design风格输入框 |
| MarkdownEditor | components/MarkdownEditor | Markdown编辑器(tui.editor) |
| MobileTabBar | components/MobileTabBar | 移动端底部导航(5个Tab) |
| Pagination | components/Pagination | 分页组件(配合el-table) |
| PanThumb | components/PanThumb | 头像缩略图(带过渡动画) |
| RightPanel | components/RightPanel | 右侧设置面板 |
| Screenfull | components/Screenfull | 全屏切换 |
| Share/DropdownMenu | components/Share | 分享下拉菜单 |
| SizeSelect | components/SizeSelect | Element Plus组件尺寸选择器 |
| Sticky | components/Sticky | 粘性定位容器 |
| SvgIcon | components/SvgIcon | SVG图标组件(自动导入) |
| TextHoverEffect/Mallki | components/TextHoverEffect | 文字动画效果 |
| ThemePicker | components/ThemePicker | Element Plus主题颜色选择器 |
| Upload/SingleImage | components/Upload | 单图上传(3个版本) |
| UploadExcel | components/UploadExcel | Excel文件上传解析 |

---

## 工具函数

### request.js - Axios封装

```js
// 创建 instance
baseURL: VITE_BASE_API
withCredentials: true
timeout: 10000

// 请求拦截器
添加 X-Token 头 (从cookie读取Admin-Token)

// 响应拦截器
code === 20000 → 成功, resolve(data)
code === 20001 → 失败, reject(message)
code === 50008|50012|50014 → Token错误, 弹窗提示+登出
```

### index.js - 工具函数集 (32个)

| 函数 | 说明 |
|------|------|
| `parseTime(time, cFormat)` | 日期格式化 `{y}-{m}-{d} {h}:{i}:{s}` |
| `formatTime(time, option)` | 相对时间("刚刚"/"X分钟前"/"X小时前") |
| `getQueryObject(url)` | URL query → Object |
| `param(json)` | Object → URL query string |
| `param2Obj(url)` | URL query → Object |
| `html2Text(val)` | 剥离HTML标签 |
| `objectMerge(target, source)` | 深度合并对象 |
| `toggleClass(element, className)` | 切换CSS类 |
| `getTime(type)` | type='start'=90天前, 其他=今天 |
| `debounce(func, wait, immediate)` | 防抖函数 |
| `deepClone(source)` | 简易深拷贝 |
| `uniqueArr(arr)` | Set去重 |
| `createUniqueString()` | 时间戳+随机→base32 |
| `hasClass/addClass/removeClass` | DOM类操作 |
| `beginDate(begindate, count)` | 日期计算 |
| `firstDate()` | 当月第一天 |
| `lastDate()` | 当月最后一天 |
| `GetTimeDiff(startTime, endTime)` | "HH:MM"字符串差值(分钟) |
| `formatDate(date, fmt)` | 日期格式化(yyyy-MM-dd hh:mm:ss) |
| `Date2Week(date)` | 日期→星期几 |
| `returnIndex(id, array)` | 按ID查找数组下标 |
| `ValueFilter(type, array)` | 按ID查找选项名称 |
| `jsGetAge(strBirthday)` | 年龄计算 |
| `formatFileSize(fileSize)` | B/KB/MB/GB格式化 |
| `formatVoiceTime(voicetime)` | ms/sec/min/hr语音时间格式化 |

### system.js - 系统常量

**deviceTypeOptions**: 设备类型 (未知/中继/热点/APP/WEB)

**deviceModelOptions**: 设备型号 (50+种)
- NRL-2100/2200/2300/3188/3688/2600
- ESP32系列(LyraT/ES8388/MAX98357A/无屏/OLED/带屏)
- 软件终端(73HAM/NRL互联/NRL工具集/NRL保姆)
- 服务器类型(专用服务器/PC/小主机/树莓派/虚拟机/阿里云/腾讯云/华为云)
- Windows/Linux/Android通用

**deviceRFTypeOptions**: RF类型(无射频/1W模块/2W模块/Moto/Yaesu/ICOM/其他)

**groupTypeOptions**: 群组类型
```
0: 公共房间, 1: 中继互联, 2: 设备互联, 4: 数模互联
5: 俱乐部, 6: 车友会, 7: 会议组, 8: 私人房间, 100: 其他
```

**deviceStatusOptions**: 设备状态(禁收/禁发)

**serverTypeOptions**: 服务器类型(专用服务器/普通PC/小主机/树莓派/虚拟机/阿里云/腾讯云/华为云)

**ATREADMEOptions**: AT命令文档 (~50个命令)
```
AT+FREQ  - 频率设置
AT+CALL  - 呼号设置
AT+APRS  - APRS配置
AT+DUPLEX - 双工模式
AT+GROUP  - 加入群组
AT+RESET  - 恢复出厂
AT+REBOOT - 重启设备
AT+VERSION - 查询版本
AT+STATUS - 查询状态
AT+RF     - 射频参数
...
```

### ctcss.js - CTCSS亚音

39个标准CTCSS频率 (67.0Hz ~ 250.3Hz):
```
67.0, 69.3, 71.9, 74.4, 77.0, 79.7, 82.5, 85.4, 88.5, 91.5,
94.8, 97.4, 100.0, 103.5, 107.2, 110.9, 114.8, 118.8, 123.0,
127.3, 131.8, 136.5, 141.3, 146.2, 151.4, 156.7, 162.2,
167.9, 173.8, 179.9, 186.2, 192.8, 203.5, 210.7, 218.1,
225.7, 233.6, 241.8, 250.3
```

### theme.js - 主题管理

```js
setElementPlusTheme(color)  // 设置Element Plus主题色(色板计算)
setPlatformTheme(key)       // 设置平台主题(6套之一)
getThemePrimary(key)        // 获取主题主色
```

### validate.js - 表单验证

| 函数 | 说明 |
|------|------|
| `isExternal(path)` | 外部链接检测(http/mailto/tel) |
| `validUsername(str)` | 始终true |
| `validURL(url)` | URL正则 |
| `validLowerCase/UpperCase/Alphabets` | 大小写/字母验证 |
| `validEmail(email)` | 邮箱正则 |
| `isString/isArray` | 类型检测 |
| `checkMaxVal(rule, value, cb)` | 0-1000数值验证 |
| `checkMaxAmount(rule, value, cb)` | 0-1000000金额验证 |

---

## 指令系统

### v-clipboard
> 剪贴板操作, 基于 Clipboard.js
```html
<button v-clipboard="text" v-clipboard:success="onCopy" v-clipboard:error="onError">
```
- `arg`: 'success'/'error' 回调
- 支持 `cut` 动作
- 提供 `copy` 和 `success/error` 事件

### v-el-drag-dialog
> Element Plus对话框拖拽
```html
<el-dialog v-el-drag-dialog>
```
- 拖拽对话框标题栏
- 限制在屏幕边界内
- 触发 `dragDialog` 事件

### v-el-height-adaptive-table
> 表格自适应高度
```html
<el-table v-el-height-adaptive-table="{bottomOffset: 30}">
```
- 自动适应视口高度
- 可配置底边距偏移

### v-permission
> 角色权限控制
```html
<div v-permission="['admin']">仅管理员可见</div>
```
- 检查用户角色数组 ∩ 所需角色数组
- 无权限则删除DOM元素

### v-sticky
> 粘性定位
```html
<div v-sticky="{stickyTop: 0, zIndex: 10}">
```
- CSS sticky + position:fixed降级

### v-waves
> 点击水波纹效果
```html
<div v-waves> <!-- 默认center模式 -->
<div v-waves.hit> <!-- 点击位置模式 -->
```

---

## 国际化

### 配置

```js
// lang/index.js
locale: cookie → navigator.language → 'en'
messages: { zh, en }
```

### 使用

```js
// 模板
{{ $t('route.dashboard') }}
{{ generateTitle('device') }}

// 页面标题
getPageTitle('device')  // → "设备 - HAM互联"
```

### 翻译覆盖 (565行)

| 模块 | 翻译内容 |
|------|----------|
| route | 路由名称(仪表盘/设备管理/群组/中继/服务器/用户/注册/日志/计费) |
| server | 服务器相关(名称/IP/端口/状态/类型) |
| device | 设备相关(呼号/SSID/优先级/QTH/型号/RF类型/频道) |
| group | 群组相关(房间/加入/设备数) |
| relay | 中继相关(上行/下行/CTCSS) |
| login | 登录(用户名/密码/登录/注册/记住我) |
| user | 用户(姓名/手机/呼号/DMRID/MDCID/角色/头像) |
| components | 组件(导出/搜索/全屏/语言/大小) |
| permission | 权限(角色/路由/分配) |
| errorLog | 错误日志 |
| excel | Excel(导出/导入/文件名/自动列宽) |
| theme | 主题(夜间/日间/绿色/橙色/粉色/紫色) |

---

## 样式与主题

### 6套平台主题

在 `styles/themes.js` 中定义, 每套主题包含约60个CSS自定义属性:

| 主题 | 主色 | 描述 |
|------|------|------|
| `default` | #3f8dff | 深空科技 (Dark Tech) - 默认 |
| `dark` | #4f8cff | 夜间阅读 |
| `light` | #2563eb | 日间阅读 |
| `green` | #10b981 | 绿色环保 |
| `orange` | #f97316 | 橙色温馨 |
| `pink` | #ec4899 | 粉雾霓光 |
| `purple` | #8b5cf6 | 紫曜星云 |

每套主题定义:
- `--nrl-primary`, `--nrl-accent`, `--nrl-accent-2`
- `--nrl-surface-*` 系列 (表面颜色)
- `--nrl-border-*` 系列 (边框颜色)
- `--nrl-accent-*` 系列 (强调色透明度)
- `--nrl-sidebar-*` 系列 (侧边栏颜色)
- `--nrl-text-*` 系列 (文本颜色)
- 阴影系统 (`--nrl-shadow-*`)

### Element Plus主题

通过 `setElementPlusTheme(color)` 动态计算:
- `--el-color-primary` 及其9个衍生色
- `--el-color-primary-light-1` ~ `light-9`
- `--el-color-primary-dark-2`

### 全局样式 (styles/index.scss)

```scss
// 基础
body: font Manrope / PingFang SC
box-sizing: border-box

// 工具类
.fr, .fl, .pr-5, .pl-5
.block, .pointer, .clearfix
.app-container (页面容器)
.pagination-container (分页容器)
.text-center
.sub-navbar (子导航)
.link-type (链接样式)
.filter-container (筛选区域样式)
```

---

## WebSocket 集成

### 实时通话监控 (RealtimeMonitorPanel)

```
连接: wss://<host>/api/ws/monitor?token=<JWT>
协议: JSON消息

客户端→服务端:
  {"action":"subscribe","room_keys":["public:0"]}
  {"action":"unsubscribe","room_keys":["public:0"]}
  {"action":"ping"}

服务端→客户端:
  {"type":"snapshot","rooms":[...],"recent_calls":[...],"subscriptions":[...],"connected_clients":5,"online_devices":10}
  {"type":"room_state","room":{"room_key":"public:0","room_name":"公共大厅","active":true,"speakers":[...]}}
  {"type":"recent_calls","recent_calls":[...]}
  {"type":"stats","total_subs":5,"connected_clients":3,"online_devices":10}
```

### Codec2 WASM 音频解码

前端通过 Web Worker + Emscripten WASM 实现浏览器端 Codec2 音频实时解码，支持 5 种码率模式（700C/1300/1600/2400/3200 bps），无需服务器端转码即可在浏览器中播放超低码率数字语音。

**解码流水线**:

```
NRL WebSocket Binary帧 → Codec2 Worker → 解码为 Float32 PCM → AudioContext 播放
```

**构建 Codec2 WASM** (`scripts/build-codec2-wasm.sh`):

```bash
# 需要安装 emsdk (Emscripten)
cd scripts
./build-codec2-wasm.sh
# 产物: public/wasm/codec2.js + public/wasm/codec2.wasm
```

**编码器架构** (`src/workers/`):

| 文件 | 编码 | 说明 |
|------|------|------|
| `alawDecode.worker.js` | G.711 A-law | 查表法解码, 256条目表 |
| (计划) `codec2Decode.worker.js` | Codec2 全系列 | WASM 解码, 5种码率可选 |



### Dashboard WebSocket测试 (chat.vue)

```
连接: ws://121.5.149.170:9998/ws
功能: 发送文本消息, 显示回复(大写回声)
```

---

## 构建与部署

### Vite配置要点

```js
// vite.config.js
base: '/'
resolve.alias: '@' → 'src/'

// 开发
server.port: 9527
server.proxy: '/dev-api' → 'https://js.nrlptt.com/'

// 构建代码分割
chunks:
  'xlsx': xlsx/xlsx-style
  'element-plus': element-plus
  'echarts': echarts
  'codemirror': codemirror
  'vendor': vue/vue-router/pinia/axios/nprogress

// 测试
test.environment: 'jsdom'
test.setupFiles: 'tests/setup.js'
```

### 自动导入

```js
// 组件自动导入
unplugin-vue-components + ElementPlusResolver
// 生成: src/components.d.ts

// API自动导入
unplugin-auto-import + ElementPlusResolver
// 生成: src/auto-imports.d.ts
```

### Service Worker

```js
// App.vue mounted
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### 生产部署

```bash
# 构建
npm run build:prod
# 输出: dist/

# 部署到 nginx
cp -r dist/* /var/www/nrllink/

# nginx配置
location / {
    root /var/www/nrllink;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | 3.5 |
| 构建 | Vite | 7 |
| 状态管理 | Pinia | 3 |
| 路由 | Vue Router | 5 |
| UI库 | Element Plus | 2.13 |
| 图表 | ECharts | 6 |
| HTTP | Axios | 1.13 |
| 国际化 | Vue I18n | 11 |
| Excel | XLSX | 0.18 |
| 拖拽 | VueDraggable | 4 |
| 编辑器 | CodeMirror | 6 |
| 上传 | Dropzone | 5 |
| 微信 | weixin-js-sdk | 1.6 |
| UUID | uuid | 11 |
| 进度条 | NProgress | |
| 剪贴板 | clipboard | 2 |
| 模糊搜索 | fuse.js | 7 |
| JSZip | jszip | 3 |
| Sass | sass | 1.83 |
| 测试 | Vitest | |
| 代码检查 | ESLint | |
| SVG优化 | SVGO | |

---

## 相关项目

| 项目 | 说明 |
|------|------|
| nrllink-78ham | Go 后端服务(本前端对接的后端) |
| 78ham-Android | Android客户端(73HAM) |
| 78ham-Desktop | 桌面客户端 |
| 78ham-ardptt | Arduino PTT控制器 |

## 许可证

MIT License

Copyright (c) 2017-present BH4RPN
