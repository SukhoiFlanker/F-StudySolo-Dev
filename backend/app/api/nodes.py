"""Node manifest API — /api/nodes/*

Provides the frontend with metadata about all registered node types.
The frontend reads this to populate the node palette and choose renderers,
eliminating the need to hardcode node types on the client side.
"""

from fastapi import APIRouter

from app.nodes._base import BaseNode

router = APIRouter()


@router.get("/manifest")
async def get_node_manifest():
    """Return metadata for all registered node types.

    Response format:
    [
        {
            "type": "flashcard",
            "category": "generation",
            "description": "根据知识点生成问答闪卡",
            "is_llm_node": true,
            "output_format": "json",
            "icon": "🃏",
            "color": "#f59e0b",
            "config_schema": [],
            "output_capabilities": ["preview", "compact"],
            "supports_upload": false,
            "supports_preview": true,
            "deprecated_surface": null
        },
        ...
    ]
    """
    return BaseNode.get_manifest()
