"""StudySolo 诊断 CLI — 跨平台 fallback。

等同于 .agent/skills/system-diagnostics/scripts/run_diagnostics.py，
放在 scripts/diagnostics/ 方便直接调用。

用法：
    python scripts/diagnostics/run_diagnostics.py \
        --base-url http://127.0.0.1:2038 \
        --admin-token <token> \
        --category all
"""

from __future__ import annotations

import sys
from pathlib import Path

_skill_script = (
    Path(__file__).resolve().parent.parent.parent
    / ".agent"
    / "skills"
    / "system-diagnostics"
    / "scripts"
    / "run_diagnostics.py"
)

if _skill_script.exists():
    # 通过 runpy 执行 Skill 内的实现，避免代码重复
    import runpy

    sys.argv[0] = str(_skill_script)
    runpy.run_path(str(_skill_script), run_name="__main__")
else:
    print(
        "ERROR: 找不到 .agent/skills/system-diagnostics/scripts/run_diagnostics.py",
        file=sys.stderr,
    )
    sys.exit(2)
