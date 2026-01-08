"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  BookOpen,
  CheckCircle2,
  Circle,
} from "lucide-react";

// Paper nodes with positions and relationships
const PAPERS = [
  // Complexity Theory cluster (top left)
  { id: 1, title: "The First Law of Complexodynamics", short: "Complexodynamics", category: "Complexity Theory", x: 100, y: 100 },
  { id: 19, title: "Quantifying Complexity (Coffee Automaton)", short: "Coffee Automaton", category: "Complexity Theory", x: 200, y: 180 },

  // Information Theory cluster (left)
  { id: 5, title: "Minimizing Description Length of Weights", short: "MDL Weights", category: "Information Theory", x: 80, y: 320 },
  { id: 23, title: "MDL Principle Tutorial", short: "MDL Tutorial", category: "Information Theory", x: 180, y: 400 },
  { id: 25, title: "Kolmogorov Complexity", short: "Kolmogorov", category: "Information Theory", x: 100, y: 500 },

  // RNNs cluster (center left)
  { id: 2, title: "Effectiveness of RNNs", short: "RNN Blog", category: "RNNs", x: 320, y: 120 },
  { id: 3, title: "Understanding LSTM Networks", short: "LSTMs", category: "RNNs", x: 420, y: 80 },
  { id: 4, title: "RNN Regularization", short: "RNN Reg", category: "RNNs", x: 380, y: 200 },
  { id: 18, title: "Relational RNNs", short: "Relational RNN", category: "RNNs", x: 480, y: 160 },

  // Sequence Models (center)
  { id: 6, title: "Pointer Networks", short: "Pointer Nets", category: "Sequence Models", x: 550, y: 280 },
  { id: 8, title: "Sequence to Sequence for Sets", short: "Seq2Seq Sets", category: "Sequence Models", x: 450, y: 340 },

  // Attention & Transformers (center right) - THE CORE
  { id: 14, title: "Bahdanau Attention", short: "Attention", category: "Attention", x: 600, y: 180 },
  { id: 13, title: "Attention Is All You Need", short: "Transformer", category: "Transformers", x: 700, y: 280, isCore: true },

  // CNNs cluster (bottom center)
  { id: 7, title: "AlexNet (ImageNet)", short: "AlexNet", category: "CNNs", x: 300, y: 480, isCore: true },
  { id: 10, title: "Deep Residual Learning (ResNet)", short: "ResNet", category: "CNNs", x: 420, y: 540, isCore: true },
  { id: 15, title: "Identity Mappings in ResNets", short: "ResNet v2", category: "CNNs", x: 520, y: 600 },
  { id: 11, title: "Dilated Convolutions", short: "Dilated Conv", category: "CNNs", x: 300, y: 600 },
  { id: 26, title: "CS231n Course", short: "CS231n", category: "CNNs", x: 180, y: 560 },

  // Scaling cluster (right)
  { id: 9, title: "GPipe (Pipeline Parallelism)", short: "GPipe", category: "Scaling", x: 800, y: 400 },
  { id: 22, title: "Scaling Laws for LLMs", short: "Scaling Laws", category: "Scaling", x: 850, y: 320, isCore: true },

  // Memory & Reasoning (top right)
  { id: 20, title: "Neural Turing Machines", short: "NTM", category: "Memory Networks", x: 750, y: 100 },
  { id: 16, title: "Relational Reasoning", short: "Relation Net", category: "Reasoning", x: 850, y: 180 },

  // Graph Neural Networks (bottom right)
  { id: 12, title: "Neural Message Passing", short: "Message Passing", category: "Graph Neural Networks", x: 700, y: 480 },

  // Generative Models
  { id: 17, title: "Variational Lossy Autoencoder", short: "VLAE", category: "Generative Models", x: 600, y: 540 },

  // Speech
  { id: 21, title: "Deep Speech 2", short: "DeepSpeech", category: "Speech", x: 850, y: 500 },

  // AGI
  { id: 24, title: "Machine Super Intelligence", short: "Superintelligence", category: "AGI", x: 900, y: 80 },
];

// Edges showing conceptual connections
const EDGES = [
  // RNN progression
  { from: 2, to: 3, label: "explains" },
  { from: 3, to: 4, label: "regularizes" },
  { from: 4, to: 18, label: "extends" },

  // Complexity Theory
  { from: 1, to: 19, label: "formalizes" },

  // Information Theory chain
  { from: 5, to: 23, label: "theory" },
  { from: 23, to: 25, label: "foundations" },

  // RNN to Attention evolution
  { from: 3, to: 14, label: "enables" },
  { from: 4, to: 14, label: "precedes" },

  // Attention to Transformer
  { from: 14, to: 13, label: "leads to" },
  { from: 6, to: 13, label: "influences" },
  { from: 8, to: 13, label: "informs" },

  // CNN progression
  { from: 26, to: 7, label: "teaches" },
  { from: 7, to: 10, label: "improved by" },
  { from: 10, to: 15, label: "analyzed in" },
  { from: 10, to: 11, label: "extended by" },

  // Transformer applications
  { from: 13, to: 22, label: "studied in" },
  { from: 13, to: 9, label: "scaled by" },
  { from: 22, to: 9, label: "guides" },

  // Memory networks
  { from: 3, to: 20, label: "inspires" },
  { from: 14, to: 20, label: "related" },
  { from: 20, to: 16, label: "reasoning" },

  // Graph networks
  { from: 14, to: 12, label: "attention" },
  { from: 10, to: 12, label: "architecture" },

  // Generative models
  { from: 5, to: 17, label: "compression" },

  // Speech
  { from: 3, to: 21, label: "used in" },
  { from: 10, to: 21, label: "architecture" },

  // AGI connections
  { from: 22, to: 24, label: "implications" },
  { from: 1, to: 24, label: "theory" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Complexity Theory": "#8b5cf6",
  "RNNs": "#3b82f6",
  "Information Theory": "#6366f1",
  "Sequence Models": "#0ea5e9",
  "CNNs": "#10b981",
  "Scaling": "#f59e0b",
  "Graph Neural Networks": "#ec4899",
  "Transformers": "#ef4444",
  "Attention": "#f97316",
  "Reasoning": "#14b8a6",
  "Generative Models": "#a855f7",
  "Memory Networks": "#06b6d4",
  "Speech": "#84cc16",
  "AGI": "#dc2626",
};

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPaper, setSelectedPaper] = useState<typeof PAPERS[0] | null>(null);
  const [completedPapers, setCompletedPapers] = useState<number[]>([]);
  const [hoveredPaper, setHoveredPaper] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("completedPapers");
    if (saved) {
      setCompletedPapers(JSON.parse(saved));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === "svg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(2, z * delta)));
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getConnectedPapers = (paperId: number) => {
    const connected = new Set<number>();
    EDGES.forEach(edge => {
      if (edge.from === paperId) connected.add(edge.to);
      if (edge.to === paperId) connected.add(edge.from);
    });
    return connected;
  };

  const connectedPapers = hoveredPaper ? getConnectedPapers(hoveredPaper) : new Set<number>();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/papers"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Papers</span>
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Paper Relationship Graph
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.min(2, z * 1.2))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Graph Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="bg-slate-100 dark:bg-slate-800"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#94a3b8"
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Draw edges */}
              {EDGES.map((edge, i) => {
                const fromPaper = PAPERS.find(p => p.id === edge.from);
                const toPaper = PAPERS.find(p => p.id === edge.to);
                if (!fromPaper || !toPaper) return null;

                const isHighlighted = hoveredPaper === edge.from || hoveredPaper === edge.to;
                const opacity = hoveredPaper ? (isHighlighted ? 1 : 0.15) : 0.4;

                // Calculate control point for curved line
                const midX = (fromPaper.x + toPaper.x) / 2;
                const midY = (fromPaper.y + toPaper.y) / 2;
                const dx = toPaper.x - fromPaper.x;
                const dy = toPaper.y - fromPaper.y;
                const offset = 20;
                const ctrlX = midX - dy * 0.1;
                const ctrlY = midY + dx * 0.1;

                return (
                  <g key={i}>
                    <path
                      d={`M ${fromPaper.x} ${fromPaper.y} Q ${ctrlX} ${ctrlY} ${toPaper.x} ${toPaper.y}`}
                      fill="none"
                      stroke={isHighlighted ? "#3b82f6" : "#94a3b8"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      opacity={opacity}
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}

              {/* Draw nodes */}
              {PAPERS.map(paper => {
                const isCompleted = completedPapers.includes(paper.id);
                const isHovered = hoveredPaper === paper.id;
                const isConnected = connectedPapers.has(paper.id);
                const opacity = hoveredPaper ? (isHovered || isConnected ? 1 : 0.3) : 1;
                const color = CATEGORY_COLORS[paper.category] || "#64748b";

                return (
                  <g
                    key={paper.id}
                    transform={`translate(${paper.x}, ${paper.y})`}
                    onClick={() => setSelectedPaper(paper)}
                    onMouseEnter={() => setHoveredPaper(paper.id)}
                    onMouseLeave={() => setHoveredPaper(null)}
                    className="cursor-pointer"
                    style={{ opacity }}
                  >
                    {/* Node background */}
                    <circle
                      r={paper.isCore ? 35 : 28}
                      fill={color}
                      opacity={0.2}
                      filter={isHovered ? "url(#glow)" : undefined}
                    />
                    <circle
                      r={paper.isCore ? 30 : 24}
                      fill={isCompleted ? color : "white"}
                      stroke={color}
                      strokeWidth={paper.isCore ? 3 : 2}
                      className="dark:fill-slate-800"
                    />

                    {/* Completion indicator */}
                    {isCompleted && (
                      <circle
                        r={paper.isCore ? 30 : 24}
                        fill={color}
                        opacity={0.9}
                      />
                    )}

                    {/* Paper ID */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={paper.isCore ? 14 : 12}
                      fontWeight="bold"
                      fill={isCompleted ? "white" : color}
                    >
                      {paper.id}
                    </text>

                    {/* Paper title (below node) */}
                    <text
                      y={paper.isCore ? 45 : 38}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#64748b"
                      className="dark:fill-slate-400"
                    >
                      {paper.short}
                    </text>

                    {/* Core paper indicator */}
                    {paper.isCore && (
                      <text
                        y={-42}
                        textAnchor="middle"
                        fontSize={9}
                        fill={color}
                        fontWeight="bold"
                      >
                        ★ CORE
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
          {selectedPaper ? (
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedPaper.category] }}
                >
                  {selectedPaper.id}
                </div>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {selectedPaper.title}
              </h2>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedPaper.category] }}
                >
                  {selectedPaper.category}
                </span>
                {completedPapers.includes(selectedPaper.id) && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Connected Papers
                </h3>
                <div className="space-y-2">
                  {EDGES.filter(e => e.from === selectedPaper.id || e.to === selectedPaper.id).map((edge, i) => {
                    const otherId = edge.from === selectedPaper.id ? edge.to : edge.from;
                    const otherPaper = PAPERS.find(p => p.id === otherId);
                    const direction = edge.from === selectedPaper.id ? "→" : "←";

                    return otherPaper ? (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => setSelectedPaper(otherPaper)}
                      >
                        <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                          {otherId}
                        </span>
                        <span>{direction}</span>
                        <span>{otherPaper.short}</span>
                        <span className="text-xs text-slate-400">({edge.label})</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <Link
                href={`/papers?paper=${selectedPaper.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View Paper Details
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900 dark:text-white">How to Use</h2>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-6">
                <li>• Click a node to see paper details</li>
                <li>• Hover to highlight connections</li>
                <li>• Drag to pan around the graph</li>
                <li>• Scroll to zoom in/out</li>
                <li>• ★ CORE papers are most influential</li>
              </ul>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Categories</h3>
              <div className="space-y-2">
                {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{category}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Progress</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{completedPapers.length} / {PAPERS.length} papers completed</span>
                </div>
                <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(completedPapers.length / PAPERS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
