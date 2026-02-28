<# 
  sync-from-independent.ps1
  
  功能：将独立仓库中的 StudySolo 代码同步回 Monorepo
  方向：Study_1037Solo\StudySolo → platform.1037solo.com\StudySolo
  模式：镜像覆盖（/MIR），排除无关目录和文件
  
  用法：右键 → 使用 PowerShell 运行，或在终端中执行：
    powershell -ExecutionPolicy Bypass -File "scripts\git\sync-from-independent.ps1"
#>

$Source = "D:\project\Study_1037Solo\StudySolo"
$Target = "D:\project\1037solo\platform.1037solo.com\StudySolo"

# 排除的目录
$ExcludeDirs = @(
    ".git"           # Monorepo 的 StudySolo/ 不应有独立的 .git
    "shared"         # Monorepo 根目录有自己的 shared/ submodule
    "node_modules"   # 前端依赖，应在目标重新安装
    ".next"          # Next.js 构建缓存
    "venv"           # Python 虚拟环境
    ".venv"          # Python 虚拟环境（另一种命名）
    "__pycache__"    # Python 编译缓存
    ".kiro"          # Kiro AI 工具
    ".agent"         # Agent 工具
    ".cursor"        # Cursor AI 工具
    ".Trae"          # Trae AI 工具
)

# 排除的文件（反向同步额外排除 .gitmodules）
$ExcludeFiles = @(
    ".DS_Store"
    "Thumbs.db"
    "Desktop.ini"
    ".gitmodules"    # 独立仓库的 submodule 配置不适用于 Monorepo 子目录
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StudySolo 独立仓库 → Monorepo 同步" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "源目录:  $Source" -ForegroundColor Yellow
Write-Host "目标:    $Target" -ForegroundColor Yellow
Write-Host ""
Write-Host "排除目录: $($ExcludeDirs -join ', ')" -ForegroundColor DarkGray
Write-Host "排除文件: $($ExcludeFiles -join ', ')" -ForegroundColor DarkGray
Write-Host ""

# 检查源目录
if (-not (Test-Path $Source)) {
    Write-Host "❌ 源目录不存在: $Source" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 检查目标目录
if (-not (Test-Path $Target)) {
    Write-Host "❌ 目标目录不存在: $Target" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 确认操作
Write-Host "⚠️  这将以镜像模式覆盖 Monorepo 中 StudySolo/ 的文件（排除项除外）" -ForegroundColor Yellow
$confirm = Read-Host "确认同步？(y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "已取消。" -ForegroundColor Gray
    exit 0
}

# 执行 robocopy
Write-Host ""
Write-Host "🔄 开始同步..." -ForegroundColor Green

$robocopyArgs = @(
    $Source
    $Target
    "/MIR"
    "/XD"
) + $ExcludeDirs + @(
    "/XF"
) + $ExcludeFiles + @(
    "/NFL"
    "/NDL"
    "/NJH"
    "/NJS"
    "/NP"
)

& robocopy @robocopyArgs

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -lt 8) {
    Write-Host "✅ 同步完成！" -ForegroundColor Green
    
    # 显示 Monorepo git status
    Write-Host ""
    Write-Host "--- Monorepo git status (StudySolo/) ---" -ForegroundColor Cyan
    Push-Location "D:\project\1037solo\platform.1037solo.com"
    git status --short -- StudySolo/
    Pop-Location
    
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Yellow
    Write-Host "  cd D:\project\1037solo\platform.1037solo.com" -ForegroundColor White
    Write-Host '  git add StudySolo/ && git commit -m "sync: pull latest StudySolo"' -ForegroundColor White
}
else {
    Write-Host "❌ 同步失败 (robocopy 退出代码: $exitCode)" -ForegroundColor Red
}

Write-Host ""
Read-Host "按 Enter 退出"
