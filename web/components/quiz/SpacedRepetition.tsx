"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useLearning } from "@/context/LearningContext";
import { getPaperQA, type QAPair } from "@/lib/static-data";
import QuizCard from "./QuizCard";
import { ProgressRing } from "@/components/gamification";

type QuizMode = "dueReviews" | "quickQuiz" | "paper";

interface SpacedRepetitionProps {
  paperId?: number;
  mode?: QuizMode;
}

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SpacedRepetition({ paperId, mode = "dueReviews" }: SpacedRepetitionProps) {
  const { dueReviews, scheduleReview, reviewsDueToday } = useLearning();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);

      if (mode === "paper" && paperId) {
        // Load specific paper's questions
        const qaData = await getPaperQA(paperId);
        if (qaData) {
          setQuestions(shuffleArray(qaData.questions).slice(0, 10)); // Limit to 10 questions
        }
      } else if (mode === "quickQuiz") {
        // Quick Quiz: Load random questions from all papers
        const allQuestions: QAPair[] = [];

        // Load questions from all 30 papers
        for (let pid = 1; pid <= 30; pid++) {
          try {
            const qaData = await getPaperQA(pid);
            if (qaData && qaData.questions) {
              allQuestions.push(...qaData.questions);
            }
          } catch (e) {
            // Paper might not have questions yet, skip it
          }
        }

        // Shuffle and pick 15 random questions
        const shuffled = shuffleArray(allQuestions);
        setQuestions(shuffled.slice(0, 15));
      } else {
        // Due Reviews mode: Load questions based on due reviews
        const questionsToLoad: QAPair[] = [];
        const paperIds = [...new Set(dueReviews.map((r) => r.paperId))];

        for (const pid of paperIds.slice(0, 3)) {
          // Max 3 papers per session
          const qaData = await getPaperQA(pid);
          if (qaData) {
            const dueForPaper = dueReviews.filter((r) => r.paperId === pid);
            const dueQuestionIds = dueForPaper.map((r) => r.questionId);
            const dueQuestions = qaData.questions.filter((q) =>
              dueQuestionIds.includes(q.id)
            );
            questionsToLoad.push(...dueQuestions);
          }
        }

        setQuestions(questionsToLoad.slice(0, 20)); // Limit to 20 questions
      }

      setLoading(false);
    }

    loadQuestions();
  }, [paperId, mode, dueReviews]);

  const handleAnswer = async (correct: boolean, quality: number) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    // Schedule next review using spaced repetition
    await scheduleReview(paperId || 0, currentQuestion.id, quality);

    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setStats({ correct: 0, total: 0 });
    setSessionComplete(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          All Caught Up!
        </h3>
        <p className="text-slate-500 mb-4">
          {paperId
            ? "No questions available for this paper yet."
            : "No reviews due today. Great job keeping up!"}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Next reviews will appear when scheduled</span>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const percentage = Math.round((stats.correct / stats.total) * 100);

    return (
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-center mb-6">
          <ProgressRing
            progress={percentage}
            size={120}
            strokeWidth={12}
            color={percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444"}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {percentage}%
              </div>
              <div className="text-xs text-slate-500">Score</div>
            </div>
          </ProgressRing>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Session Complete!
        </h3>
        <p className="text-slate-500 mb-6">
          You answered {stats.correct} of {stats.total} questions correctly.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={resetSession}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Review Again
          </button>
          <Link
            href="/papers"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Continue Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Brain className="w-4 h-4" />
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-500">
              {stats.correct} correct
            </span>
            <span className="text-slate-400">
              {stats.total - stats.correct} incorrect
            </span>
          </div>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        <QuizCard
          key={currentIndex}
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </AnimatePresence>
    </div>
  );
}
