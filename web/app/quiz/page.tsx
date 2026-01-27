"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ArrowLeft,
  Calendar,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";
import { SpacedRepetition } from "@/components/quiz";
import { useLearning } from "@/context/LearningContext";
import { XPBar, StreakCounter } from "@/components/gamification";
import { PAPERS } from "@/lib/static-data/papers";

function QuizContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paper")
    ? parseInt(searchParams.get("paper")!)
    : null;
  const { reviewsDueToday } = useLearning();

  const paper = paperId ? PAPERS.find((p) => p.id === paperId) : null;

  return (
    <div className="min-h-screen py-4 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {paper ? paper.title : "Quiz & Review"}
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              {paper
                ? "Test your knowledge of this paper"
                : "Practice with spaced repetition"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <XPBar compact />
          <StreakCounter compact />
        </div>
      </div>

      {/* Quiz Mode Selector (when no paper specified) */}
      {!paper && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-500 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Due Reviews
                </div>
                <div className="text-xs text-indigo-500">
                  {reviewsDueToday} cards due
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Review cards scheduled for today using spaced repetition
            </p>
          </button>

          <Link
            href="/papers"
            className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-left transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Practice Paper
                </div>
                <div className="text-xs text-slate-400">Choose a paper</div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Practice questions from a specific paper
            </p>
          </Link>

          <button className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-left transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Quick Quiz
                </div>
                <div className="text-xs text-slate-400">Random mix</div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Random questions from all papers
            </p>
          </button>
        </div>
      )}

      {/* Quiz Component */}
      <SpacedRepetition paperId={paperId || undefined} />

      {/* Paper Info (when paper specified) */}
      {paper && (
        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {paper.title}
              </div>
              <div className="text-xs text-slate-500">
                {paper.category} - Difficulty {paper.difficulty}/5
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
