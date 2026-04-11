import asyncio

import pytest

from src.core.agent import CodeReviewAgent


def render_review(text: str) -> str:
    agent = CodeReviewAgent(agent_name="code-review")
    return agent.review_text(text)


@pytest.mark.parametrize(
    ("text", "expected_title", "expected_kind"),
    [
        (
            "```diff\n@@\n+const API_KEY = \"sk-test-1234567890\";\n```",
            "Hardcoded secret [high]",
            "unified_diff",
        ),
        (
            "```ts\nconsole.log('debug');\n```",
            "Debug artifact [low]",
            "code_snippet",
        ),
        (
            "```python\nexcept Exception:\n    return None\n```",
            "Broad exception swallow [medium]",
            "code_snippet",
        ),
        (
            "```tsx\n<div dangerouslySetInnerHTML={{ __html: html }} />\n```",
            "Unsafe HTML sink [high]",
            "code_snippet",
        ),
        (
            "```js\nconst fn = new Function('value', 'return value')\n```",
            "Dangerous dynamic execution [high]",
            "code_snippet",
        ),
    ],
)
def test_rule_findings_are_reported(text, expected_title, expected_kind):
    review = render_review(text)

    assert "Summary" in review
    assert f"- Input type: {expected_kind}" in review
    assert expected_title in review
    assert "Limitations" in review


def test_clean_input_reports_no_findings():
    review = render_review("```ts\nconst total = items.length;\nreturn total;\n```")

    assert "Findings found: 0" in review
    assert "No deterministic findings" in review


def test_complete_only_analyzes_latest_user_message():
    agent = CodeReviewAgent(agent_name="code-review")
    result = asyncio.run(
        agent.complete(
            [
                {"role": "user", "content": "```ts\nconsole.log('debug');\n```"},
                {"role": "assistant", "content": "Please send the next snippet."},
                {"role": "user", "content": "```ts\nconst total = items.length;\n```"},
            ]
        )
    )

    assert "No deterministic findings" in result.content
    assert "Debug artifact" not in result.content


def test_unified_diff_only_reviews_added_lines():
    review = render_review("```diff\n@@\n- eval(userInput)\n+ safeCall(userInput)\n```")

    assert "- Input type: unified_diff" in review
    assert "No deterministic findings" in review
