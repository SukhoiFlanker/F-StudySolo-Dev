# 功能拓展 + 侧边栏 Pin 系统 — 详细规划

> 最后更新：2026-03-27
> 编码要求：UTF-8 (无BOM) + LF
> 状态：分析完成，待实施

---

## 0. 名词统一

| 旧名词 | 新名词 | 英文标识 |
|--------|--------|---------|
| 插件商店 | 功能拓展 | Extensions |
| 安装 / 已安装 | 固定 / 取消固定 | Pin / Unpin |
| 插件 | 拓展 | Extension |

前端所有 `plugins` → `extensions`，数据库新表用 `extensions` 前缀。

---

## 1. 核心产品逻辑

### 1.1 概念

- **功能拓展**（Extensions）：官方开发的独立功能模块（文档预览、Anki 导出等）
- 用户可以将某个拓展**固定 (Pin)** 到左侧 Activity Bar，获得一级入口
- 未固定的拓展统一收纳在"功能拓展"面板的列表中
- 部分核心面板**不可移动**（永远在 Activity Bar）

### 1.2 不可移动项（IMMOVABLE）

以下面板始终固定在 Activity Bar，用户不可 pin/unpin：

| 面板 | SidebarPanel 值 | 原因 |
|------|----------------|------|
| 用户头像 | `user-panel` | 全局身份入口 |
| AI 对话 | `ai-chat` | 核心交互入口 |
| 节点商店 | `node-store` | 工作流核心入口 |
| 执行面板 | `execution` | 运行时必需 |
| 功能拓展 | `extensions`（原 `plugins`） | 自身不可移走 |

### 1.3 可移动项（PINNABLE）

以下面板默认 Pin 在 Activity Bar，但用户可以 Unpin 到功能拓展面板内：

| 面板 | SidebarPanel 值 | 默认状态 |
|------|----------------|---------|
| 工作流列表 | `workflows` | Pinned |
| 工作流样例 | `workflow-examples` | Pinned |
| 仪表盘 | `dashboard` | Pinned |
| 钱包设置 | `wallet` | Pinned |
| 设置 | `settings` | Pinned |

### 1.4 官方拓展（通过功能拓展面板安装/Pin 到侧边栏）

首批官方拓展（P1 阶段）：

| 拓展 ID | 名称 | 图标 (lucide) | 描述 | Tier |
|---------|------|-------------|------|------|
| `doc_preview` | 文档预览 | `FileText` | 浏览器内预览 Word/PDF | free |
| `anki_export` | Anki 导出 | `GraduationCap` | 闪卡导出为 .apkg | pro |
| `study_report` | 学习报表 | `BarChart3` | 工作流历史可视化 | pro |

后续扩展（P2）：Notion 同步、Zotero 导入、知识图谱……

---

## 2. 数据库设计

### 2.1 用户目前 Activity Bar 的面板 PIN 配置

**方案：扩展现有 `use-panel-store`（Zustand persist → localStorage）**

不需要新建数据库表。PIN 配置是纯 UI 偏好，存 localStorage 即可（与现有 `use-panel-store` 的 `persist` 机制一致）。未来如需跨设备同步，可加一列到 `ss_user_preferences`，但 MVP 不需要。

### 2.2 官方拓展注册表（新表）

```sql
-- supabase/migrations/YYYYMMDD_add_extensions.sql

-- ① 拓展注册表（官方维护，不由用户创建）
CREATE TABLE IF NOT EXISTS ss_extensions (
    id              TEXT PRIMARY KEY,              -- 'doc_preview', 'anki_export'
    name            TEXT NOT NULL,                 -- '文档预览'
    description     TEXT NOT NULL DEFAULT '',
    icon            TEXT NOT NULL DEFAULT 'Puzzle', -- lucide icon 名
    version         TEXT NOT NULL DEFAULT '1.0.0',
    tier_required   TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'max'
    is_active       BOOLEAN NOT NULL DEFAULT true, -- 官方可以下架
    display_order   INTEGER NOT NULL DEFAULT 0,    -- 排序权重
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ② 用户拓展安装记录
CREATE TABLE IF NOT EXISTS ss_user_extensions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    extension_id    TEXT NOT NULL REFERENCES ss_extensions(id) ON DELETE CASCADE,
    is_pinned       BOOLEAN NOT NULL DEFAULT false, -- true = 固定到 Activity Bar
    pin_order       INTEGER NOT NULL DEFAULT 99,     -- 在 Activity Bar 中的位置
    installed_at    TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT ss_user_extensions_unique UNIQUE (user_id, extension_id)
);

-- ③ 索引
CREATE INDEX IF NOT EXISTS ss_user_extensions_user_idx ON ss_user_extensions(user_id);

-- ④ RLS
ALTER TABLE ss_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ss_user_extensions ENABLE ROW LEVEL SECURITY;

-- 拓展表：所有人都能读（公开目录）
CREATE POLICY "所有人可查看拓展列表"
    ON ss_extensions FOR SELECT USING (true);

-- 用户拓展表：只能操作自己的
CREATE POLICY "用户可查看自己的拓展"
    ON ss_user_extensions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可安装拓展"
    ON ss_user_extensions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的拓展"
    ON ss_user_extensions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可卸载拓展"
    ON ss_user_extensions FOR DELETE
    USING (auth.uid() = user_id);
```

### 2.3 初始数据（Seed）

```sql
-- 在同一迁移文件末尾

INSERT INTO ss_extensions (id, name, description, icon, version, tier_required, display_order)
VALUES
  ('doc_preview',  '文档预览', '在浏览器内直接预览 Word/PDF 文件', 'FileText',      '1.0.0', 'free', 1),
  ('anki_export',  'Anki 导出',  '将闪卡导出为 Anki 卡组格式',       'GraduationCap', '0.9.0', 'pro',  2),
  ('study_report', '学习报表', '工作流历史数据可视化分析',          'BarChart3',     '0.5.0', 'pro',  3)
ON CONFLICT (id) DO NOTHING;
```

---

## 3. 后端 API

### 3.1 路由文件

```
backend/app/api/extensions.py  ← 新增
```

### 3.2 API 端点

| Method | Path | 功能 | 鉴权 |
|--------|------|------|------|
| `GET` | `/api/extensions/` | 获取所有拓展列表（公开） | ✅ |
| `GET` | `/api/extensions/installed` | 获取当前用户已安装拓展 | ✅ |
| `POST` | `/api/extensions/{id}/install` | 安装拓展 | ✅ |
| `DELETE` | `/api/extensions/{id}/uninstall` | 卸载拓展 | ✅ |
| `PATCH` | `/api/extensions/{id}/pin` | 固定/取消固定到侧边栏 | ✅ |

### 3.3 API 注册

```python
# backend/app/api/router.py 新增：
from app.api.extensions import router as extensions_router
router.include_router(extensions_router, prefix="/extensions", tags=["extensions"])
```

### 3.4 Pydantic 模型

```python
# backend/app/models/extensions.py

class ExtensionInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    version: str
    tier_required: str
    is_active: bool

class UserExtension(BaseModel):
    extension_id: str
    is_pinned: bool
    pin_order: int
    installed_at: datetime

class PinRequest(BaseModel):
    is_pinned: bool
    pin_order: int | None = None
```

---

## 4. 前端改动明细

### 4.1 名称重构（机械替换）

| 文件 | 改动 |
|------|------|
| `use-panel-store.ts` | `SidebarPanel` union 中 `'plugins'` → `'extensions'` |
| `Sidebar.tsx` | `UPPER_PANELS` 中 `plugins` → `extensions`，label `'插件'` → `'功能拓展'` |
| `PluginsPanel.tsx` | 文件重命名为 `ExtensionsPanel.tsx` |
| `Sidebar.tsx` L35 | `import PluginsPanel` → `import ExtensionsPanel` |
| `Sidebar.tsx` L274 | `activeSidebarPanel === 'plugins'` → `'extensions'` |
| `PANEL_LABELS` | `'plugins': '插件'` → `'extensions': '功能拓展'` |

### 4.2 `use-panel-store.ts` — 新增 PIN 状态

```typescript
// 新增类型（在现有 SidebarPanel union 旁边）

/** 可被 pin/unpin 的面板集合 */
const PINNABLE_PANELS: SidebarPanel[] = [
  'workflows', 'workflow-examples', 'dashboard', 'wallet', 'settings',
];

/** 不可移动的面板 */
const IMMOVABLE_PANELS: SidebarPanel[] = [
  'user-panel', 'ai-chat', 'node-store', 'execution', 'extensions',
];

// 新增 state 字段：
interface PanelState {
  // ...现有...

  /** 用户固定在 Activity Bar 的可移动面板 */
  pinnedPanels: SidebarPanel[];

  /** Pin 操作 */
  pinPanel: (panel: SidebarPanel) => void;
  unpinPanel: (panel: SidebarPanel) => void;
}

// 默认值：
pinnedPanels: ['workflows', 'workflow-examples', 'dashboard', 'wallet', 'settings'],

// actions:
pinPanel: (panel) =>
  set((state) => ({
    pinnedPanels: state.pinnedPanels.includes(panel)
      ? state.pinnedPanels
      : [...state.pinnedPanels, panel],
  })),

unpinPanel: (panel) =>
  set((state) => ({
    pinnedPanels: state.pinnedPanels.filter((p) => p !== panel),
    // 如果当前正在看被 unpin 的面板，切到 extensions
    activeSidebarPanel:
      state.activeSidebarPanel === panel ? 'extensions' : state.activeSidebarPanel,
  })),
```

### 4.3 `Sidebar.tsx` — Activity Bar 动态渲染

```typescript
// 当前逻辑（静态）：
// UPPER_PANELS.map(...)

// 改为：
const { pinnedPanels } = usePanelStore();

// Activity Bar 上区渲染逻辑：
// 1. 不可移动面板（固定顺序）
// 2. 用户 Pin 的面板（pinnedPanels 顺序）
// 3. 功能拓展入口（永远在最后一个上区位置）
```

### 4.4 右键菜单（Activity Bar 图标右键）

```
新增组件：SidebarActivityContextMenu.tsx

触发条件：右键 Activity Bar 中 PINNABLE_PANELS 的图标
菜单内容：
  ┌──────────────────────────────┐
  │  取消固定（移至功能拓展列表）  │
  └──────────────────────────────┘

实现方式：
  在 renderActivityButton 中加入 onContextMenu handler
  用 createPortal 渲染到 body
  调用 unpinPanel(panel)
```

### 4.5 `ExtensionsPanel.tsx`（原 PluginsPanel）重构

```
结构：
  ├── 搜索框（可选 P2）
  ├── 已安装拓展列表（真实数据，来自 API）
  │   └── 每个卡片：
  │       ├── icon + name + version + author
  │       ├── 描述
  │       └── [固定到侧边栏] / [取消固定] 按钮
  ├── 未安装拓展（可安装）
  │   └── 每个卡片：
  │       └── [安装] 按钮
  └── 被 Unpin 的内置面板列表
      └── workflows / dashboard 等
      └── 每项：[固定到侧边栏] 按钮

数据来源：
  已安装拓展：GET /api/extensions/installed
  所有拓展：GET /api/extensions/
  被 unpin 的面板：pinnedPanels 差集（纯前端）
```

### 4.6 前端新增文件清单

```
前端新增/修改文件一览：

新增：
├── components/layout/sidebar/ExtensionsPanel.tsx    ← 重写（替换 PluginsPanel）
├── components/layout/sidebar/SidebarActivityContextMenu.tsx  ← 右键菜单
├── features/extensions/
│   ├── hooks/use-extensions.ts       ← 拉取拓展列表
│   ├── services/extensions.service.ts ← API 调用
│   └── index.ts
└── types/extensions.ts               ← 类型定义

修改：
├── stores/use-panel-store.ts          ← 新增 pinnedPanels + pin/unpin
├── components/layout/Sidebar.tsx      ← 动态渲染 + 右键支持
└── components/layout/sidebar/PluginsPanel.tsx  ← 删除（被 ExtensionsPanel 替代）

删除：
└── components/layout/sidebar/PluginsPanel.tsx
```

---

## 5. 交互 Spec

### 5.1 Activity Bar 右键

```
用户行为：右键点击 Activity Bar 上的可移动图标
系统响应：弹出右键菜单
  ┌──────────────────────────────┐
  │  📌 取消固定                  │
  └──────────────────────────────┘
用户点击：
  → store.unpinPanel(panel)
  → 该图标从 Activity Bar 消失
  → 该面板出现在 Extensions Panel 的 "已固定面板" 列表中
  → Toast: "仪表盘已移至功能拓展"
```

### 5.2 功能拓展面板内的固定按钮

```
已 unpin 的内置面板：
  按钮文案："固定到侧边栏"
  点击后：
  → store.pinPanel(panel)
  → 该图标回到 Activity Bar
  → 从 Extensions Panel 列表移除
  → Toast: "仪表盘已固定到侧边栏"

官方拓展（如文档预览）：
  未安装状态："安装" 按钮
  点击后：
  → POST /api/extensions/doc_preview/install
  → 刷新拓展列表
  → 卡片变为 "已安装" + "固定到侧边栏" 按钮
  点击 "固定到侧边栏"：
  → PATCH /api/extensions/doc_preview/pin { is_pinned: true }
  → 该拓展的 icon 出现在 Activity Bar
  → 点击图标 → 打开对应 feature 面板（如 DocPreviewPanel）
```

### 5.3 拓展面板组件的动态加载

```typescript
// 当用户点击 Activity Bar 上的拓展图标时
// Sidebar.tsx 需要动态渲染对应的 Panel 组件

// 方案：在 Sidebar.tsx 增加动态 import 映射

const EXTENSION_PANELS: Record<string, React.LazyExoticComponent<React.FC>> = {
  doc_preview: lazy(() => import('@/features/doc-preview/components/DocPreviewPanel')),
  anki_export: lazy(() => import('@/features/anki/components/AnkiPanel')),
  study_report: lazy(() => import('@/features/study-report/components/ReportPanel')),
};

// 渲染时：
if (activeSidebarPanel && activeSidebarPanel in EXTENSION_PANELS) {
  const ExtPanel = EXTENSION_PANELS[activeSidebarPanel];
  return <Suspense><ExtPanel /></Suspense>;
}
```

---

## 6. 实施阶段

### Phase 1（MVP — 2天）

1. 名称重构：`plugins` → `extensions`（机械替换）
2. `use-panel-store` 增加 `pinnedPanels` + `pinPanel/unpinPanel`
3. `Sidebar.tsx` 动态读取 `pinnedPanels` 渲染 Activity Bar
4. 右键菜单组件 `SidebarActivityContextMenu.tsx`
5. `ExtensionsPanel.tsx` 用本地静态数据（不接 API）

### Phase 2（后端 + 真实数据 — 1天）

1. 数据库迁移 + Seed
2. 后端 API 路由 + Service
3. 前端 `ExtensionsPanel` 对接真实 API
4. 安装 / Pin / Unpin 按钮真实工作

### Phase 3（官方拓展功能 — 逐个开发）

每个官方拓展按 C 型 SOP 独立开发：
1. 文档预览（`doc_preview`）
2. Anki 导出（`anki_export`）
3. 学习报表（`study_report`）

---

## 7. Checklist

```
□ 名称重构
  □ SidebarPanel union: 'plugins' → 'extensions'
  □ PANEL_LABELS 更新
  □ Sidebar.tsx 引用更新
  □ PluginsPanel.tsx → ExtensionsPanel.tsx

□ PIN 系统前端
  □ use-panel-store 增加 pinnedPanels / pinPanel / unpinPanel
  □ pinnedPanels 存入 localStorage persist
  □ Sidebar.tsx Activity Bar 动态渲染
  □ SidebarActivityContextMenu.tsx 右键菜单
  □ IMMOVABLE_PANELS 检查（这些不能出现在右键菜单）

□ 功能拓展面板
  □ ExtensionsPanel.tsx 替代 PluginsPanel.tsx
  □ 展示已安装拓展 + 未安装拓展 + 被 unpin 的面板
  □ 固定/取消固定按钮

□ 数据库
  □ ss_extensions 表 + RLS
  □ ss_user_extensions 表 + RLS
  □ Seed 数据

□ 后端 API
  □ extensions.py 路由
  □ 注册到 router.py
  □ Pydantic 模型
  □ Service 层

□ 安全
  □ 所有 API 有 Depends(get_current_user)
  □ RLS 全覆盖
  □ Tier 检查（pro 拓展不允许 free 用户安装）
```

---

## 8. 关键代码位置参考

| 内容 | 文件路径 |
|------|---------|
| 面板状态 Store | `frontend/src/stores/use-panel-store.ts` |
| 主侧边栏 | `frontend/src/components/layout/Sidebar.tsx` |
| 当前插件面板 | `frontend/src/components/layout/sidebar/PluginsPanel.tsx` |
| 后端路由注册 | `backend/app/api/router.py` |
| C型插件 SOP | `docs/项目规范与框架流程/功能流程/新增AI工具/C型-插件-SOP.md` |
