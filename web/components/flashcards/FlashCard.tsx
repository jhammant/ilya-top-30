"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Check, X, HelpCircle, Lightbulb, ChevronRight } from "lucide-react";

interface FlashCardProps {
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  onAnswer: (correct: boolean, confidence: 1 | 2 | 3 | 4 | 5) => void;
}

export default function FlashCard({
  question,
  answer,
  hint,
  explanation,
  difficulty,
  onAnswer,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    setShowExplanation(false);
  }, [question]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleConfidenceRating = (confidence: 1 | 2 | 3 | 4 | 5) => {
    // SM-2 considers 3+ as correct
    const correct = confidence >= 3;
    onAnswer(correct, confidence);
  };

  const difficultyColors = {
    easy: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    medium: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    hard: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card container with flip animation */}
      <div
        className="relative w-full min-h-[320px] md:min-h-[400px] cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of card (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Question
                </span>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${difficultyColors[difficulty]}`}>
                  {difficulty}
                </span>
              </div>

              {/* Question - scrollable */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto">
                <p className="text-lg md:text-2xl text-slate-900 dark:text-white text-center leading-relaxed">
                  {question}
                </p>
              </div>

              {/* Hint button */}
              {hint && !showHint && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 mx-auto mt-4 flex-shrink-0"
                >
                  <Lightbulb className="w-4 h-4" />
                  Show Hint
                </button>
              )}

              {/* Hint display */}
              {showHint && hint && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center flex-shrink-0">
                  <p className="text-sm text-blue-700 dark:text-blue-300">{hint}</p>
                </div>
              )}

              {/* Flip indicator */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-400 flex-shrink-0">
                <RotateCcw className="w-4 h-4" />
                <span>Click to reveal answer</span>
              </div>
            </div>
          </div>

          {/* Back of card (Answer) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col text-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <span className="text-sm text-blue-200 font-medium">Answer</span>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-white/20`}>
                  {difficulty}
                </span>
              </div>

              {/* Answer - scrollable */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto">
                <p className="text-base md:text-xl text-center leading-relaxed">{answer}</p>
              </div>

              {/* Explanation toggle */}
              {explanation && (
                <div className="mt-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExplanation(!showExplanation);
                    }}
                    className="flex items-center gap-2 text-sm text-blue-200 hover:text-white mx-auto"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {showExplanation ? "Hide" : "Show"} Explanation
                  </button>
                  {showExplanation && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm text-blue-100">{explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Rating (shown when flipped) */}
      {isFlipped && (
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            How well did you know this?
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleConfidenceRating(1)}
              className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Forgot
            </button>
            <button
              onClick={() => handleConfidenceRating(2)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Hard
            </button>
            <button
              onClick={() => handleConfidenceRating(3)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Good
            </button>
            <button
              onClick={() => handleConfidenceRating(4)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Easy
            </button>
            <button
              onClick={() => handleConfidenceRating(5)}
              className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Perfect
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">
            Your answer affects when you'll see this card again
          </p>
        </div>
      )}
    </div>
  );
}
