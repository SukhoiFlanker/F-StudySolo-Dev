import re
from dataclasses import dataclass
from math import ceil
from typing import Literal


def estimate_tokens(text: str) -> int:
    return max(1, ceil(len(text.strip()) / 4)) if text.strip() else 0


def iter_text_chunks(text: str, chunk_size: int = 48) -> list[str]:
    if not text:
        return []
    return [text[index:index + chunk_size] for index in range(0, len(text), chunk_size)]


@dataclass(slots=True)
class CompletionResult:
    content: str
    prompt_tokens: int
    completion_tokens: int

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens


Severity = Literal["high", "medium", "low"]
InputKind = Literal["unified_diff", "code_snippet", "plain_text"]

SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}
MAX_FINDINGS = 5
CODE_BLOCK_PATTERN = re.compile(r"```[^\n]*\n(.*?)```", re.DOTALL)

CODE_HINTS = (
    "def ",
    "class ",
    "import ",
    "from ",
    "const ",
    "let ",
    "function ",
    "return ",
    "=>",
    "{",
    "}",
)


@dataclass(slots=True)
class ReviewLine:
    text: str
    evidence: str
    position: int


@dataclass(slots=True)
class ReviewInput:
    kind: InputKind
    raw_text: str
    lines: list[ReviewLine]


@dataclass(slots=True)
class ReviewFinding:
    rule_id: str
    title: str
    severity: Severity
    evidence: str
    advice: str
    position: int


@dataclass(frozen=True, slots=True)
class RuleSpec:
    rule_id: str
    title: str
    severity: Severity
    patterns: tuple[re.Pattern[str], ...]
    advice: str


RULES: tuple[RuleSpec, ...] = (
    RuleSpec(
        rule_id="hardcoded_secret",
        title="Hardcoded secret",
        severity="high",
        patterns=(
            re.compile(
                r"""(?ix)
                \b(?:api[_-]?key|secret|token|password|passwd|access_token|client_secret)\b
                [^=\n:]{0,20}
                (?:
                    =|:
                )
                \s*
                (?:
                    ["'][^"'\n]{6,}["']
                )
                """
            ),
            re.compile(r"Bearer\s+[A-Za-z0-9._-]{10,}", re.IGNORECASE),
            re.compile(r"\bsk-[A-Za-z0-9]{10,}\b"),
        ),
        advice=(
            "Move the credential into environment variables or secret storage and load it at runtime."
        ),
    ),
    RuleSpec(
        rule_id="dangerous_eval_or_exec",
        title="Dangerous dynamic execution",
        severity="high",
        patterns=(
            re.compile(r"\beval\s*\("),
            re.compile(r"\bexec\s*\("),
            re.compile(r"\bnew\s+Function\s*\("),
        ),
        advice="Replace dynamic execution with explicit parsing or a constrained dispatch table.",
    ),
    RuleSpec(
        rule_id="unsafe_html_sink",
        title="Unsafe HTML sink",
        severity="high",
        patterns=(
            re.compile(r"\binnerHTML\s*="),
            re.compile(r"\bdangerouslySetInnerHTML\b"),
        ),
        advice="Avoid raw HTML sinks; sanitize trusted content or render structured data instead.",
    ),
    RuleSpec(
        rule_id="broad_exception_swallow",
        title="Broad exception swallow",
        severity="medium",
        patterns=(re.compile(r"^\s*except(?:\s+Exception)?\s*:\s*(?:#.*)?$", re.IGNORECASE),),
        advice=(
            "Catch a narrower exception type and handle or re-raise it with context instead of swallowing everything."
        ),
    ),
    RuleSpec(
        rule_id="debug_artifact",
        title="Debug artifact",
        severity="low",
        patterns=(
            re.compile(r"\bconsole\.log\s*\("),
            re.compile(r"\bprint\s*\("),
            re.compile(r"\bdebugger\b"),
            re.compile(r"\bpdb\.set_trace\s*\("),
        ),
        advice="Remove the debug statement or replace it with structured, production-safe logging.",
    ),
)


def extract_review_text(text: str) -> str:
    blocks = [block.strip() for block in CODE_BLOCK_PATTERN.findall(text) if block.strip()]
    if blocks:
        return "\n\n".join(blocks)
    return text.strip()


def detect_input_kind(text: str, source_text: str) -> InputKind:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    diff_markers = ("diff --git", "@@", "--- ", "+++ ")
    if any(any(line.startswith(marker) for marker in diff_markers) for line in lines):
        return "unified_diff"
    if "```" in source_text or any(hint in text for hint in CODE_HINTS):
        return "code_snippet"
    return "plain_text"


def build_review_input(text: str) -> ReviewInput:
    source_text = extract_review_text(text)
    kind = detect_input_kind(source_text, text)
    raw_lines = source_text.splitlines() or ([source_text] if source_text else [])
    lines: list[ReviewLine] = []

    if kind == "unified_diff":
        for position, raw_line in enumerate(raw_lines, start=1):
            if raw_line.startswith(("diff --git", "index ", "@@", "--- ", "+++ ")):
                continue
            if raw_line.startswith("+") and not raw_line.startswith("+++"):
                content = raw_line[1:]
                if content.strip():
                    lines.append(
                        ReviewLine(
                            text=content,
                            evidence=content,
                            position=position,
                        )
                    )
    else:
        for position, raw_line in enumerate(raw_lines, start=1):
            if raw_line.strip():
                lines.append(
                    ReviewLine(
                        text=raw_line,
                        evidence=raw_line,
                        position=position,
                    )
                )

    return ReviewInput(kind=kind, raw_text=source_text, lines=lines)


def shorten_evidence(text: str, limit: int = 96) -> str:
    compact = " ".join(text.strip().split())
    if len(compact) <= limit:
        return compact
    return f"{compact[: limit - 3]}..."


def collect_findings(review_input: ReviewInput) -> list[ReviewFinding]:
    findings: list[ReviewFinding] = []

    for rule in RULES:
        for line in review_input.lines:
            if any(pattern.search(line.text) for pattern in rule.patterns):
                findings.append(
                    ReviewFinding(
                        rule_id=rule.rule_id,
                        title=rule.title,
                        severity=rule.severity,
                        evidence=shorten_evidence(line.evidence),
                        advice=rule.advice,
                        position=line.position,
                    )
                )
                break

    findings.sort(key=lambda finding: (SEVERITY_ORDER[finding.severity], finding.position))
    return findings[:MAX_FINDINGS]


def format_review(review_input: ReviewInput, findings: list[ReviewFinding]) -> str:
    sections = [
        "Summary",
        f"- Input type: {review_input.kind}",
        f"- Reviewed lines: {len(review_input.lines)}",
        f"- Findings found: {len(findings)}",
        "",
        "Findings",
    ]

    if findings:
        for index, finding in enumerate(findings, start=1):
            sections.extend(
                [
                    f"{index}. {finding.title} [{finding.severity}]",
                    f"   Evidence: `{finding.evidence}`",
                    f"   Fix: {finding.advice}",
                ]
            )
    else:
        sections.append(
            "- No deterministic findings. This heuristic review only checks a small fixed rule set and does not prove the code is safe."
        )

    sections.extend(
        [
            "",
            "Limitations",
            "- Deterministic heuristics only; only the latest user message was analyzed.",
            "- No repository context, control-flow analysis, or external model reasoning is used.",
            "- A clean result does not prove the code is safe.",
        ]
    )
    return "\n".join(sections)


class CodeReviewAgent:
    def __init__(self, agent_name: str) -> None:
        self.agent_name = agent_name

    async def complete(self, messages: list[dict[str, str]]) -> CompletionResult:
        prompt_text = "\n".join(message.get("content", "") for message in messages)
        latest_user_message = self._latest_user_message(messages)
        content = self.review_text(latest_user_message)
        return CompletionResult(
            content=content,
            prompt_tokens=estimate_tokens(prompt_text),
            completion_tokens=estimate_tokens(content),
        )

    def stream_chunks(self, content: str) -> list[str]:
        return iter_text_chunks(content)

    def review_text(self, text: str) -> str:
        review_input = build_review_input(text)
        findings = collect_findings(review_input)
        return format_review(review_input, findings)

    def _latest_user_message(self, messages: list[dict[str, str]]) -> str:
        for message in reversed(messages):
            if message.get("role") == "user":
                return str(message.get("content", "")).strip()
        return ""
