import type { Node } from '@xyflow/react';

const DEFAULT_NODE_WIDTH = 352;
const DEFAULT_NODE_HEIGHT = 224;
const LOOP_GROUP_HEADER_HEIGHT = 44;
const LOOP_GROUP_PADDING = 16;

function getNumericStyleValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getNodeSize(node: Node) {
  const style = (node.style || {}) as { width?: number; height?: number };
  const width =
    node.measured?.width ??
    getNumericStyleValue((node as { width?: number }).width) ??
    getNumericStyleValue(style.width) ??
    (node.type === 'loop_group' ? 500 : DEFAULT_NODE_WIDTH);
  const height =
    node.measured?.height ??
    getNumericStyleValue((node as { height?: number }).height) ??
    getNumericStyleValue(style.height) ??
    (node.type === 'loop_group' ? 350 : DEFAULT_NODE_HEIGHT);

  return { width, height };
}

function getNodeMap(nodes: Node[]) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function getAbsolutePosition(node: Node, nodeMap: Map<string, Node>): { x: number; y: number } {
  if (!node.parentId) {
    return node.position;
  }

  const parent = nodeMap.get(node.parentId);
  if (!parent) {
    return node.position;
  }

  const parentPosition = getAbsolutePosition(parent, nodeMap);
  return {
    x: parentPosition.x + node.position.x,
    y: parentPosition.y + node.position.y,
  };
}

function getBounds(node: Node, nodeMap: Map<string, Node>) {
  const position = getAbsolutePosition(node, nodeMap);
  const size = getNodeSize(node);
  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  };
}

function getNodeCenter(node: Node, nodeMap: Map<string, Node>) {
  const bounds = getBounds(node, nodeMap);
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

function isEmbeddableNode(node: Node) {
  return node.type !== 'loop_group' && node.type !== 'annotation' && node.type !== 'generating';
}

function isInsideLoopGroup(center: { x: number; y: number }, loopGroup: Node, nodeMap: Map<string, Node>) {
  const bounds = getBounds(loopGroup, nodeMap);
  return (
    center.x >= bounds.x + LOOP_GROUP_PADDING &&
    center.x <= bounds.x + bounds.width - LOOP_GROUP_PADDING &&
    center.y >= bounds.y + LOOP_GROUP_HEADER_HEIGHT &&
    center.y <= bounds.y + bounds.height - LOOP_GROUP_PADDING
  );
}

function clampToLoopGroup(
  absolutePosition: { x: number; y: number },
  node: Node,
  loopGroup: Node,
  nodeMap: Map<string, Node>,
) {
  const parentBounds = getBounds(loopGroup, nodeMap);
  const nodeSize = getNodeSize(node);

  const minX = LOOP_GROUP_PADDING;
  const maxX = Math.max(minX, parentBounds.width - nodeSize.width - LOOP_GROUP_PADDING);
  const minY = LOOP_GROUP_HEADER_HEIGHT;
  const maxY = Math.max(minY, parentBounds.height - nodeSize.height - LOOP_GROUP_PADDING);

  return {
    x: Math.min(Math.max(absolutePosition.x - parentBounds.x, minX), maxX),
    y: Math.min(Math.max(absolutePosition.y - parentBounds.y, minY), maxY),
  };
}

export function applyLoopGroupDrop(nodes: Node[], draggedNodeId: string) {
  const nodeMap = getNodeMap(nodes);
  const draggedNode = nodeMap.get(draggedNodeId);
  if (!draggedNode || !isEmbeddableNode(draggedNode)) {
    return nodes;
  }

  const currentAbsolutePosition = getAbsolutePosition(draggedNode, nodeMap);
  const draggedCenter = getNodeCenter(draggedNode, nodeMap);
  const candidateGroups = nodes
    .filter((node) => node.type === 'loop_group' && node.id !== draggedNodeId)
    .filter((node) => isInsideLoopGroup(draggedCenter, node, nodeMap))
    .sort((a, b) => {
      const aSize = getNodeSize(a);
      const bSize = getNodeSize(b);
      return aSize.width * aSize.height - bSize.width * bSize.height;
    });

  const nextParent = candidateGroups[0] ?? null;
  const nextParentId = nextParent?.id;

  if (draggedNode.parentId === nextParentId) {
    return nodes;
  }

  return nodes.map((node) => {
    if (node.id !== draggedNodeId) {
      return node;
    }

    if (!nextParent) {
      return {
        ...node,
        parentId: undefined,
        extent: undefined,
        position: currentAbsolutePosition,
      };
    }

    return {
      ...node,
      parentId: nextParent.id,
      extent: 'parent' as const,
      position: clampToLoopGroup(currentAbsolutePosition, node, nextParent, nodeMap),
    };
  });
}
