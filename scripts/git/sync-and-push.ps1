<# 
  sync-and-push.ps1
  
  功能：一键完成 "Monorepo → 独立仓库 → 提交推送" 全流程  
  适用场景：在 Monorepo 中改了 StudySolo 的代码，想一键推送到 AIMFllys/StudySolo
  
  用法：
    powershell -ExecutionPolicy Bypass -File "scripts\git\sync-and-push.ps1"
    # 或带提交消息：
    powershell -ExecutionPolicy Bypass -File "scripts\git\sync-and-push.ps1" -Message "feat: add new feature"
#>

param(
    [string]$Message = ""
)

$Source = "D:\project\1037solo\platform.1037solo.com\StudySolo"
$Target = "D:\project\Study_1037Solo\StudySolo"

$ExcludeDirs = @(".git", "shared", "node_modules", ".next", "venv", ".venv", "__pycache__", ".kiro", ".agent", ".cursor", ".Trae")
$ExcludeFiles = @(".DS_Store", "Thumbs.db", "Desktop.ini")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  一键同步 + 推送到 AIMFllys/StudySolo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---- Step 1: 复制文件 ----
Write-Host "[1/3] 🔄 同步文件..." -ForegroundColor Green

$robocopyArgs = @($Source, $Target, "/MIR", "/XD") + $ExcludeDirs + @("/XF") + $ExcludeFiles + @("/NFL", "/NDL", "/NJH", "/NJS", "/NP")
& robocopy @robocopyArgs

if ($LASTEXITCODE -ge 8) {
    Write-Host "❌ 文件同步失败" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}
Write-Host "   ✅ 文件同步完成" -ForegroundColor Green

# ---- Step 2: 暂存变更 ----
Write-Host ""
Write-Host "[2/3] 📋 检查变更..." -ForegroundColor Green

Push-Location $Target
$changes = git status --short
if (-not $changes) {
    Write-Host "   ℹ️  没有检测到变更，无需推送。" -ForegroundColor Yellow
    Pop-Location
    Read-Host "按 Enter 退出"
    exit 0
}

Write-Host "   检测到以下变更：" -ForegroundColor Yellow
Write-Host $changes -ForegroundColor DarkGray
Write-Host ""

# 获取提交消息
if (-not $Message) {
    $Message = Read-Host "请输入提交消息 (直接回车使用默认)"
    if (-not $Message) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "sync: update from monorepo ($timestamp)"
    }
}

# ---- Step 3: 提交推送 ----
Write-Host ""
Write-Host "[3/3] 🚀 提交并推送..." -ForegroundColor Green
Write-Host "   消息: $Message" -ForegroundColor DarkGray

git add .
git commit -m $Message
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 全部完成！已推送到 AIMFllys/StudySolo" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "⚠️  推送可能出现问题，请检查上方输出" -ForegroundColor Yellow
}

Pop-Location
Write-Host ""
Read-Host "按 Enter 退出"
