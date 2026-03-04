<#
  setup-labels.ps1
  
  功能：使用 GitHub CLI 一键创建所有项目标签
  前提：需要安装 GitHub CLI (gh) 并已登录
  
  用法：
    powershell -ExecutionPolicy Bypass -File ".github/scripts/setup-labels.ps1"
#>

$repo = "AIMFllys/StudySolo"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StudySolo · GitHub Labels 一键配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "[ ✖ ] 未安装 GitHub CLI (gh)，请先安装：https://cli.github.com/" -ForegroundColor Red
    exit 1
}

$labels = @(
    # 类型标签
    @{ name = "bug"; color = "d73a4a"; desc = "代码缺陷或异常行为" }
    @{ name = "feature"; color = "0e8a16"; desc = "新功能需求" }
    @{ name = "enhancement"; color = "a2eeef"; desc = "改进现有功能" }
    @{ name = "refactor"; color = "d876e3"; desc = "代码重构" }
    @{ name = "task"; color = "1d76db"; desc = "开发任务" }
    @{ name = "docs"; color = "0075ca"; desc = "文档相关" }
    @{ name = "test"; color = "bfd4f2"; desc = "测试相关" }
    @{ name = "discussion"; color = "d4c5f9"; desc = "需要讨论" }

    # 优先级标签
    @{ name = "P0-critical"; color = "b60205"; desc = "紧急：线上故障，立即修复" }
    @{ name = "P1-important"; color = "d93f0b"; desc = "重要：本周必须完成" }
    @{ name = "P2-normal"; color = "fbca04"; desc = "正常：按排期完成" }
    @{ name = "P3-low"; color = "c5def5"; desc = "低优：有空再做" }

    # 模块标签
    @{ name = "scope:frontend"; color = "7057ff"; desc = "前端相关" }
    @{ name = "scope:backend"; color = "e36209"; desc = "后端相关" }
    @{ name = "scope:engine"; color = "0052cc"; desc = "工作流引擎" }
    @{ name = "scope:admin"; color = "f9d0c4"; desc = "管理后台" }
    @{ name = "scope:auth"; color = "fef2c0"; desc = "认证/权限" }
    @{ name = "scope:database"; color = "d4c5f9"; desc = "数据库" }
    @{ name = "scope:infra"; color = "c2e0c6"; desc = "基础设施/DevOps" }

    # 状态标签
    @{ name = "status:todo"; color = "ededed"; desc = "待开始" }
    @{ name = "status:in-progress"; color = "0e8a16"; desc = "进行中" }
    @{ name = "status:blocked"; color = "b60205"; desc = "被阻塞" }
    @{ name = "status:needs-review"; color = "fbca04"; desc = "等待审查" }
    @{ name = "status:wontfix"; color = "ffffff"; desc = "不予修复" }
    @{ name = "status:duplicate"; color = "cfd3d7"; desc = "重复 Issue" }

    # 特殊标签
    @{ name = "good first issue"; color = "7057ff"; desc = "适合新手参与" }
    @{ name = "help wanted"; color = "008672"; desc = "需要帮助" }
    @{ name = "breaking change"; color = "b60205"; desc = "包含破坏性变更" }
    @{ name = "dependencies"; color = "0366d6"; desc = "依赖更新" }
)

$total = $labels.Count
$current = 0

foreach ($label in $labels) {
    $current++
    Write-Host "[$current/$total] " -NoNewline -ForegroundColor DarkGray
    
    # 尝试创建，如果已存在则更新
    $result = gh label create $label.name --repo $repo --color $label.color --description $label.desc --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✔ $($label.name)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ $($label.name) — $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[ ✔ ] 全部标签已配置完成！共 $total 个" -ForegroundColor Green
Write-Host ""
