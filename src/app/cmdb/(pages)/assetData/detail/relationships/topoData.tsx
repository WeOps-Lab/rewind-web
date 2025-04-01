import { Graph } from '@antv/x6';
import { useEffect, useCallback } from 'react';
import { getIconUrl } from '@/app/cmdb/utils/common';
import { useGraphStore, useGraphInstance } from '@antv/xflow';
import { TopoDataProps, NodeData } from '@/app/cmdb/types/assetData';

const CONFIG = {
  verticalGap: 100,
  horizontalGap: 400,
  defaultWidth: 200,
  defaultHeight: 80,
  maxExpandedLevel: 3,
  childNodeVerticalGap: 80,
};

export const InitNode: React.FC<TopoDataProps> = ({
  topoData,
  modelList,
  assoTypeList,
}) => {
  const initData = useGraphStore((state) => state.initData);
  const graph = useGraphInstance();
  const setInitData = useCallback(() => {
    if (topoData.src_result || topoData.dst_result) {
      const srcResult: any = topoData.src_result;
      const dstResult: any = topoData.dst_result;
      const srcData = transformData(srcResult, true);
      const dstData = transformData(dstResult, false);
      // 合并srcData.nodes和dstData.nodes的第一个节点的children
      const srcFirstNode = srcData?.nodes?.[0];
      const dstFirstNode = dstData?.nodes?.[0];
      if (srcFirstNode && dstFirstNode) {
        srcFirstNode.data.children = [
          ...srcFirstNode.data.children,
          ...dstFirstNode.data.children,
        ];
      }
      initData({
        nodes: [...srcData.nodes, ...dstData.nodes],
        edges: [...srcData.edges, ...dstData.edges],
      });
    } else {
      initData({
        nodes: [],
        edges: [],
      });
    }
  }, [initData, topoData]);

  useEffect(() => {
    registerCollapseNode();
    setInitData();
    setTimeout(() => {
      graph?.getNodes().forEach((node) => {
        if (node.getData().defaultShow) {
          node.show();
        } else {
          node.hide();
        }
      });
    }, 0);
    graph?.on('node:collapse', handleCollapse);
    graph?.on('node:click', linkToDetail);
    return () => {
      graph?.off('node:collapse', handleCollapse);
      graph?.off('node:click', linkToDetail);
    };
  }, [setInitData]);

  const handleCollapse = (item: any) => {
    const { e, node } = item;
    const target = e.target;
    const isExpanded = node.getData().expanded;
    const isSrcBtn = target.getAttribute('name') === 'expandBtnL';

    node.setData({ expanded: !isExpanded });

    const btnSelector = isSrcBtn ? 'expandBtnL' : 'expandBtnR';
    node.setAttrs({
      [btnSelector]: {
        d: isExpanded
          ? 'M 3 6 L 9 6 M 6 3 L 6 9 M 1 1 L 11 1 L 11 11 L 1 11 Z'
          : 'M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z',
      },
    });

    // 处理子节点的显示/隐藏
    const processChildren = (children: NodeData[], level: number) => {
      children.forEach((child: NodeData) => {
        const childNode = graph?.getCellById(child._id.toString());
        if (childNode) {
          const childData = childNode.getData();
          const isSrcNode = childData.isSrc;
          if ((isSrcBtn && isSrcNode) || (!isSrcBtn && !isSrcNode)) {
            // 收起时递归处理所有子孙节点
            if (isExpanded) {
              childNode.setData({ expanded: false });
              childNode.hide();
              if (childData.children?.length) {
                processChildren(childData.children, level + 1);
              }
            } else {
              // 展开时只显示直接子节点
              if (level === 1) {
                childNode.show();
              }
            }
          }
        }
      });
    };

    const children = node.getData().children || [];
    processChildren(children, 1);
  };

  const linkToDetail = (data: any) => {
    const { e, node } = data;
    const target = e.target;
    if (
      target.tagName === 'path' &&
      target.getAttribute('event') === 'node:collapse'
    ) {
      return;
    }
    const row = node?.getData();
    const params: any = {
      icn: '',
      model_name: showModelName(row.modelId),
      model_id: row.modelId,
      classification_id: '',
      inst_id: node.id,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `/cmdb/assetData/detail/baseInfo?${queryString}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showModelName = (id: string) => {
    return modelList.find((item) => item.model_id === id)?.model_name || '--';
  };

  // 计算节点的展开按钮路径
  const getExpandBtnPath = (hasChild: boolean, isExpanded: boolean) => {
    if (!hasChild) return 'M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z';
    return isExpanded
      ? 'M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z'
      : 'M 3 6 L 9 6 M 6 3 L 6 9 M 1 1 L 11 1 L 11 11 L 1 11 Z';
  };

  // 收集层级信息
  const collectLevelInfo = (
    node: NodeData,
    parentId: string | null,
    level: number,
    levelNodes: {
      [key: number]: Array<{
        id: string;
        parentId: string | null;
        node: NodeData;
      }>;
    }
  ) => {
    if (!node._id) return;

    const id = node._id.toString();
    if (!levelNodes[level]) levelNodes[level] = [];

    levelNodes[level].push({ id, parentId, node });

    if (node.children) {
      node.children.forEach((child) =>
        collectLevelInfo(child, id, level + 1, levelNodes)
      );
    }
  };

  // 计算节点位置
  const calculateNodePosition = (
    levelNodes: {
      [key: number]: Array<{
        id: string;
        parentId: string | null;
        node: NodeData;
      }>;
    },
    nodePositions: { [key: string]: { x: number; y: number } },
    isSrc: boolean
  ) => {
    if (!levelNodes[1]?.[0]) return;

    const rootId = levelNodes[1][0].id;
    nodePositions[rootId] = { x: 0, y: 0 };

    // 处理第2-3层节点
    for (let level = 2; level <= 3; level++) {
      if (levelNodes[level]) {
        const currentLevelNodes = levelNodes[level];
        const startY = -(currentLevelNodes.length - 1) * CONFIG.verticalGap / 2;
        
        currentLevelNodes.forEach((nodeInfo, index) => {
          nodePositions[nodeInfo.id] = {
            x: isSrc ? -CONFIG.horizontalGap * (level - 1) : CONFIG.horizontalGap * (level - 1),
            y: startY + index * CONFIG.verticalGap,
          };
        });
      }
    }
    // 处理第四层及以上的节点，以父节点为中心展开
    const maxLevel = Math.max(...Object.keys(levelNodes).map(Number));
    for (let level = 4; level <= maxLevel; level++) {
      const currentLevelNodes = levelNodes[level];
      if (!currentLevelNodes) continue;

      currentLevelNodes.forEach((nodeInfo) => {
        if (!nodeInfo.parentId) return;
        
        const parentPosition = nodePositions[nodeInfo.parentId];
        if (!parentPosition) return;

        // 获取同父节点的所有子节点
        const siblings = currentLevelNodes.filter(n => n.parentId === nodeInfo.parentId);
        const siblingIndex = siblings.findIndex(n => n.id === nodeInfo.id);
        const totalSiblings = siblings.length;
        
        // 计算以父节点为中心的垂直偏移
        const totalHeight = (totalSiblings - 1) * CONFIG.childNodeVerticalGap;
        const startY = parentPosition.y - totalHeight / 2;
        
        nodePositions[nodeInfo.id] = {
          x: isSrc 
            ? parentPosition.x - CONFIG.horizontalGap
            : parentPosition.x + CONFIG.horizontalGap,
          y: startY + siblingIndex * CONFIG.childNodeVerticalGap,
        };
      });
    }
  };

  // 创建节点和边
  const createNodesAndEdges = (
    node: NodeData,
    parentId: string | null,
    levelNodes: {
      [key: number]: Array<{
        id: string;
        parentId: string | null;
        node: NodeData;
      }>;
    },
    nodePositions: { [key: string]: { x: number; y: number } },
    isSrc: boolean,
    nodes: any[],
    edges: any[]
  ) => {
    if (!node._id) return;

    const id = node._id.toString();
    const hasChild = !!node.children?.length;
    const position = nodePositions[id];
    if (!position) return;

    const level = Object.keys(levelNodes).find((lvl) =>
      levelNodes[Number(lvl)]?.some((n) => n.id === id)
    );
    const currentLevel = Number(level);
    const isExpanded = currentLevel < CONFIG.maxExpandedLevel;

    nodes.push({
      id,
      x: position.x,
      y: position.y,
      width: CONFIG.defaultWidth,
      height: CONFIG.defaultHeight,
      shape: 'custom-rect',
      attrs: {
        image: {
          'xlink:href': getIconUrl({ icn: '', model_id: node.model_id }),
        },
        tooltip1: {
          text: node.inst_name,
        },
        label1: { text: node.inst_name, title: node.inst_name },
        tooltip2: {
          text: showModelName(node.model_id),
        },
        label2: {
          text: showModelName(node.model_id),
          title: showModelName(node.model_id),
        },
        expandBtnL: {
          stroke: isSrc && hasChild ? 'var(--color-border-3)' : '',
          fill: isSrc && hasChild ? 'var(--color-bg-1)' : 'transparent',
          d: getExpandBtnPath(isSrc && hasChild, isExpanded),
        },
        expandBtnR: {
          stroke: hasChild ? 'var(--color-border-3)' : '',
          fill: hasChild ? 'var(--color-bg-1)' : 'transparent',
          d: getExpandBtnPath(hasChild, isExpanded),
        },
      },
      data: {
        defaultShow: currentLevel <= CONFIG.maxExpandedLevel,
        expanded: isExpanded,
        children: hasChild ? node.children : [],
        modelId: node.model_id,
        isSrc: isSrc,
        level: currentLevel,
      },
    });

    if (parentId) {
      edges.push({
        source: parentId,
        target: id,
        attrs: {
          line: { stroke: 'var(--color-border-3)', strokeWidth: 1 },
        },
        label: {
          attrs: {
            text: {
              text:
                assoTypeList.find((tex) => tex.asst_id === node.asst_id)
                  ?.asst_name || '--',
              fill: 'var(--color-text-4)',
            },
            rect: { fill: 'var(--color-bg-1)', stroke: 'none' },
          },
        },
        router: { name: 'er', args: { direction: 'H', offset: 20 } },
      });
    }

    if (node.children) {
      node.children.forEach((child) =>
        createNodesAndEdges(
          child,
          id,
          levelNodes,
          nodePositions,
          isSrc,
          nodes,
          edges
        )
      );
    }
  };

  const transformData = (data: NodeData, isSrc: boolean) => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // 存储节点位置信息
    const nodePositions: { [key: string]: { x: number; y: number } } = {};

    // 存储每层节点信息
    const levelNodes: {
      [key: number]: Array<{
        id: string;
        parentId: string | null;
        node: NodeData;
      }>;
    } = {};

    collectLevelInfo(data, null, 1, levelNodes);
    calculateNodePosition(levelNodes, nodePositions, isSrc);
    createNodesAndEdges(
      data,
      null,
      levelNodes,
      nodePositions,
      isSrc,
      nodes,
      edges
    );
    return { nodes, edges };
  };

  const registerCollapseNode = () => {
    Graph.registerNode(
      'custom-rect',
      {
        inherit: 'rect',
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'line',
            selector: 'divider',
          },
          {
            tagName: 'image',
            selector: 'image',
          },
          {
            tagName: 'title',
            selector: 'tooltip1',
          },
          {
            tagName: 'text',
            selector: 'label1',
          },
          {
            tagName: 'title',
            selector: 'tooltip2',
          },
          {
            tagName: 'text',
            selector: 'label2',
          },
          {
            tagName: 'path',
            selector: 'expandBtnL',
          },
          {
            tagName: 'path',
            selector: 'expandBtnR',
          },
        ],
        attrs: {
          body: {
            stroke: 'var(--color-border-3)',
            strokeWidth: 1,
            fill: 'var(--color-bg-1)',
            rx: 6,
            ry: 6,
            width: 200,
            height: 80,
          },
          image: {
            width: 40,
            height: 40,
            x: 10,
            y: 18,
          },
          divider: {
            x1: 60,
            y1: 0,
            x2: 60,
            y2: 80,
            stroke: 'var(--color-border-3)',
            strokeWidth: 1,
          },
          tooltip1: {
            text: '',
          },
          label1: {
            refX: 0.4,
            refY: 0.4,
            textWrap: {
              width: 120,
              height: 20,
              ellipsis: true,
            },
            textAnchor: 'center',
            textVerticalAnchor: 'middle',
            fontSize: 14,
            fill: 'var(--color-text-1)',
          },
          tooltip2: {
            text: '',
          },
          label2: {
            refX: 0.4,
            refY: 0.7,
            textWrap: {
              width: 120,
              height: 20,
              ellipsis: true,
            },
            textAnchor: 'center',
            textVerticalAnchor: 'middle',
            fontSize: 14,
            fill: 'var(--color-text-4)',
          },
          expandBtnL: {
            name: 'expandBtnL',
            d: 'M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z',
            fill: 'red',
            cursor: 'pointer',
            refX: 1,
            refDx: -207,
            refY: 0.42,
            stroke: 'var(--color-text-4)',
            strokeWidth: 1,
            event: 'node:collapse',
            zIndex: 99,
          },
          expandBtnR: {
            name: 'expandBtnR',
            d: 'M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z',
            fill: 'red',
            cursor: 'pointer',
            refX: 1,
            refDx: -7,
            refY: 0.42,
            stroke: 'var(--color-text-4)',
            strokeWidth: 1,
            event: 'node:collapse',
            zIndex: 99,
          },
        },
        data: {
          expanded: false,
        },
        draggable: true,
        zIndex: 10,
      },
      true
    );
  };

  return null;
};
