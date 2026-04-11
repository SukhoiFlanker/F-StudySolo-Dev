# 2026-04-11 Phase 4B：code-review-agent 外部 LLM 预留层总结

## 1. 背景

在 `Phase 4B` 已经连续完成：

1. 最小可运行 agent 样板
2. 本地规则型 `code-review-agent`
3. repo-aware 前置输入能力
4. findings 纯文本输出模板稳定化

之后，`final-plan` 里对 `Phase 4B` 最自然的下一步已经不是继续回头补 NodeStore，也不是抢跑 Gateway，而是为后续真实外部 LLM 接入建立内部边界。

因此这一轮没有直接做真实 provider 调用，而是先做一个更小、更稳的闭环：**外部 LLM 预留层**。

## 2. 本轮目标

本轮目标是把 `code-review-agent` 内部的 review backend 结构抽清楚，但继续保持默认行为不变：

1. 不改 OpenAI-compatible HTTP 协议
2. 不发真实网络请求
3. 不接 Gateway
4. 不新增依赖
5. 默认仍走本地 heuristics

## 3. 已完成的代码闭环

核心文件：

- `agents/code-review-agent/src/config.py`
- `agents/code-review-agent/src/core/agent.py`
- `agents/code-review-agent/src/core/upstream_review.py`
- `agents/code-review-agent/src/endpoints/completions.py`

本轮已完成：

### 3.1 新增 backend 配置入口

agent 自己的 `Settings` 现在支持：

- `review_backend`
- `upstream_model`
- `upstream_base_url`
- `upstream_api_key`
- `upstream_timeout_seconds`

这些配置都继续沿用 `AGENT_` 前缀环境变量，而不是复用主后端的 provider 配置体系。

### 3.2 抽出 review backend seam

`CodeReviewAgent` 现在支持两个内部 backend：

1. `heuristic`
   - 默认后端
   - 直接执行现有本地规则审查
2. `upstream_reserved`
   - 预留后端
   - 当前只构建 upstream request payload
   - 随后立即回退到 `heuristic`

这意味着后续真实接 LLM 时，不需要再重做 agent 内部主流程切分。

### 3.3 抽出共享准备步骤

`agent.py` 内部已经把这些步骤收敛成共享准备过程：

1. 最新 `user` 消息提取
2. structured payload 解析
3. `review_input` 构建
4. backend 复用准备结果

这一步对下一轮很关键，因为真实 upstream 调用和本地 heuristic 现在已经可以站在同一个准备产物上工作。

### 3.4 新增 upstream request builder

`src/core/upstream_review.py` 现在负责：

1. 生成 future OpenAI-compatible SDK 可直接消费的 `messages`
2. 固定 system prompt
3. 将 `review_target` 与 `repo_context` 规范化写入 request payload

虽然本轮还没有真正发请求，但 request 结构已经可以作为下一轮真实接入的基础。

## 4. 测试与验证

核心测试文件：

- `agents/code-review-agent/tests/test_review_logic.py`
- `agents/code-review-agent/tests/test_contract.py`

本轮新增并锁定了这些场景：

1. 显式 `heuristic` backend 与默认行为一致
2. `upstream_reserved` backend 输出与 `heuristic` 完全一致
3. legacy / malformed 输入仍走当前 fallback 准备逻辑
4. upstream request builder 稳定包含：
   - `review_target path`
   - `repo_context` 路径
   - 原始 target 内容
5. 启用 `upstream_reserved` 时，non-stream / SSE 接口仍保持现有契约

验证结果：

- `pytest agents/code-review-agent/tests -q`
  - `38 passed`

## 5. 当前边界

本轮仍然没有进入以下范围：

1. 不接真实外部 LLM
2. 不发真实 HTTP 请求
3. 不改 `requirements.txt`
4. 不接 Gateway
5. 不改 `agents.yaml`
6. 不改 `/api/agents/*`

因此本轮后的正确口径是：

1. `code-review-agent` 已具备外部 LLM 接入的内部预留层
2. 当前只是“结构先到位”，不是“外部模型已接通”
3. 下一轮可以在这个 seam 上做真实 non-stream upstream 调用，并保留本地 heuristics 作为回退路径

## 6. 提交

- `539f616 feat(code-review-agent): add upstream review seam`
