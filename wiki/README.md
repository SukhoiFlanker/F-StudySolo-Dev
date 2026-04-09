# StudySolo Wiki

> 官方文档站 — 嵌入主前端 Next.js Route Group
> 状态：**规划中，待 Phase 5 实施**

---

## ⚠️ 方案变更说明

原始规划（独立子项目，端口 2039）**已废弃**。

经过 Phase 5 架构讨论，决定改为 **Next.js Route Group 方案**，嵌入到主 `frontend/` 中：

| 维度 | 旧方案（废弃） | 新方案（采用） |
|------|-------------|-------------|
| 位置 | `wiki/`（独立 Next.js 应用） | `frontend/src/app/(wiki)/wiki/` |
| 端口 | 2039（独立） | 2037（复用主前端） |
| 部署 | 独立 PM2 + Nginx | 复用主前端 PM2 |
| Auth | 需要跨域 SSO | 天然共用 |
| 维护 | 独立 package.json | 共用依赖 |

**原因**：当前团队规模（3人），独立子项目维护成本远大于收益。

---

## 规划地址

- 本地：`http://localhost:2037/wiki`
- 生产：`https://studyflow.1037solo.com/wiki/`

---

## 实施时间：Phase 5（参考计划）

详细实施计划见：[`docs/team/refactor/final-plan/wiki-init-plan.md`](../docs/team/refactor/final-plan/wiki-init-plan.md)

---

## 目标目录结构（实施后）

```
frontend/src/app/
├── (main)/              ← 主应用（不变）
└── (wiki)/              ← Wiki Route Group（Phase 5 新增）
    └── wiki/
        ├── layout.tsx          ← Wiki 专属布局（不继承主 sidebar）
        ├── page.tsx            ← Wiki 首页（文档目录）
        └── [...slug]/
            └── page.tsx        ← 动态文档路由

frontend/src/components/wiki/   ← Wiki 专属组件
    ├── WikiSidebar.tsx
    ├── WikiSearch.tsx
    ├── WikiTOC.tsx
    └── WikiMDXComponents.tsx

docs/wiki-content/              ← 文档内容源（全体成员维护）
    ├── getting-started/
    │   ├── quick-start.md
    │   └── concepts.md
    ├── guides/
    │   ├── creating-workflows.md
    │   └── using-nodes.md
    └── api/
        └── reference.md
```

---

## Wiki 内容原则

- **Wiki 是发布源**，不是设计文档主战场
- 设计文档继续在 `docs/team/` 中维护
- Wiki 只发布**已稳定**的内容，面向终端用户
- 推送到 `docs/wiki-content/` 的内容经 CI 自动同步展示

---

## Nginx 配置（预留，未启用）

```nginx
location ^~ /wiki/ {
    proxy_pass http://127.0.0.1:2037;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

> 注意：与旧方案不同，此处 proxy_pass 指向 **2037**（主前端），而非独立的 2039 端口。
