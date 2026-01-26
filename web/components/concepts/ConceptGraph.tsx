"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape, { Core, NodeSingular } from "cytoscape";

interface ConceptNode {
  id: string;
  label: string;
  paperId: number;
  paperTitle: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  definition?: string;
}

interface ConceptEdge {
  source: string;
  target: string;
  type: "related" | "prerequisite" | "builds_on";
}

interface ConceptGraphProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  onNodeClick?: (node: ConceptNode) => void;
  selectedPaperId?: number;
}

const DIFFICULTY_COLORS = {
  beginner: { bg: "#10b981", border: "#059669" },
  intermediate: { bg: "#f59e0b", border: "#d97706" },
  advanced: { bg: "#ef4444", border: "#dc2626" },
};

const PAPER_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#a855f7", // violet
];

export default function ConceptGraph({
  nodes,
  edges,
  onNodeClick,
  selectedPaperId,
}: ConceptGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Group nodes by paper for coloring
    const paperIds = [...new Set(nodes.map((n) => n.paperId))];
    const paperColorMap = new Map<number, string>();
    paperIds.forEach((id, idx) => {
      paperColorMap.set(id, PAPER_COLORS[idx % PAPER_COLORS.length]);
    });

    // Create cytoscape elements
    const elements = [
      // Nodes
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          paperId: node.paperId,
          paperTitle: node.paperTitle,
          difficulty: node.difficulty,
          definition: node.definition,
          color: paperColorMap.get(node.paperId),
          difficultyColor: DIFFICULTY_COLORS[node.difficulty].bg,
        },
      })),
      // Edges
      ...edges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      })),
    ];

    // Initialize cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "11px",
            "font-weight": 500,
            width: 60,
            height: 60,
            "text-wrap": "wrap",
            "text-max-width": "55px",
            "text-outline-color": "data(color)",
            "text-outline-width": 2,
            "border-width": 3,
            "border-color": "data(difficultyColor)",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#1e40af",
            "background-color": "#1e40af",
            width: 70,
            height: 70,
          },
        },
        {
          selector: `node[paperId = ${selectedPaperId}]`,
          style: {
            width: 70,
            height: 70,
            "font-size": "12px",
            "border-width": 4,
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#94a3b8",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#94a3b8",
            opacity: 0.6,
          },
        },
        {
          selector: 'edge[type = "prerequisite"]',
          style: {
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
            "line-style": "dashed",
          },
        },
        {
          selector: 'edge[type = "builds_on"]',
          style: {
            "line-color": "#3b82f6",
            "target-arrow-color": "#3b82f6",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 500,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
        nodeOverlap: 20,
        fit: true,
        padding: 40,
        randomize: false,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Add click handler
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const nodeData: ConceptNode = {
        id: node.data("id"),
        label: node.data("label"),
        paperId: node.data("paperId"),
        paperTitle: node.data("paperTitle"),
        difficulty: node.data("difficulty"),
        definition: node.data("definition"),
      };
      onNodeClick?.(nodeData);
    });

    cyRef.current = cy;
    setIsReady(true);

    // Cleanup
    return () => {
      cy.destroy();
    };
  }, [nodes, edges, selectedPaperId]);

  // Fit graph when window resizes
  useEffect(() => {
    const handleResize = () => {
      cyRef.current?.fit();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div className="text-slate-500">Loading graph...</div>
        </div>
      )}
    </div>
  );
}
