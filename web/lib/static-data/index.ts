/**
 * Static data loading utilities for PWA.
 *
 * Loads precomputed content from JSON files bundled with the app.
 * All content is available offline through the service worker cache.
 */

import { PAPERS, LEARNING_PATHS } from "./papers";

export type Paper = (typeof PAPERS)[number];
export type LearningPath = (typeof LEARNING_PATHS)[keyof typeof LEARNING_PATHS];

// Re-export static data
export { PAPERS, LEARNING_PATHS };

// Types for precomputed content
export interface PaperSummary {
  paper_id: number;
  title: string;
  category: string;
  one_liner: string;
  paragraphs: string[];
  key_takeaways: string[];
  eli5: string;
  prerequisites?: string[];
  applications?: string[];
}

export interface Concept {
  name: string;
  definition: string;
  intuition: string;
  importance: string;
  related_concepts: string[];
  example: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface PaperConcepts {
  paper_id: number;
  title: string;
  concepts: Concept[];
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  type: "conceptual" | "applied" | "analytical";
  distractors: string[];
  hint: string;
}

export interface PaperQA {
  paper_id: number;
  title: string;
  questions: QAPair[];
  total_questions: number;
  stats: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface LearningStep {
  step_number: number;
  title: string;
  duration_minutes: number;
  content: string;
  key_points: string[];
  checkpoint_question: string;
  checkpoint_answer: string;
  tips: string[];
}

export interface LearningGuide {
  paper_id: number;
  title: string;
  total_steps: number;
  learning_guide: {
    introduction: string;
    objectives: string[];
    steps: LearningStep[];
    summary: string;
    next_steps: string[];
  };
}

export interface FAQ {
  id: string;
  category: "understanding" | "implementation" | "comparison" | "application" | "limitations";
  question: string;
  answer: string;
  related_concepts: string[];
  follow_up: string;
}

export interface PaperFAQ {
  paper_id: number;
  title: string;
  faqs: FAQ[];
  total_faqs: number;
  category_stats: Record<string, number>;
}

// Data loading functions
const PRECOMPUTED_BASE = "/data/precomputed";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${PRECOMPUTED_BASE}${path}`);
    if (!response.ok) {
      console.warn(`Failed to load: ${path}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
}

export async function getPaperSummary(paperId: number): Promise<PaperSummary | null> {
  return fetchJson<PaperSummary>(`/papers/${paperId}/summary.json`);
}

export async function getPaperConcepts(paperId: number): Promise<PaperConcepts | null> {
  return fetchJson<PaperConcepts>(`/papers/${paperId}/concepts.json`);
}

export async function getPaperQA(paperId: number): Promise<PaperQA | null> {
  return fetchJson<PaperQA>(`/papers/${paperId}/qa.json`);
}

export async function getLearningGuide(paperId: number): Promise<LearningGuide | null> {
  return fetchJson<LearningGuide>(`/papers/${paperId}/learning_steps.json`);
}

export async function getPaperFAQ(paperId: number): Promise<PaperFAQ | null> {
  return fetchJson<PaperFAQ>(`/papers/${paperId}/faq.json`);
}

// Get all content for a paper at once
export async function getAllPaperContent(paperId: number) {
  const [summary, concepts, qa, learning, faq] = await Promise.all([
    getPaperSummary(paperId),
    getPaperConcepts(paperId),
    getPaperQA(paperId),
    getLearningGuide(paperId),
    getPaperFAQ(paperId),
  ]);

  return { summary, concepts, qa, learning, faq };
}

// Cross-paper content
export interface KnowledgeGraphNode {
  id: number;
  title: string;
  category: string;
  difficulty: number;
  path: string;
}

export interface KnowledgeGraphEdge {
  source: number;
  target: number;
  type: "same_category" | "learning_sequence";
  category?: string;
  path?: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  generated_at: string;
}

export async function getKnowledgeGraph(): Promise<KnowledgeGraph | null> {
  return fetchJson<KnowledgeGraph>("/cross_paper/knowledge_graph.json");
}

export interface LearningPathData {
  name: string;
  description: string;
  papers: Array<{
    id: number;
    title: string;
    difficulty: number;
    time: number;
  }>;
  total_papers: number;
  total_time_minutes: number;
  average_difficulty: number;
}

export interface LearningPathsData {
  paths: Record<string, LearningPathData>;
  generated_at: string;
}

export async function getLearningPathsData(): Promise<LearningPathsData | null> {
  return fetchJson<LearningPathsData>("/cross_paper/learning_paths.json");
}

// Cache paper for offline use
export function cachePaperForOffline(paperId: number): void {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_PAPER",
      paperId,
    });
  }
}

// Get paper by ID
export function getPaperById(id: number): Paper | undefined {
  return PAPERS.find((p) => p.id === id);
}

// Get papers by path
export function getPapersByPath(path: string): Paper[] {
  return PAPERS.filter((p) => p.path === path);
}

// Get papers by category
export function getPapersByCategory(category: string): Paper[] {
  return PAPERS.filter((p) => p.category === category);
}
