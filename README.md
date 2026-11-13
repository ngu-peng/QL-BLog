# QL-BLog

一个简化版的微博式本地日志应用：**Node.js + Vue 3 + Pinia**，数据保存在浏览器 Local Storage 中，无后端。全项目采用 **TDD（测试驱动开发）** 方式编写。

> 旧版（纯 HTML/CSS/JS 原生实现）保留在 Git 历史的 Initial commit 中。

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器（默认 http://localhost:5173）
npm test        # 运行全部测试（Vitest）
npm run build   # 生产构建
npm run preview # 预览生产构建产物
```

## 功能清单

- **发布日志**：可选标题 + 正文（500 字以内），点击「发 布」或按 `Ctrl + Enter`
- **查看日志**：按时间倒序，显示标题、正文、发布时间与字数
- **编辑日志**：卡片内联编辑，保存后同步持久化
- **删除日志**：单条删除（二次确认）、一键清空（二次确认）
- **数据持久化**：刷新/关闭浏览器后日志保留（Local Storage，key 为 `ql-blog-posts`）
- **健壮性**：空内容不可发布、本地数据损坏自动降级为空列表并清理、存储失败给出界面提示、连续发布 id 防重复

## 技术栈

| 层 | 技术 |
|---|---|
| 构建 | Vite 8 |
| 视图 | Vue 3（Composition API + `<script setup>`） |
| 状态管理 | Pinia 4（setup store 写法） |
| 测试 | Vitest 5 + @vue/test-utils + jsdom |
| 存储 | 浏览器 Local Storage |

## 目录结构

```
QL-BLog/
├── index.html                    # Vite 入口 HTML
├── vite.config.mjs               # Vite 配置
├── vitest.config.mjs             # Vitest 配置（jsdom 环境）
└── src/
    ├── main.js                   # 应用入口：创建 Pinia 并挂载 App
    ├── App.vue                   # 页面骨架 + 事件协调（连接 UI 与 store）
    ├── App.spec.js               # 页面级集成测试
    ├── assets/main.css           # 全局样式（设计变量、卡片、按钮）
    ├── stores/
    │   ├── posts.js              # 日志 store：唯一数据源 + Local Storage 读写
    │   └── posts.spec.js         # store 单元测试（14 个）
    ├── components/
    │   ├── ComposerForm.vue/.spec.js  # 发布表单（6 个测试）
    │   ├── PostList.vue/.spec.js      # 日志列表 + 空状态（3 个测试）
    │   └── PostCard.vue/.spec.js      # 单条日志卡片（7 个测试）
    └── utils/format.js           # 纯工具函数（时间格式化）
```

## 架构与数据流

```
用户输入 → ComposerForm(本地表单状态) --emit publish--> App --调用--> posts store
posts store: 修改 posts 数组 → save() 写 Local Storage → computed 派生(sortedPosts/postCount)
                                                      ↘ Vue 响应式自动更新界面
页面加载 → store 创建时 load() 读 Local Storage → 渲染
```

设计要点：

- **单一数据源**：`usePostsStore` 持有全部日志，组件不重复存数据；表单输入等瞬态状态留在组件内
- **Props Down / Events Up**：`ComposerForm`/`PostList`/`PostCard` 只发事件，`App` 作为协调者调用 store action
- **computed 派生**：排序、计数、字数全部用 `computed`，不在模板里做逻辑
- **XSS 安全**：全部使用插值渲染 `{{ }}`，不使用 `v-html`

## 测试说明（TDD）

全部 36 个测试遵循 红 → 绿 流程编写：先写行为测试（失败），再实现代码使其通过。

- **store 单元测试**：`setActivePinia(createPinia())` + 真实 localStorage（jsdom 提供），覆盖持久化、增删改、脏数据兜底、id 唯一性
- **组件测试**：`@vue/test-utils` 挂载，验证禁用态、事件契约、编辑态切换
- **App 集成测试**：真实 Pinia + 真实 store action，验证发布/编辑/删除/清空全链路与 `window.confirm` 交互

开发中可运行 `npm run test:watch` 进入监听模式。

## 数据存储说明

- 日志以 JSON 数组保存在 Local Storage，key 为 `ql-blog-posts`
- 数据仅存在于当前浏览器：换设备/浏览器或清除站点数据会丢失
- 备份：F12 → Application → Local Storage → 复制 `ql-blog-posts` 的值
