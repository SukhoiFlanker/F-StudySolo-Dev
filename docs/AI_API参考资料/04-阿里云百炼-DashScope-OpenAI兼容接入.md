# 阿里云百炼（DashScope）OpenAI 兼容接入

## 官方文档（最新检索）

- OpenAI 兼容 Chat（How to call Qwen via OpenAI interface）  
  https://www.alibabacloud.com/help/en/model-studio/developer-reference/compatibility-of-openai-with-dashscope
- OpenAI Chat API Reference  
  https://www.alibabacloud.com/help/doc-detail/3016807.html
- OpenAI 兼容 Embedding  
  https://www.alibabacloud.com/help/en/model-studio/embedding-interfaces-compatible-with-openai
- OpenAI 兼容 Responses API  
  https://www.alibabacloud.com/help/en/model-studio/compatibility-with-openai-responses-api
- Model Studio 总览（说明支持 OpenAI 兼容）  
  https://www.alibabacloud.com/help/en/model-studio/what-is-model-studio

> 检索日期：2026-02-26

## 与 StudySolo 规划的映射

- 规划中已固定（中国内地）：
  - `DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
  - `DASHSCOPE_MODEL=qwen3-turbo`

## 接入关键点

1. 区域与 API Key 强绑定，不可混用。
2. OpenAI SDK 下只需替换 `api_key`、`base_url`、`model`。
3. 预留 embedding 接口，便于后续 RAG/记忆归档。
4. 如后续做 agent 功能，可评估百炼的 Responses 兼容接口。

## 最小示例（OpenAI SDK 方式）

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-dashscope-key",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

resp = client.chat.completions.create(
    model="qwen3-turbo",
    messages=[{"role": "user", "content": "请给我一个学习计划"}],
)

print(resp.choices[0].message.content)
```
