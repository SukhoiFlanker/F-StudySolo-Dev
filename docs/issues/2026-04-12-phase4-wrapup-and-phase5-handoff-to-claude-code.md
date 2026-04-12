# 2026-04-12 Phase 4 收口与 Phase 5 交接给 Claude Code

> 文档编码：UTF-8（无 BOM） / LF
> 目的：把当前仓库在 `2026-04-12` 的真实进度、边界、测试基线、下一阶段主线与禁区一次性同步清楚，后续可直接交给 Claude Code 接手

---

## 1. 背景与交接目的

当前这条 lane 的目标不是继续扩新功能，也不是继续深挖 `code-review-agent` 的 Phase 4B 细枝末节，而是：

1. 把已经完成的 `code-review-agent` Phase 4B 治理收口稳定下来
2. 把 `final-plan`、更新日志和 `project-context` 与代码真实状态对齐
3. 形成一份足够详细的交接说明，让后续 Claude Code 能直接从 Phase 5 主线起跑

这意味着：

- **不要再把注意力放回“大型重构”**
- **不要再把注意力放回“继续补子 Agent 骨架”**
- **不要默认继续深挖 `code-review-agent` 的 4B 细节**

当前 owner 的合理下一主线已经转为：

- `Task 5.1 Agent Gateway`
- `Task 5.3 根级治理`
- `Task 5.4 文档与代码对齐`
- `Task 5.5 CI/CD 增强`

`Task 5.2 Wiki` 由小陈并行推进，子 Agent 扩展与新骨架迁移不是当前 owner lane。

---

## 2. 当前真实状态总览

截至 `2026-04-12`，当前仓库的阶段判断应以如下结论为准：

- **Phase 0**：完成
- **Phase 1**：完成，契约已冻结
- **Phase 2**：完成，后端核心重构已落地
- **Phase 3**：完成，前端架构重构工程主线已落地，剩少量手动 smoke
- **Phase 4A**：主线完成，节点 manifest-first 与版本治理基线已在位，仅剩 `workflow-meta.ts` 的 deprecate 长尾
- **Phase 4B（当前 owner 侧）**：已在责任边界内收口，不再继续深挖，除非发现阻塞 Gateway 的真实缺口
- **Phase 5**：对当前 owner 而言已可启动，不需要等更多子 Agent 骨架

最重要的现实判断：

1. `code-review-agent` 已经足够作为 Gateway 的**首个集成对象**
2. 当前大头不再是 Agent 内核细化，而是**平台集成、治理、文档对齐和 CI**
3. “其他子 Agent 的骨架/迁移”不是当前 owner 的主线责任

---

## 3. Phase 2 / 3 / 4 已完成事项

### 3.1 Phase 2：后端核心重构

- `backend/app/api/` 已按 `auth / workflow / ai / admin` 等分组重构
- AI Chat 已合并为 `backend/app/api/ai/chat.py`
- Workflow 路由已重组为 `backend/app/api/workflow/`
- LLM 服务主线已切到 `backend/app/services/llm/`
- 后端目录结构已具备作为 Phase 5 Gateway 宿主的稳定基础

### 3.2 Phase 3：前端架构重构

- `frontend/src/features/`、`services/`、`stores/` 新结构已落地
- TypedEventBus 已作为跨域事件通信主线
- workflow 节点渲染已转向 manifest-first
- 当前只剩少量手动 smoke，并不阻塞 Phase 5 平台集成准备

### 3.3 Phase 4A：节点系统单一事实源

- 节点自动发现机制已存在
- `/api/nodes/manifest` 已返回 `display_name / renderer / version / changelog`
- 前端 NodeStore 动态分组已接到 manifest
- 官方节点版本治理基线已形成

### 3.4 Phase 4B：`code-review-agent` 当前 owner 侧已完成闭环

当前已完成的闭环包括：

1. repo-aware 同序风格等价 identifier canonicalization
2. unknown-rule `Title` / `Fix` groundedness canonicalization
3. known-rule ID canonicalization
4. slash-equivalent path canonicalization
5. style-equivalent evidence anchoring canonicalization
6. style-equivalent live finding identity canonicalization
7. live evidence governance truth / display truth separation
8. slash-equivalent live evidence anchoring canonicalization

---

## 4. `code-review-agent` 当前真实能力、边界与残余限制

### 4.1 当前已具备

- `GET /health`
- `GET /health/ready`
- `GET /v1/models`
- `POST /v1/chat/completions`
- non-stream / SSE stream
- API Key 校验
- 多文件 unified diff 感知
- 结构化 `review_target / repo_context` 输入治理
- 7 类本地规则审查
- `heuristic / upstream_reserved / upstream_openai_compatible` 三种 backend seam
- 真实 OpenAI-compatible upstream non-stream / streaming 调用
- live upstream findings 治理与 strict fallback
- repo-context forwarding governance
- style-equivalent / slash-equivalent 的关键治理收口

### 4.2 当前明确不做

- 运行时读取本地仓库文件
- embedding / AST / 跨文件推理
- provider usage 透传
- provider model 暴露
- Gateway 本身
- `/api/agents/*` 主后端接入层

### 4.3 当前需要记住的治理语义

- 最终 dedupe identity 已不再使用原始展示文本，而是走 canonical identity truth
- live evidence 的治理真相与展示真相已经拆开
- final finding 的展示仍然遵守 **first-win**：同 identity duplicate 只保留第一条，`Evidence:` / `Fix:` 保留第一条原文
- live evidence anchoring 已支持 slash-equivalent path-like token，但仍拒绝 basename-only、absolute-vs-relative、case mismatch 等宽松匹配

---

## 5. 当前测试基线与验证命令

当前必须以这条命令和结果作为真实基线：

```bash
pytest agents/code-review-agent/tests -q
```

结果：

```text
177 passed
```

如果后续 Claude Code 在继续工作时动到了 `agents/code-review-agent/`，必须至少回到这条基线，不允许回退。

---

## 6. 当前工作区注意事项

当前工作区里存在大量**无关脏文件**。Claude Code 接手时，必须先看 `git status --short`，不要把这些文件混进后续任务：

- `docs/项目规范与框架流程/...`
- `shared/...`
- `frontend/public.zip`
- `frontend/public (2).zip`
- 其他未纳入当前 lane 的随机修改

当前 Claude Code 的默认原则应为：

1. **只 touch 当前任务需要的文件**
2. **只 stage 当前任务明确包含的文件**
3. **不要顺手清理无关脏文件**
4. **所有中文文档继续保持 UTF-8（无 BOM）**

---

## 7. 明确不在 Claude 当前首轮范围内的内容

Claude Code 接手后的第一轮工作，默认**不在范围内**的内容包括：

- 重开 Phase 2 或 Phase 3 的大型重构
- 继续深挖 `code-review-agent` 的 4B 细节
- 给 `code-review-agent` 增加本地仓库读取、embedding、AST、跨文件推理
- 补齐所有其他 Agent 的骨架或迁移
- 一次性实现完整 Wiki 全部内容
- 顺手清理整个仓库的旧文档和脏文件

只有在发现**明确阻塞 Gateway 的真实缺口**时，才允许回头补极小范围的 `code-review-agent` 修正。

---

## 8. Phase 5 任务总览与建议优先顺序

### 8.1 当前 owner 的默认优先级

1. **Task 5.1 Agent Gateway**
2. **Task 5.3 根级治理**
3. **Task 5.4 文档与代码对齐**
4. **Task 5.5 CI/CD 增强**
5. **Task 5.2 Wiki** 由小陈并行

### 8.2 为什么优先做 5.1

因为当前已经具备一个真实可调用的 `code-review-agent`，这意味着：

- 不需要等待更多 Agent 骨架
- 可以直接验证 Agent Gateway 的注册、调用、健康检查、SSE 透传和超时链
- 可以让 Phase 5 从“文档计划”变成“可运行平台主线”

### 8.3 为什么 5.3 / 5.4 / 5.5 紧随其后

因为一旦进入 Gateway 开发，根级治理、文档对齐和 CI 边界就会立刻变成并行协作中的真实问题，不提前收口会导致后续改动互相打架。

---

## 9. 建议 Claude 首轮执行清单

建议 Claude Code 第一轮按下面顺序行动：

1. 只读核实当前仓库真实状态
2. 阅读以下事实源：
   - `docs/team/refactor/final-plan/00-索引.md`
   - `docs/team/refactor/final-plan/phase-4-nodes-and-agents.md`
   - `docs/team/refactor/final-plan/phase-5-integration.md`
   - `docs/Updates/2026-04-12.md`
   - `.agent/skills/project-context/SKILL.md`
   - `agents/code-review-agent/src/core/agent.py`
   - `agents/code-review-agent/tests/test_review_logic.py`
   - `agents/code-review-agent/tests/test_contract.py`
3. 再核对一次 `git status --short`
4. 明确当前任务只围绕 `Phase 5.1 / 5.3 / 5.4 / 5.5`
5. 如果没有新的阻塞性事实，再输出一份**decision-complete** 的 Phase 5 起步计划
6. 若用户允许实施，再从 `Task 5.1 Agent Gateway` 的最小闭环开始

---

## 10. 风险点与禁区

### 10.1 风险点

- 文档与代码真实状态可能再次轻微漂移，因此 Claude 必须先核实再动手
- 当前工作区有无关脏文件，极易误 stage
- `code-review-agent` 已有较大未共享上下文积累，若 Claude 不先读事实源，容易误判“还需要继续做 4B”

### 10.2 禁区

- 不要把 `code-review-agent` 当作下一阶段的主战场
- 不要把“继续补 Agent 骨架”当作当前 owner 的默认任务
- 不要把 Wiki 当作设计源
- 不要在没有确认的前提下顺手重命名目录树、切 monorepo 结构、引入更大的工作区工具链

---

## 11. 建议的文档 / 代码阅读顺序

建议 Claude Code 按下面顺序读：

1. `docs/team/refactor/final-plan/00-索引.md`
2. `docs/team/refactor/final-plan/phase-4-nodes-and-agents.md`
3. `docs/team/refactor/final-plan/phase-5-integration.md`
4. `docs/Updates/2026-04-12.md`
5. `.agent/skills/project-context/SKILL.md`
6. `backend/app/api/router.py`
7. `agents/code-review-agent/src/core/agent.py`
8. `agents/code-review-agent/tests/test_review_logic.py`
9. `agents/code-review-agent/tests/test_contract.py`

这样可以先建立阶段判断，再进入代码与测试层面的真实上下文。

---

## 12. 建议给 Claude 的可直接复制提示词正文

下面这段提示词可以直接复制给 Claude Code：

```text
请深度结合以下事实源，只基于仓库真实状态继续推进，不要重开大重构：

1. docs/team/refactor/final-plan/00-索引.md
2. docs/team/refactor/final-plan/phase-4-nodes-and-agents.md
3. docs/team/refactor/final-plan/phase-5-integration.md
4. docs/Updates/2026-04-12.md
5. .agent/skills/project-context/SKILL.md

你需要先确认以下事实：

- Phase 2 已完成
- Phase 3 已完成
- Phase 4A 主线已完成
- 当前 owner 侧的 code-review-agent Phase 4B 已在责任边界内收口
- 当前 code-review-agent 测试基线为：pytest agents/code-review-agent/tests -q -> 177 passed
- 当前 owner 的下一主线不再是继续深挖 code-review-agent 4B，而是 Phase 5

关键边界：

- 不要碰 Gateway 之外的无关主线
- 不要继续给 code-review-agent 增加本地仓库读取、embedding、AST、跨文件推理
- 不要默认继续补其他 Agent 骨架；那不是当前 owner 主线
- 不要碰无关脏文件，先自己检查 git status --short
- 所有中文文档保持 UTF-8（无 BOM）

你当前的默认目标应是：

1. 深度核实 Phase 5 的当前起点是否已经成熟
2. 围绕 Task 5.1 Agent Gateway 给出一份 decision-complete 的正式实施方案
3. 同时梳理 Task 5.3 / 5.4 / 5.5 的依赖关系、推荐顺序和最小闭环
4. 除非你发现阻塞 Gateway 的真实缺口，否则不要回头继续深挖 code-review-agent 的 4B 细节

你在第一轮回答里优先输出：

- 当前真实状态总结
- 还剩哪些主任务
- 为什么下一步应是 Phase 5.1 / 5.3 / 5.4 / 5.5
- 一份可直接执行的正式计划

如果你认为必须继续动 code-review-agent，请先明确指出具体阻塞点、影响范围和为什么它真的阻塞 Gateway，而不是泛化地建议“继续完善 Agent”。
```
