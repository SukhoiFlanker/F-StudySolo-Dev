# 火山方舟（Ark）OpenAI 兼容接入

## 官方资料（与规划直接相关）

- 火山方舟大模型推理（文档目录入口）  
  https://www.volcengine.com/docs/82379/1099522
- 兼容 OpenAI SDK 调用（官方）  
  https://www.volcengine.com/docs/82379/1330626
- Base URL 及 API Key（官方）  
  https://www.volcengine.com/docs/82379/1414148

> 检索日期：2026-02-26

## 与 StudySolo 规划的映射

- 规划中已固定：
  - `VOLCENGINE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
  - `VOLCENGINE_MODEL=doubao-2.0-pro`
- 结论：可按 OpenAI 兼容方式接入到统一 `openai` SDK 客户端。

## 接入检查清单

1. 控制台确认模型接入点已创建并可用。
2. API Key 或临时 Key 权限覆盖目标接入点。
3. 后端将 Ark 的 `base_url` 与模型名放入可配置项。
4. 流式场景配合 SSE 输出，避免网关缓冲。

## 风险提示

- Ark 文档体系分为“控制面 API（接入点/密钥）”与“推理调用面”，排错时要区分。
- 项目中的 `ark.cn-beijing.volces.com/api/v3` 需与实际区域和账号权限一致。
