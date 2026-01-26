"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { QAPair } from "@/lib/static-data";

interface QuizCardProps {
  question: QAPair;
  onAnswer: (correct: boolean, quality: number) => void;
  onNext: () => void;
  showResult?: boolean;
}

export default function QuizCard({
  question,
  onAnswer,
  onNext,
  showResult = false,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Shuffle answers
  const allAnswers = [question.answer, ...question.distractors].sort(
    () => Math.random() - 0.5
  );

  const handleSelect = (answer: string) => {
    if (revealed) return;
    setSelectedAnswer(answer);
  };

  const handleReveal = () => {
    if (!selectedAnswer) return;
    setRevealed(true);

    const isCorrect = selectedAnswer === question.answer;
    // Quality rating for spaced repetition (0-5)
    // 5 = perfect, 4 = correct with hesitation, 3 = correct with hint
    // 2 = incorrect but remembered after seeing answer
    // 1 = incorrect, 0 = complete blackout
    let quality = isCorrect ? (showHint ? 3 : 4) : 2;
    onAnswer(isCorrect, quality);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowHint(false);
    setRevealed(false);
    onNext();
  };

  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            difficultyColors[question.difficulty]
          }`}
        >
          {question.difficulty}
        </span>
        <span className="text-xs text-slate-400 capitalize">{question.type}</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        {question.question}
      </h3>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {question.hint}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {allAnswers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrectAnswer = answer === question.answer;
          const showCorrect = revealed && isCorrectAnswer;
          const showWrong = revealed && isSelected && !isCorrectAnswer;

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(answer)}
              disabled={revealed}
              className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                showCorrect
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : showWrong
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
              whileHover={!revealed ? { scale: 1.01 } : {}}
              whileTap={!revealed ? { scale: 0.99 } : {}}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    showCorrect
                      ? "text-emerald-700 dark:text-emerald-300"
                      : showWrong
                      ? "text-red-700 dark:text-red-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {answer}
                </span>
                {showCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation (after reveal) */}
      <AnimatePresence>
        {revealed && question.explanation && (
          <motion.div
            className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Explanation
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {!revealed ? (
          <>
            <button
              onClick={() => setShowHint(true)}
              disabled={showHint}
              className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-600 disabled:opacity-50"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Hint</span>
            </button>
            <button
              onClick={handleReveal}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Check Answer
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedAnswer(null);
                setShowHint(false);
                setRevealed(false);
              }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Next Question
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
