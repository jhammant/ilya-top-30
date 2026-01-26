"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Loader2,
  Trophy,
  Flame,
  Clock,
  BarChart3,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import FlashCard from "@/components/flashcards/FlashCard";
import {
  PAPERS,
  getPaperQA,
  type PaperQA,
  type QAPair,
} from "@/lib/static-data";
import { useLearning } from "@/context/LearningContext";

// SM-2 Spaced Repetition Algorithm
interface CardState {
  questionId: string;
  easiness: number; // 1.3 to 2.5
  interval: number; // days
  repetitions: number;
  nextReview: Date;
  lastReview?: Date;
}

function calculateSM2(
  state: CardState,
  quality: 1 | 2 | 3 | 4 | 5
): CardState {
  const { easiness, interval, repetitions } = state;

  let newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEasiness = Math.max(1.3, Math.min(2.5, newEasiness));

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed
    newRepetitions = repetitions + 1;
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEasiness);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    ...state,
    easiness: newEasiness,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
    lastReview: new Date(),
  };
}

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paper") ? parseInt(searchParams.get("paper")!) : null;

  const { addXP } = useLearning();

  const [qa, setQA] = useState<PaperQA | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<QAPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Map<string, CardState>>(new Map());
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    streak: 0,
    maxStreak: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  const paper = paperId ? PAPERS.find((p) => p.id === paperId) : null;

  // Load saved card states from localStorage
  useEffect(() => {
    const savedStates = localStorage.getItem("flashcard-states");
    if (savedStates) {
      const parsed = JSON.parse(savedStates);
      const stateMap = new Map<string, CardState>();
      for (const [key, value] of Object.entries(parsed)) {
        stateMap.set(key, {
          ...(value as CardState),
          nextReview: new Date((value as CardState).nextReview),
          lastReview: (value as CardState).lastReview
            ? new Date((value as CardState).lastReview!)
            : undefined,
        });
      }
      setCardStates(stateMap);
    }
  }, []);

  // Load Q&A data
  useEffect(() => {
    if (paperId) {
      setIsLoading(true);
      getPaperQA(paperId).then((data) => {
        setQA(data);
        if (data) {
          // Sort by due date (cards due today first)
          const sortedCards = [...data.questions].sort((a, b) => {
            const stateA = cardStates.get(`${paperId}-${a.id}`);
            const stateB = cardStates.get(`${paperId}-${b.id}`);
            if (!stateA && !stateB) return 0;
            if (!stateA) return -1;
            if (!stateB) return 1;
            return new Date(stateA.nextReview).getTime() - new Date(stateB.nextReview).getTime();
          });
          setCards(sortedCards);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [paperId]);

  // Save card states to localStorage
  const saveCardStates = (states: Map<string, CardState>) => {
    const obj: Record<string, CardState> = {};
    states.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem("flashcard-states", JSON.stringify(obj));
  };

  const handleAnswer = (correct: boolean, confidence: 1 | 2 | 3 | 4 | 5) => {
    if (!qa || !cards[currentIndex]) return;

    const card = cards[currentIndex];
    const stateKey = `${paperId}-${card.id}`;
    const currentState = cardStates.get(stateKey) || {
      questionId: card.id,
      easiness: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: new Date(),
    };

    const newState = calculateSM2(currentState, confidence);

    const newStates = new Map(cardStates);
    newStates.set(stateKey, newState);
    setCardStates(newStates);
    saveCardStates(newStates);

    // Update session stats
    setSessionStats((prev) => {
      const newStreak = correct ? prev.streak + 1 : 0;
      return {
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (correct ? 1 : 0),
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
    });

    // Award XP
    if (correct) {
      addXP(5, "Flashcard correct");
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsComplete(false);
    setSessionStats({ reviewed: 0, correct: 0, streak: 0, maxStreak: 0 });
  };

  // Calculate due cards
  const getDueCards = () => {
    if (!cards) return 0;
    const now = new Date();
    return cards.filter((card) => {
      const state = cardStates.get(`${paperId}-${card.id}`);
      if (!state) return true; // New cards are always due
      return new Date(state.nextReview) <= now;
    }).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!paperId || !paper) {
    // Show paper selection
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Flashcards
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Master concepts with spaced repetition
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {PAPERS.map((p) => (
            <Link
              key={p.id}
              href={`/flashcards?paper=${p.id}`}
              className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-500">#{p.id}</span>
                  <h3 className="font-semibold text-slate-900 dark:text-white mt-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{p.category}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!qa || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No flashcards available
        </h2>
        <p className="text-slate-500 mb-6">
          Flashcards for this paper are being generated.
        </p>
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Choose Another Paper
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All Flashcards
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {paper.title}
            </h1>
            <p className="text-slate-500">
              {cards.length} cards • {getDueCards()} due today
            </p>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {sessionStats.reviewed}
          </div>
          <div className="text-xs text-slate-500">Reviewed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {sessionStats.reviewed > 0
              ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
              : 0}
            %
          </div>
          <div className="text-xs text-slate-500">Accuracy</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {sessionStats.streak}
          </div>
          <div className="text-xs text-slate-500">Streak</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentIndex + 1}/{cards.length}
          </div>
          <div className="text-xs text-slate-500">Progress</div>
        </div>
      </div>

      {/* Session Complete */}
      {isComplete ? (
        <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            You reviewed {sessionStats.reviewed} cards with {sessionStats.correct} correct
          </p>
          <p className="text-slate-500 mb-6">
            Best streak: {sessionStats.maxStreak} cards
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={restartSession}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Study Again
            </button>
            <Link
              href={`/learn?paper=${paperId}`}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Back to Paper
            </Link>
          </div>
        </div>
      ) : (
        /* Current Card */
        <FlashCard
          question={cards[currentIndex].question}
          answer={cards[currentIndex].answer}
          hint={cards[currentIndex].hint}
          explanation={cards[currentIndex].explanation}
          difficulty={cards[currentIndex].difficulty}
          onAnswer={handleAnswer}
        />
      )}

      {/* Progress bar */}
      {!isComplete && (
        <div className="mt-8">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <FlashcardsContent />
    </Suspense>
  );
}
