# Issue 管理规范

> 最后更新：2026-04-11

## 1. 全员 Issue 提交义务

每位团队成员在开发过程中发现的任何问题，必须及时通过下方对应流程处理。

## 2. Issue 标签体系

| 标签 | 优先级 | 说明 |
|------|--------|------|
| `🟠 bug` | P1 | 功能性 Bug |
| `🟡 enhancement` | P2 | 功能改进建议 |
| `🔵 docs` | P3 | 文档问题 |
| `⚪ question` | — | 讨论与提问 |

> ⚠️ **安全漏洞严禁在公开 Issue 中提交**，详见第 3 节。

## 3. 安全漏洞上报流程

安全问题（RLS 缺失、权限泄露、注入风险等）属于 **P0 紧急事项**，须走**私密渠道**上报，不得在公开 Issue 中描述漏洞细节。

**上报方式（按优先级）：**
1. **GitHub Security Advisory**：仓库 → Security → Advisories → New draft security advisory
2. **直接联系羽升**：微信 / 钉钉私信

详细格式要求见 [SECURITY.md](../../../.github/SECURITY.md)。

## 4. Bug Issue 模板

```markdown
## 🟠 Bug 报告

**问题描述：**

**复现步骤：**
1.
2.

**预期行为：**

**实际行为：**

**环境：**
- OS:
- Browser:
- 后端版本:
```

## 4. Bug Issue 模板

```markdown
## 🟠 Bug 报告

**问题描述：**

**复现步骤：**
1.
2.

**预期行为：**

**实际行为：**

**环境：**
- OS:
- Browser:
- 后端版本:
```
