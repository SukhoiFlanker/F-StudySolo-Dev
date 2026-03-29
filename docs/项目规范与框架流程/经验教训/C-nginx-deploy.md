# C. Nginx / 生产部署错误

## C-01: Nginx alias 尾部斜杠不匹配
**日期**: 2026-03-28
**根因**: location /introduce/ { alias /path/to/dir; } — location 有尾部斜杠但 alias 没有，路径拼接错误
**修复**: alias /path/to/dir/; — alias 尾部必须与 location 尾部对齐
**防御规则**: Nginx alias 规则：location 和 alias 的尾部斜杠必须成对匹配

## C-02: Nginx 缓冲阻断 SSE 流
**日期**: 多次
**根因**: Nginx 默认缓冲代理响应，SSE 逐字流变成一次性延迟输出
**修复**: 在反代 location 块添加 proxy_buffering off; proxy_cache off; proxy_read_timeout 300s;
**防御规则**: 所有 SSE/WebSocket/流式响应端点必须关闭 Nginx 缓冲

## C-03: Next.js trailingSlash 与 Nginx 冲突
**根因**: trailingSlash: true 与 Nginx try_files 冲突，产生 301 重定向无限循环
**修复**: 保持 trailingSlash: false（默认），或 Nginx 精确匹配处理
**防御规则**: Next.js 动态路由项目不要开启 trailingSlash

## C-04: 403 Forbidden — 静态目录 vs 反代混淆
**根因**: Nginx 把 /path/ 当作物理目录 listing，而不是转发给 Node 进程
**修复**: 确保 location /path/ 块包含 proxy_pass http://127.0.0.1:PORT;
**防御规则**: Next.js 动态路由不能用 root/alias + try_files，必须用 proxy_pass

## C-05: .next 缓存残留导致构建不一致
**日期**: 2026-03-29
**根因**: 旧 .next 目录含过时 chunk 和环境变量快照，新构建复用旧缓存
**修复**: 部署前必须 rm -rf .next && npm run build
**防御规则**: 每次 git pull 后必须清除 .next，纳入部署 SOP

## C-06: Python 版本不兼容 FastAPI
**根因**: 服务器默认 Python 3.6，FastAPI 0.115+ 需要 3.8+
**修复**: 通过宝塔面板安装 Python 3.11，重建 venv
**防御规则**: 部署文档必须明确 Python 最低版本，国内用清华镜像加速安装
