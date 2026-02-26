# backup 目录说明

本目录用于统一存放项目中的备份与示例文件，统一采用 UTF-8 编码。

## 存放范围

- `.backup`：历史配置、备份快照、可回滚版本。
- `.example`：模板配置、示例参数、规范样例。

## 目录结构（按功能划分）

- `config-env/`：环境变量与配置文件（如 `.env.backup`、`.env.example`）
- `database/`：数据库相关（如 `schema.backup.sql`、`seed.example.sql`）
- `api-contracts/`：接口契约样例（如 `chat.request.example.json`）
- `workflow-engine/`：工作流引擎与节点样例（如 `planner.output.example.json`）
- `deploy-ops/`：部署与运维配置（如 `nginx.backup.conf`、`gunicorn.example.py`）
- `assets-content/`：提示词、文档素材、内容模板备份

## 命名建议

统一命名格式：`模块名.用途.后缀`

示例：

- `auth.env.example`
- `prod.nginx.backup.conf`
- `kb.schema.backup.sql`
- `planner.output.example.json`

## 使用规范

- 不在此目录存放生产密钥。
- `.example` 仅保留脱敏示例。
- `.backup` 文件应注明时间或版本（建议追加 `YYYYMMDD`）。
- 变更配置前，先写入对应 `.backup` 再修改生产文件。
