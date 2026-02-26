# AI API 官方参考资料（StudySolo）

> 更新时间：2026-02-26（北京时间）  
> 编码：UTF-8  
> 适用阶段：项目规划 / 技术预研 / 开发实施

## 目录

### 基础规划
- [01-项目规划映射与选型.md](./01-项目规划映射与选型.md)

### 协议与 SDK
- [02-OpenAI-统一SDK与Responses接口.md](./02-OpenAI-统一SDK与Responses接口.md)

### 供应商接入（按路由优先级排列）
- [06-七牛云-QNAIGC-OpenAI兼容接入.md](./06-七牛云-QNAIGC-OpenAI兼容接入.md) ⭐ 优先级 1
- [07-优云智算-Compshare-OpenAI兼容接入.md](./07-优云智算-Compshare-OpenAI兼容接入.md) 🥈 优先级 2
- [03-火山方舟-Ark-OpenAI兼容接入.md](./03-火山方舟-Ark-OpenAI兼容接入.md) 🥉 优先级 3
- [04-阿里云百炼-DashScope-OpenAI兼容接入.md](./04-阿里云百炼-DashScope-OpenAI兼容接入.md) 4️⃣ 优先级 4

### 传输层
- [05-SSE流式链路-后端到前端.md](./05-SSE流式链路-后端到前端.md)

### 综合指南
- [多模型API接入与使用指南.md](./多模型API接入与使用指南.md)

## 说明

本目录收录与 StudySolo 直接相关的 AI API 官方资料和接入指南：

- **协议层**：OpenAI API / openai Python SDK
- **供应商层（四大平台）**：
  1. 七牛云 QNAIGC（聚合层 · 海外模型代理）
  2. 优云智算 Compshare（异构容灾层 · UCloud 独立算力）
  3. 火山方舟 Ark（免费池层 · 豆包 200W/日）
  4. 阿里云百炼 DashScope（质量保障层 · Qwen 原生宿主）
- **传输层**：SSE（FastAPI + sse-starlette + EventSource）

> 🔗 **全局规划文档**：`docs/Plans/global/多平台AI-API统一路由与容灾规划.md`
