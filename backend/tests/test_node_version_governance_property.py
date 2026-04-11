from app.nodes.analysis.ai_analyzer.node import AIAnalyzerNode
from app.nodes.analysis.ai_planner.node import AIPlannerNode
from app.nodes.analysis.logic_switch.node import LogicSwitchNode
from app.nodes.analysis.loop_map.node import LoopMapNode
from app.nodes.generation.compare.node import CompareNode
from app.nodes.generation.content_extract.node import ContentExtractNode
from app.nodes.generation.flashcard.node import FlashcardNode
from app.nodes.generation.merge_polish.node import MergePolishNode
from app.nodes.generation.mind_map.node import MindMapNode
from app.nodes.generation.outline_gen.node import OutlineGenNode
from app.nodes.generation.quiz_gen.node import QuizGenNode
from app.nodes.generation.summary.node import SummaryNode
from app.nodes.input.knowledge_base.node import KnowledgeBaseNode
from app.nodes.input.trigger_input.node import TriggerInputNode
from app.nodes.input.web_search.node import WebSearchNode
from app.nodes.interaction.chat_response.node import ChatResponseNode
from app.nodes.output.export_file.node import ExportFileNode
from app.nodes.output.write_db.node import WriteDBNode
from app.nodes.structure.loop_group.node import LoopGroupNode


EXPECTED_INITIAL_CHANGELOG = {"1.0.0": "初始版本"}
OFFICIAL_NODE_CLASSES = [
    AIAnalyzerNode,
    AIPlannerNode,
    LogicSwitchNode,
    LoopMapNode,
    CompareNode,
    ContentExtractNode,
    FlashcardNode,
    MergePolishNode,
    MindMapNode,
    OutlineGenNode,
    QuizGenNode,
    SummaryNode,
    KnowledgeBaseNode,
    TriggerInputNode,
    WebSearchNode,
    ChatResponseNode,
    ExportFileNode,
    WriteDBNode,
    LoopGroupNode,
]


def test_official_nodes_explicitly_declare_version_and_changelog():
    assert len(OFFICIAL_NODE_CLASSES) == 19

    seen_types: set[str] = set()
    for node_cls in OFFICIAL_NODE_CLASSES:
        seen_types.add(node_cls.node_type)
        assert node_cls.node_type != "community_node"
        assert "version" in node_cls.__dict__
        assert "changelog" in node_cls.__dict__
        assert node_cls.version == "1.0.0"
        assert node_cls.changelog == EXPECTED_INITIAL_CHANGELOG

    assert len(seen_types) == 19
