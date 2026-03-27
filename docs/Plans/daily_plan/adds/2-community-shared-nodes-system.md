# 共享节点系统（社区提示词节点）— 详细规划

> 最后更新：2026-03-27
> 编码要求：UTF-8 (无BOM) + LF
> 状态：分析完成，待实施

---

## 0. 核心概念

### 0.1 定义

- **共享节点** (Community Node)：用户发布的、基于自定义提示词 + 可选知识库构建的工作流节点
- 其他用户可以将共享节点拖入自己的工作流，和官方节点一样使用
- 共享节点的 **提示词已封装**（使用者不可见、不可改），只能选择模型

### 0.2 与官方节点的对比

| 维度 | 官方节点 | 共享节点 |
|------|---------|---------|
| **创建者** | 平台开发团队 | 任何注册用户 |
| **prompt 来源** | `backend/app/nodes/xxx/prompt.md` | `ss_community_nodes.prompt`（DB） |
| **渲染器** | `AIStepNode.tsx`（共用） | `AIStepNode.tsx`（共用，泛型化） |
| **后端执行** | 每种有独立 Python class | 只有一个 `CommunityNode` class |
| **前端 NodeType** | 在 `workflow.ts` union 中硬编码 | 统一为 `'community_node'` |
| **使用者可改** | model_key、label | model_key、label |
| **使用者不可改** | — | prompt、input/output schema |
| **AI 对话生成** | ✅ 支持 | ❌ 不支持（设计决策） |

### 0.3 封装原则

```
"封装节点" = 发布者锁定以下属性：
  🔒 system_prompt   — 核心提示词
  🔒 input_schema    — 需要什么输入（字段描述）
  🔒 output_format   — 输出格式 (markdown | json)
  🔒 output_schema   — 输出字段结构（可选）
  🔒 knowledge_refs  — 关联知识库 ID（可选）

使用者只能改：
  ✅ model_key       — 用哪个模型
  ✅ label           — 画布上显示的名称
```

---

## 1. 节点商店双视图 — UI 设计

### 1.1 当前 NodeStorePanel 结构（需改造）

```
现有（NodeStorePanel.tsx）：
  ├── 搜索框
  ├── Tag 筛选器（全部 / 输入源 / AI处理 / 内容生成 / 输出存储 / 逻辑控制）
  └── 按 category 分组的官方节点列表
```

### 1.2 改造后结构

```
节点商店 — 右上角增加视图切换按钮

┌─────────────────────────────────────────┐
│  节点商店                  [默认 | 共享]  │  ← SegmentedControl 切换
├─────────────────────────────────────────┤
│                                         │
│  === 默认视图（保持不变）===              │
│  搜索框 + Tag 筛选 + 官方节点列表        │
│                                         │
│  === 共享视图（新增）===                  │
│  搜索框                                 │
│  排序：❤️ 最多点赞 | 🕐 最新发布         │
│  ┌─────────────────────────────────┐    │
│  │ [icon] Python 代码审查器         │    │
│  │ by @user123 · v1.0                │    │
│  │ 审查 Python 代码，输出问题清单     │    │
│  │ 🏷️ AI处理  ❤️ 1.2k  📥 3.4k     │    │
│  └─────────────────────────────────┘    │
│  ... (每页 10 个)                       │
│  [上一页] [1] [2] [3] ... [下一页]       │
│                                         │
│  ── 底部 ──                             │
│  [🚀 发布我的节点]                       │
└─────────────────────────────────────────┘
```

### 1.3 前端改动位置

```
修改：
  frontend/src/components/layout/sidebar/NodeStorePanel.tsx
    → 增加 SegmentedControl（Tab 切换）
    → 默认视图 = 现有代码原封不动
    → 共享视图 = 新组件 CommunityNodeList

新增：
  frontend/src/components/layout/sidebar/CommunityNodeList.tsx    ← 共享节点列表
  frontend/src/components/layout/sidebar/CommunityNodeCard.tsx    ← 单个卡片
  frontend/src/components/layout/sidebar/PublishNodeDialog.tsx    ← 发布弹窗
```

---

## 2. 数据库设计

### 2.1 共享节点表

```sql
-- supabase/migrations/YYYYMMDD_add_community_nodes.sql

-- ① 共享节点定义表
CREATE TABLE IF NOT EXISTS ss_community_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 展示信息
    name            TEXT NOT NULL,                    -- "Python 代码审查器"
    description     TEXT NOT NULL DEFAULT '',         -- "专门审查 Python 代码"
    icon            TEXT NOT NULL DEFAULT 'Bot',      -- lucide icon name（从预设池选）
    category        TEXT NOT NULL DEFAULT 'analysis', -- 'analysis' | 'generation' | 'assessment' | 'other'
    version         TEXT NOT NULL DEFAULT '1.0.0',
    
    -- 核心封装内容
    prompt          TEXT NOT NULL,                    -- System Prompt（使用者不可见）
    input_hint      TEXT NOT NULL DEFAULT '',         -- 告诉上游"需要什么输入"
    output_format   TEXT NOT NULL DEFAULT 'markdown', -- 'markdown' | 'json'
    output_schema   JSONB DEFAULT NULL,               -- JSON Schema（可选，json 格式时使用）
    
    -- 可选：知识库关联
    knowledge_refs  UUID[] DEFAULT '{}',              -- 关联的知识库 ID 列表
    
    -- 模型偏好（发布者建议，使用者可覆盖）
    model_preference TEXT NOT NULL DEFAULT 'auto',    -- 'auto' | 'fast' | 'powerful'
    
    -- 发布者可暴露的配置参数（可选 P2）
    config_schema   JSONB DEFAULT '[]',               -- 参数表单定义（类似 BaseNode.config_schema）
    
    -- 发布状态
    status          TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
    reject_reason   TEXT DEFAULT NULL,
    is_public       BOOLEAN NOT NULL DEFAULT false,   -- approved 后设为 true
    
    -- 统计
    likes_count     INTEGER NOT NULL DEFAULT 0,
    install_count   INTEGER NOT NULL DEFAULT 0,
    
    -- 时间戳
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ② 索引
CREATE INDEX IF NOT EXISTS ss_community_nodes_author_idx ON ss_community_nodes(author_id);
CREATE INDEX IF NOT EXISTS ss_community_nodes_status_idx ON ss_community_nodes(status);
CREATE INDEX IF NOT EXISTS ss_community_nodes_public_idx ON ss_community_nodes(is_public, likes_count DESC);
CREATE INDEX IF NOT EXISTS ss_community_nodes_category_idx ON ss_community_nodes(category);

-- ③ RLS
ALTER TABLE ss_community_nodes ENABLE ROW LEVEL SECURITY;

-- 公开节点所有人可读
CREATE POLICY "所有人可查看已公开的节点"
    ON ss_community_nodes FOR SELECT
    USING (is_public = true);

-- 作者可查看自己所有节点（含 pending/rejected）
CREATE POLICY "作者可查看自己的节点"
    ON ss_community_nodes FOR SELECT
    USING (auth.uid() = author_id);

-- 只有作者可创建
CREATE POLICY "用户可发布节点"
    ON ss_community_nodes FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- 只有作者可修改
CREATE POLICY "作者可更新自己的节点"
    ON ss_community_nodes FOR UPDATE
    USING (auth.uid() = author_id);

-- 只有作者可删除
CREATE POLICY "作者可删除自己的节点"
    ON ss_community_nodes FOR DELETE
    USING (auth.uid() = author_id);
```

### 2.2 点赞表

```sql
-- ④ 点赞表
CREATE TABLE IF NOT EXISTS ss_community_node_likes (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_id     UUID NOT NULL REFERENCES ss_community_nodes(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, node_id)
);

-- RLS
ALTER TABLE ss_community_node_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看点赞"
    ON ss_community_node_likes FOR SELECT
    USING (true);

CREATE POLICY "用户可点赞"
    ON ss_community_node_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可取消赞"
    ON ss_community_node_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ⑤ 点赞计数触发器（自动维护 likes_count）
CREATE OR REPLACE FUNCTION update_community_node_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ss_community_nodes SET likes_count = likes_count + 1 WHERE id = NEW.node_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ss_community_nodes SET likes_count = likes_count - 1 WHERE id = OLD.node_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_node_likes
    AFTER INSERT OR DELETE ON ss_community_node_likes
    FOR EACH ROW EXECUTE FUNCTION update_community_node_likes_count();
```

### 2.3 安装/使用记录表（可选，用于 install_count 统计）

```sql
-- ⑥ 使用记录（可选 P2，用于排行榜）
CREATE TABLE IF NOT EXISTS ss_community_node_installs (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_id     UUID NOT NULL REFERENCES ss_community_nodes(id) ON DELETE CASCADE,
    used_at     TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, node_id)
);

ALTER TABLE ss_community_node_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可记录使用"
    ON ss_community_node_installs FOR ALL
    USING (auth.uid() = user_id);
```

---

## 3. 后端 API

### 3.1 路由文件

```
backend/app/api/community_nodes.py  ← 新增
```

### 3.2 API 端点

| Method | Path | 功能 | 鉴权 | 分页 |
|--------|------|------|------|------|
| `GET` | `/api/community-nodes/` | 公开节点列表（点赞排序/分页） | ✅ | 10/页 |
| `GET` | `/api/community-nodes/mine` | 我发布的节点 | ✅ | — |
| `GET` | `/api/community-nodes/{id}` | 节点详情（不含 prompt） | ✅ | — |
| `POST` | `/api/community-nodes/` | 发布节点 | ✅ | — |
| `PUT` | `/api/community-nodes/{id}` | 更新节点（仅作者） | ✅ | — |
| `DELETE` | `/api/community-nodes/{id}` | 删除节点（仅作者） | ✅ | — |
| `POST` | `/api/community-nodes/{id}/like` | 点赞 | ✅ | — |
| `DELETE` | `/api/community-nodes/{id}/like` | 取消赞 | ✅ | — |
| `GET` | `/api/community-nodes/{id}/prompt` | **仅供后端执行调用** | ❌ internal | — |

### 3.3 重要安全约束

```
prompt 字段永远不返回给前端！

GET /api/community-nodes/ 的响应中 prompt 字段 = null
GET /api/community-nodes/{id} 的响应中 prompt 字段 = null

prompt 只在两个地方可见：
  1. 发布者自己（GET /api/community-nodes/mine）
  2. 后端 CommunityNode.execute() 内部加载

这保证了发布者的知识产权保护。
```

### 3.4 Pydantic 模型

```python
# backend/app/models/community_nodes.py

class CommunityNodeCreate(BaseModel):
    name: str
    description: str
    icon: str = 'Bot'
    category: str = 'analysis'
    prompt: str                         # 创建时必须提供
    input_hint: str = ''
    output_format: str = 'markdown'
    output_schema: dict | None = None
    model_preference: str = 'auto'
    knowledge_refs: list[str] = []

class CommunityNodePublic(BaseModel):
    """返回给前端的公开信息（不含 prompt）"""
    id: str
    author_id: str
    author_name: str                    # JOIN auth.users 获取
    name: str
    description: str
    icon: str
    category: str
    version: str
    input_hint: str
    output_format: str
    model_preference: str
    likes_count: int
    install_count: int
    is_liked: bool                      # 当前用户是否已点赞
    created_at: datetime
    # prompt 字段不在这里！

class CommunityNodeListResponse(BaseModel):
    items: list[CommunityNodePublic]
    total: int
    page: int
    pages: int

class CommunityNodeMine(CommunityNodePublic):
    """作者视图，包含 prompt"""
    prompt: str
    status: str
    reject_reason: str | None
```

### 3.5 API 注册

```python
# backend/app/api/router.py 新增：
from app.api.community_nodes import router as community_nodes_router
router.include_router(community_nodes_router, prefix="/community-nodes", tags=["community-nodes"])
```

### 3.6 分页 & 排序查询

```python
# backend/app/services/community_node_service.py

async def list_public_nodes(
    page: int = 1,
    per_page: int = 10,
    sort: str = 'likes',        # 'likes' | 'newest'
    category: str | None = None,
    search: str | None = None,
    current_user_id: str | None = None,
) -> CommunityNodeListResponse:
    query = supabase.table('ss_community_nodes') \
        .select('*, author:auth.users(email, raw_user_meta_data)') \
        .eq('is_public', True)
    
    if category:
        query = query.eq('category', category)
    if search:
        query = query.or_(f'name.ilike.%{search}%,description.ilike.%{search}%')
    
    order_col = 'likes_count' if sort == 'likes' else 'created_at'
    query = query.order(order_col, desc=True)
    
    # 分页
    offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)
    
    # 执行 + 组装响应...
```

---

## 4. 后端执行层 — CommunityNode

### 4.1 泛型节点 class

```python
# backend/app/nodes/community/node.py

from app.nodes._base import BaseNode
from app.services.community_node_service import CommunityNodeService

class CommunityNode(BaseNode):
    node_type = "community_node"
    category = "community"
    description = "社区共享节点"
    is_llm_node = True
    output_format = "markdown"
    icon = "🌐"
    color = "#8b5cf6"

    async def execute(self, node_input, llm_caller):
        """执行社区节点：从 DB 动态加载 prompt，然后走标准 LLM 流程"""

        community_node_id = node_input.node_config.get('community_node_id')
        if not community_node_id:
            yield "[错误] 缺少社区节点 ID"
            return

        # 从 DB 读取完整 prompt（只有这里可以读到）
        node_def = await CommunityNodeService.get_node_with_prompt(community_node_id)
        if not node_def:
            yield "[错误] 社区节点不存在或未审核"
            return

        # 用发布者的 prompt 替换 system prompt
        custom_prompt = node_def['prompt']
        
        # 构建标准消息格式
        user_input = node_input.get_upstream_text()
        messages = [
            {"role": "system", "content": custom_prompt},
            {"role": "user", "content": user_input},
        ]

        # 走标准 LLM 调用流程
        async for token in llm_caller(messages):
            yield token
```

### 4.2 自动注册

由于继承 `BaseNode` + `__init_subclass__`，只需确保模块被 import：

```python
# backend/app/nodes/__init__.py 中确保 import：
from app.nodes.community.node import CommunityNode  # noqa: F401
```

---

## 5. 画布集成 — 拖入与渲染

### 5.1 NodeType 扩展

```typescript
// frontend/src/types/workflow.ts

export type NodeType =
  | 'trigger_input'
  // ... 现有类型 ...
  | 'community_node';    // ← 新增
```

### 5.2 节点类型注册

```typescript
// WorkflowCanvas.tsx nodeTypes 新增：
const nodeTypes: NodeTypes = {
  // ... 现有 ...
  community_node: AIStepNode,   // ← 共用 AIStepNode 渲染器
};
```

### 5.3 workflow-meta.ts 新增 meta

```typescript
// workflow-meta.ts NODE_TYPE_META 新增：
community_node: {
  label: '社区节点',           // 画布上的默认 label（使用时会被覆盖）
  description: '社区共享的 AI 节点',
  icon: Bot,                    // 默认图标（使用时从 node.data 读取）
  theme: 'COMMUNITY',          // 新主题
},
```

### 5.4 拖入画布 — dataTransfer 协议

共享节点需要额外携带 `community_node_id`：

```typescript
// CommunityNodeCard.tsx — 拖拽开始
const handleDragStart = (e: React.DragEvent, node: CommunityNodePublic) => {
  e.dataTransfer.setData('application/studysolo-node-type', 'community_node');
  e.dataTransfer.setData('application/studysolo-community-id', node.id);
  e.dataTransfer.setData('application/studysolo-community-meta', JSON.stringify({
    name: node.name,
    icon: node.icon,
    output_format: node.output_format,
    model_preference: node.model_preference,
    input_hint: node.input_hint,
  }));
  e.dataTransfer.effectAllowed = 'move';
};
```

### 5.5 WorkflowCanvas.tsx handleDrop 改造

```typescript
// WorkflowCanvas.tsx handleDrop 修改：

const handleDrop = useCallback(
  (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/studysolo-node-type');
    if (!nodeType) return;

    const flowPos = reactFlowInstance.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });

    const store = useWorkflowStore.getState();
    store.takeSnapshot();

    const nodeId = `${nodeType}-${Date.now().toString(36)}`;

    // ── 社区节点特殊处理 ──
    if (nodeType === 'community_node') {
      const communityId = e.dataTransfer.getData('application/studysolo-community-id');
      const metaStr = e.dataTransfer.getData('application/studysolo-community-meta');
      const meta = metaStr ? JSON.parse(metaStr) : {};

      const newNode: Node = {
        id: nodeId,
        type: 'community_node',
        position: { x: flowPos.x - 176, y: flowPos.y - 70 },
        data: {
          label: meta.name || '社区节点',
          type: 'community_node',
          community_node_id: communityId,       // ← 关键：执行时用这个 ID 加载 prompt
          community_icon: meta.icon || 'Bot',
          output_format: meta.output_format || 'markdown',
          model_route: '',                      // ← 使用者可改模型
          model_preference: meta.model_preference || 'auto',
          input_hint: meta.input_hint || '',
          status: 'pending',
          output: '',
          config: {},
          system_prompt: '',                    // ← 空！prompt 不存前端
        },
      };

      store.setNodes([...store.nodes, newNode]);
      setSelectedNodeId(nodeId);
      return;
    }

    // ── 官方节点（现有逻辑不变）──
    const isLoop = nodeType === 'loop_group';
    const newNode: Node = { /* ... 现有代码 ... */ };
    store.setNodes([...store.nodes, newNode]);
    setSelectedNodeId(nodeId);
  },
  [reactFlowInstance, setSelectedNodeId]
);
```

### 5.6 AIStepNode 渲染器适配（最小改动）

```typescript
// AIStepNode.tsx — 社区节点的标题/图标显示
// 在组件内增加社区节点判断：

const isCommunityNode = node.type === 'community_node';
const displayLabel = isCommunityNode 
  ? (node.data.label || '社区节点')
  : meta.label;

// 图标：社区节点从 data 读取，官方节点从 meta 读取
const IconComponent = isCommunityNode
  ? getLucideIcon(node.data.community_icon)
  : meta.icon;
```

---

## 6. 发布流程 — 用户发布节点

### 6.1 发布入口

共享视图底部的 `[🚀 发布我的节点]` 按钮，打开 `PublishNodeDialog`。

### 6.2 发布表单字段

```
┌─────────────────────────────────────┐
│  发布我的节点                         │
├─────────────────────────────────────┤
│  节点名称 *        [______________]  │
│  描述 *            [______________]  │
│  分类 *            [▼ AI 处理    ]   │
│  图标              [▼ Bot       ]   │  ← 从 10-20 个预设 lucide icon 选
│                                     │
│  ── System Prompt（核心）──          │
│  [                                ] │
│  [  你是一个专业的 Python 代码审查    ] │
│  [  专家。用户会提交代码片段，你需要  ] │
│  [  ...                           ] │
│  [                                ] │
│                                     │
│  输入提示           [需要代码片段]    │
│  输出格式           [▼ Markdown ]    │
│  推荐模型           [▼ 自动     ]    │
│                                     │
│  [取消]                    [发布]    │
└─────────────────────────────────────┘
```

### 6.3 审核流程（MVP 可简化）

```
MVP 阶段：
  发布 → status='pending'
  管理员在 Admin 面板审核 → approved/rejected
  approved → is_public=true → 出现在共享列表

简化方案（如审核量不大）：
  发布 → 自动过 prompt 敏感词检测
  通过 → 直接 status='approved', is_public=true
  检测到敏感词 → 进入人工队列

Admin API（已有 admin 路由基础设施）：
  GET   /api/admin/community-nodes?status=pending
  PATCH /api/admin/community-nodes/{id}/review  { status, reject_reason }
```

---

## 7. 点赞交互

### 7.1 前端交互

```
用户在共享列表点赞 ❤️：
  乐观更新：likes_count + 1，图标变红
  异步请求：POST /api/community-nodes/{id}/like
  失败回滚：likes_count - 1，图标恢复

取消赞：
  乐观更新：likes_count - 1，图标恢复
  异步请求：DELETE /api/community-nodes/{id}/like
  失败回滚：likes_count + 1
```

### 7.2 后端逻辑

```python
@router.post("/{node_id}/like")
async def like_node(node_id: UUID, user=Depends(get_current_user)):
    """点赞（幂等，重复调用不报错）"""
    try:
        await supabase.table('ss_community_node_likes').insert({
            'user_id': str(user.id),
            'node_id': str(node_id),
        }).execute()
    except Exception:
        pass  # 已存在，幂等
    return {"ok": True}

@router.delete("/{node_id}/like")
async def unlike_node(node_id: UUID, user=Depends(get_current_user)):
    """取消赞"""
    await supabase.table('ss_community_node_likes') \
        .delete() \
        .eq('user_id', str(user.id)) \
        .eq('node_id', str(node_id)) \
        .execute()
    return {"ok": True}
```

---

## 8. 执行时 prompt 动态加载（核心安全机制）

### 8.1 为什么不在前端存 prompt

```
安全原因：
  画布 JSON 存储为 workflow nodes_json → Supabase
  如果 prompt 存在 nodes_json 里，RLS 允许用户读自己的 workflow
  → 用户可以直接读到 prompt 内容
  → 破坏封装

性能原因：
  长 prompt（可能 2000+ 字符）存在每个节点数据中会增大 JSON
  执行时从 DB 加载，只有执行那一刻才读取

版本更新原因：
  发布者更新 prompt 后，所有引用该节点的工作流自动生效
  不需要用户"重新拖入"
```

### 8.2 执行链路

```
前端执行请求：
  POST /api/workflow/execute
  body: { nodes_json, edges_json }
    └── 其中 community_node 的 data 包含：
        { community_node_id: "uuid", model_route: "gpt-4o", ... }
        ↑ 没有 prompt

后端 WorkflowEngine 执行到该节点时：
  CommunityNode.execute()
    → 读取 node_config.community_node_id
    → SELECT prompt FROM ss_community_nodes WHERE id = ? AND is_public = true
    → 用读到的 prompt 构建 messages
    → 调用 LLM
    → 流式返回

全程 prompt 不经过前端。
```

---

## 9. 可选图标池（预设）

发布者从以下 lucide icon 中选择一个：

```typescript
const COMMUNITY_NODE_ICONS = [
  'Bot',           // 默认
  'Brain',         // 智能分析
  'Search',        // 检索
  'FileText',      // 文档
  'Code',          // 代码
  'Languages',     // 翻译
  'PenTool',       // 写作
  'Microscope',    // 研究
  'Scale',         // 法律
  'HeartPulse',    // 医学
  'Calculator',    // 数学
  'Palette',       // 设计
  'Music',         // 音乐
  'BookOpen',      // 教育
  'Briefcase',     // 商务
  'Shield',        // 安全
] as const;
```

---

## 10. AI 对话不支持生成社区节点（设计决策文档）

### 10.1 为什么不支持

```
技术原因：
  1. ai_planner 的 system prompt 中 AVAILABLE_NODE_TYPES 是写死的
  2. 社区节点的 community_node_id 是 UUID，AI 无法猜测
  3. 用户安装的社区节点各不相同，无法统一注入 prompt
  4. 注入所有社区节点的描述会严重膨胀 context

产品原因：
  1. AI 生成结果依赖"理解节点能力" → 社区节点描述质量参差不齐
  2. AI 可能生成用户未安装的社区节点 → 画布报错
  3. MVP 阶段优先保证官方节点的 AI 生成质量

未来可能的解法（Phase 3）：
  将用户已安装的社区节点摘要（id + name + description，限 10 个）
  动态注入 ai_planner 的 available_types
  但优先级极低
```

---

## 11. 完整文件改动清单

### 后端新增

```
backend/app/
├── api/community_nodes.py              ← API 路由（增删改查 + 点赞）
├── models/community_nodes.py           ← Pydantic 模型
├── services/community_node_service.py  ← 业务逻辑
└── nodes/community/
    ├── __init__.py
    └── node.py                          ← CommunityNode 泛型执行器
```

### 后端修改

```
backend/app/
├── api/router.py                        ← 注册 community_nodes_router
└── nodes/__init__.py                    ← import CommunityNode
```

### 数据库

```
supabase/migrations/
└── YYYYMMDD_add_community_nodes.sql     ← 3 张表 + RLS + 触发器
```

### 前端新增

```
frontend/src/
├── components/layout/sidebar/
│   ├── CommunityNodeList.tsx            ← 共享节点分页列表
│   ├── CommunityNodeCard.tsx            ← 共享节点拖拽卡片
│   └── PublishNodeDialog.tsx            ← 发布弹窗
├── features/community-nodes/
│   ├── hooks/use-community-nodes.ts     ← 列表 + 点赞状态管理
│   ├── services/community-nodes.service.ts ← API 调用
│   └── index.ts
└── types/community-nodes.ts            ← TypeScript 类型
```

### 前端修改

```
frontend/src/
├── components/layout/sidebar/NodeStorePanel.tsx  ← 增加 Tab 切换
├── features/workflow/components/canvas/WorkflowCanvas.tsx
│   ├── nodeTypes 增加 community_node
│   ├── handleDrop 增加社区节点分支
│   └── createDefaultNodeData 增加社区节点
├── features/workflow/components/nodes/AIStepNode.tsx  ← 社区节点标题/图标适配
├── features/workflow/constants/workflow-meta.ts ← 增加 NODE_TYPE_META['community_node']
└── types/workflow.ts                     ← NodeType union 增加 'community_node'
```

### 总计：约 18-22 个文件

---

## 12. 实施阶段

### Phase 1（数据基础 — 1.5 天）

1. 数据库迁移（3 表 + RLS + 触发器）
2. 后端 API 路由 + Service（CRUD + 点赞）
3. Pydantic 模型
4. 路由注册

### Phase 2（前端列表视图 — 1.5 天）

1. `NodeStorePanel` 增加 Tab 切换
2. `CommunityNodeList` + `CommunityNodeCard` 组件
3. 分页 + 点赞 + 搜索
4. 拖入画布集成（dataTransfer + handleDrop 改造）

### Phase 3（后端执行 + 画布适配 — 1 天）

1. `CommunityNode` 泛型执行器
2. `AIStepNode` 社区节点渲染适配
3. `workflow-meta.ts` 增加 community_node meta
4. `NodeType` union 扩展

### Phase 4（发布流程 + 审核 — 1 天）

1. `PublishNodeDialog` 发布弹窗
2. Admin 面板审核接口
3. 敏感词自动检测（可选）

---

## 13. Checklist

```
□ 数据库
  □ ss_community_nodes 表 + RLS（5 条策略）
  □ ss_community_node_likes 表 + RLS + 触发器（自动计数）
  □ ss_community_node_installs 表（可选 P2）
  □ 索引覆盖查询场景
  □ supabase inspect 无红色警告

□ 后端 API
  □ community_nodes.py 路由（7 个端点）
  □ 每个路由有 Depends(get_current_user)
  □ 注册到 router.py
  □ prompt 字段不在公开响应中返回
  □ 分页:per_page=10, page 参数

□ 后端执行
  □ CommunityNode 继承 BaseNode
  □ execute() 中从 DB 加载 prompt
  □ 正确注册到 __init__.py

□ 前端节点商店
  □ NodeStorePanel 增加 SegmentedControl
  □ CommunityNodeList 分页列表
  □ CommunityNodeCard 拖拽支持
  □ 点赞乐观更新
  □ 搜索 + 排序（点赞/最新）

□ 前端画布集成
  □ NodeType union 增加 'community_node'
  □ nodeTypes 注册 community_node → AIStepNode
  □ NODE_TYPE_META 增加 community_node
  □ handleDrop 处理 community_node 类型
  □ AIStepNode 适配社区节点标题/图标

□ 发布流程
  □ PublishNodeDialog 表单
  □ 图标预设池
  □ Admin 审核 API

□ 安全
  □ prompt 永远不返回给前端（除了作者自己）
  □ RLS 全覆盖
  □ 敏感词检测（可选 P2）
  □ 发布频率限制（防 spam）

□ AI 对话
  □ ai_planner 不生成 community_node 类型（确认限制）
  □ AVAILABLE_NODE_TYPES 不包含 community_node
```

---

## 14. 关键代码位置参考

| 内容 | 文件路径 |
|------|---------|
| 节点类型定义 | `frontend/src/types/workflow.ts` → `NodeType` union |
| 节点元数据 | `frontend/src/features/workflow/constants/workflow-meta.ts` |
| 节点商店面板 | `frontend/src/components/layout/sidebar/NodeStorePanel.tsx` |
| 画布拖入逻辑 | `frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx` → `handleDrop` |
| 节点渲染器 | `frontend/src/features/workflow/components/nodes/AIStepNode.tsx` |
| BaseNode 基类 | `backend/app/nodes/_base.py` |
| 节点自动注册 | `backend/app/nodes/__init__.py` |
| 后端路由注册 | `backend/app/api/router.py` |
| 拖拽数据协议 | `dataTransfer key: 'application/studysolo-node-type'` + `'application/studysolo-community-id'` |
