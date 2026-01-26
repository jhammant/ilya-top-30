"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Loader2,
  BookOpen,
  Filter,
  Info,
  ChevronRight,
  X,
  Lightbulb,
  Link2,
  Star,
} from "lucide-react";
import ConceptGraph from "@/components/concepts/ConceptGraph";
import {
  PAPERS,
  getPaperConcepts,
  getKnowledgeGraph,
  type PaperConcepts,
  type Concept,
} from "@/lib/static-data";

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

function ConceptsContent() {
  const searchParams = useSearchParams();
  const filterPaperId = searchParams.get("paper")
    ? parseInt(searchParams.get("paper")!)
    : null;

  const [allConcepts, setAllConcepts] = useState<Map<number, PaperConcepts>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(filterPaperId);

  // Load concepts for all papers with precomputed data
  useEffect(() => {
    setIsLoading(true);
    const precomputedPapers = [1, 2, 3, 4, 13]; // Papers with precomputed data initially

    Promise.all(precomputedPapers.map((id) => getPaperConcepts(id))).then((results) => {
      const conceptMap = new Map<number, PaperConcepts>();
      results.forEach((result, idx) => {
        if (result) {
          conceptMap.set(precomputedPapers[idx], result);
        }
      });
      setAllConcepts(conceptMap);
      setIsLoading(false);
    });
  }, []);

  // Build graph data from concepts
  const buildGraphData = () => {
    const nodes: ConceptNode[] = [];
    const edges: ConceptEdge[] = [];
    const conceptNameToId = new Map<string, string>();

    allConcepts.forEach((paperConcepts, paperId) => {
      // Filter by paper if specified
      if (selectedPaperId && paperId !== selectedPaperId) return;

      const paper = PAPERS.find((p) => p.id === paperId);
      if (!paper) return;

      paperConcepts.concepts.forEach((concept, idx) => {
        const nodeId = `${paperId}-${idx}`;
        conceptNameToId.set(concept.name.toLowerCase(), nodeId);

        nodes.push({
          id: nodeId,
          label: concept.name,
          paperId,
          paperTitle: paper.title,
          difficulty: concept.difficulty,
          definition: concept.definition,
        });
      });
    });

    // Build edges based on related concepts
    allConcepts.forEach((paperConcepts, paperId) => {
      if (selectedPaperId && paperId !== selectedPaperId) return;

      paperConcepts.concepts.forEach((concept, idx) => {
        const sourceId = `${paperId}-${idx}`;

        concept.related_concepts?.forEach((relatedName) => {
          const targetId = conceptNameToId.get(relatedName.toLowerCase());
          if (targetId && targetId !== sourceId) {
            // Avoid duplicate edges
            const edgeExists = edges.some(
              (e) =>
                (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
            );
            if (!edgeExists) {
              edges.push({
                source: sourceId,
                target: targetId,
                type: "related",
              });
            }
          }
        });
      });
    });

    return { nodes, edges };
  };

  const { nodes, edges } = buildGraphData();

  const handleNodeClick = (node: ConceptNode) => {
    setSelectedConcept(node);
  };

  const getConceptDetails = (node: ConceptNode): Concept | null => {
    const paperConcepts = allConcepts.get(node.paperId);
    if (!paperConcepts) return null;
    return paperConcepts.concepts.find((c) => c.name === node.label) || null;
  };

  const conceptDetails = selectedConcept ? getConceptDetails(selectedConcept) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Concept Map
            </h1>
            <p className="text-slate-500">
              Explore connections between {nodes.length} concepts
            </p>
          </div>

          {/* Paper Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPaperId || ""}
              onChange={(e) =>
                setSelectedPaperId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">All Papers</option>
              {[...allConcepts.keys()].map((id) => {
                const paper = PAPERS.find((p) => p.id === id);
                return paper ? (
                  <option key={id} value={id}>
                    #{id} {paper.title}
                  </option>
                ) : null;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Graph */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {nodes.length > 0 ? (
            <ConceptGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              selectedPaperId={selectedPaperId || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No concepts available yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Concepts are being generated
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          {selectedConcept && conceptDetails ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {selectedConcept.label}
                    </h3>
                    <Link
                      href={`/learn?paper=${selectedConcept.paperId}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                    >
                      {selectedConcept.paperTitle}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <button
                    onClick={() => setSelectedConcept(null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <span
                  className={`inline-block mt-2 text-xs font-bold uppercase px-2 py-0.5 rounded ${
                    conceptDetails.difficulty === "beginner"
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      : conceptDetails.difficulty === "intermediate"
                        ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                        : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                  }`}
                >
                  {conceptDetails.difficulty}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Definition */}
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Definition
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {conceptDetails.definition}
                  </p>
                </div>

                {/* Intuition */}
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Intuition
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {conceptDetails.intuition}
                  </p>
                </div>

                {/* Importance */}
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Why It Matters
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {conceptDetails.importance}
                  </p>
                </div>

                {/* Example */}
                {conceptDetails.example && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Example
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-200">
                      {conceptDetails.example}
                    </p>
                  </div>
                )}

                {/* Related Concepts */}
                {conceptDetails.related_concepts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Related Concepts
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {conceptDetails.related_concepts.map((rc, i) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                        >
                          {rc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={`/learn?paper=${selectedConcept.paperId}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  Study This Paper
                </Link>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Select a concept</p>
                <p className="text-sm text-slate-400 mt-1">
                  Click on a node in the graph to see details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-600" />
          <span className="text-slate-500">Beginner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-600" />
          <span className="text-slate-500">Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600" />
          <span className="text-slate-500">Advanced</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-6 h-0.5 bg-slate-400" />
          <span className="text-slate-500">Related</span>
        </div>
      </div>
    </div>
  );
}

export default function ConceptsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ConceptsContent />
    </Suspense>
  );
}
