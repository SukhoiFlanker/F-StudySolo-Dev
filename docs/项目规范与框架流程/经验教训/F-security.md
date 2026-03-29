# F. 安全漏洞模式

## F-01: CAPTCHA 纯客户端验证可重放
**日期**: 2026-03-25
**根因**: CAPTCHA token 格式 {timestamp}:{hmac} 无服务端状态，可无限重放
**修复**: 引入 captcha_challenges DB 表，token 一次性消费
**防御规则**: 安全令牌必须有服务端状态 + 一次性消费机制

## F-02: 管理后台鉴权 Fail-Open
**日期**: 2026-03-25
**根因**: AdminJWTMiddleware 在 DB 异常时 pass 继续通行
**修复**: 异常时返回 503 Service Unavailable（fail-close）
**防御规则**: 鉴权逻辑必须 fail-close：异常 = 拒绝

## F-03: "记住我" 明文存储密码
**日期**: 2026-03-25
**根因**: localStorage 保存了 { email, password, remember }
**修复**: 只保存 { email, remember }，兼容清理老格式
**防御规则**: localStorage 绝对禁止存储密码

## F-04: Markdown XSS — rehype-raw
**日期**: 2026-03-25
**根因**: rehype-raw 允许在 Markdown 中嵌入原始 HTML <script>
**修复**: 移除 rehype-raw 插件
**防御规则**: Markdown 渲染禁止启用 rehype-raw 或 dangerouslySetInnerHTML（除非输入已消毒）

## F-05: SMTP 凭证泄露到 Git 仓库
**日期**: 2026-03-27
**根因**: .env 文件被推送到 GitHub，含 SMTP 密码
**修复**: 撤销密码 → BFG/filter-branch 清理 Git 历史 → 重新生成密码
**防御规则**: .gitignore 必须包含 .env*；CI 使用 git-secrets 扫描

## F-06: 硬编码安全密钥默认值
**日期**: 2026-03-25
**根因**: os.getenv("CAPTCHA_SECRET", "studysolo-captcha-2026") 使用弱默认值
**修复**: 移除默认值，未配置时直接 raise RuntimeError
**防御规则**: 安全相关环境变量禁止有默认值
