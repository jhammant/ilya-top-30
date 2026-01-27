"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Trophy,
  Play,
  Star,
  ChevronRight,
  Network,
  GraduationCap,
  Sparkles,
  Award,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import Confetti from "@/components/Confetti";

// Complete paper data with learning paths
const PAPERS = [
  { id: 1, title: "The First Law of Complexodynamics", category: "Complexity Theory", difficulty: 4, time: 30, path: "theory" },
  { id: 2, title: "The Unreasonable Effectiveness of RNNs", category: "RNNs", difficulty: 2, time: 45, path: "foundations" },
  { id: 3, title: "Understanding LSTM Networks", category: "RNNs", difficulty: 2, time: 30, path: "foundations" },
  { id: 4, title: "Recurrent Neural Network Regularization", category: "RNNs", difficulty: 3, time: 60, path: "foundations" },
  { id: 5, title: "Keeping Neural Networks Simple (MDL)", category: "Information Theory", difficulty: 4, time: 90, path: "theory" },
  { id: 6, title: "Pointer Networks", category: "Sequence Models", difficulty: 3, time: 75, path: "transformers" },
  { id: 7, title: "ImageNet Classification (AlexNet)", category: "CNNs", difficulty: 2, time: 60, path: "vision" },
  { id: 8, title: "Order Matters: Seq2Seq for Sets", category: "Sequence Models", difficulty: 3, time: 60, path: "transformers" },
  { id: 9, title: "GPipe: Pipeline Parallelism", category: "Scaling", difficulty: 3, time: 45, path: "transformers" },
  { id: 10, title: "Deep Residual Learning (ResNet)", category: "CNNs", difficulty: 2, time: 60, path: "vision" },
  { id: 11, title: "Dilated Convolutions", category: "CNNs", difficulty: 3, time: 45, path: "vision" },
  { id: 12, title: "Neural Message Passing", category: "GNNs", difficulty: 4, time: 90, path: "vision" },
  { id: 13, title: "Attention Is All You Need", category: "Transformers", difficulty: 3, time: 120, path: "transformers" },
  { id: 14, title: "Neural Machine Translation (Attention)", category: "Attention", difficulty: 3, time: 90, path: "transformers" },
  { id: 15, title: "Identity Mappings in ResNets", category: "CNNs", difficulty: 3, time: 45, path: "vision" },
  { id: 16, title: "Relational Reasoning Networks", category: "Reasoning", difficulty: 3, time: 60, path: "theory" },
  { id: 17, title: "Variational Lossy Autoencoder", category: "Generative", difficulty: 4, time: 90, path: "theory" },
  { id: 18, title: "Relational Recurrent Neural Networks", category: "RNNs", difficulty: 4, time: 60, path: "foundations" },
  { id: 19, title: "The Coffee Automaton", category: "Complexity Theory", difficulty: 5, time: 120, path: "theory" },
  { id: 20, title: "Neural Turing Machines", category: "Memory Networks", difficulty: 4, time: 90, path: "theory" },
  { id: 21, title: "Deep Speech 2", category: "Speech", difficulty: 3, time: 75, path: "foundations" },
  { id: 22, title: "Scaling Laws for Neural LMs", category: "Scaling", difficulty: 3, time: 90, path: "transformers" },
  { id: 23, title: "MDL Principle Tutorial", category: "Information Theory", difficulty: 4, time: 180, path: "theory" },
  { id: 24, title: "Machine Super Intelligence", category: "AGI", difficulty: 4, time: 240, path: "theory" },
  { id: 25, title: "Kolmogorov Complexity", category: "Information Theory", difficulty: 5, time: 600, path: "theory" },
  { id: 26, title: "CS231n Course", category: "CNNs", difficulty: 2, time: 1200, path: "vision" },
];

// Curated learning paths with specific paper order
const LEARNING_PATHS = {
  foundations: {
    name: "Foundations",
    icon: GraduationCap,
    color: "blue",
    papers: [3, 2, 4, 18, 21],
    description: "Start here! Learn RNNs, LSTMs, and the basics",
  },
  transformers: {
    name: "Transformers",
    icon: Zap,
    color: "purple",
    papers: [14, 13, 6, 8, 9, 22],
    description: "Master attention and the Transformer architecture",
  },
  vision: {
    name: "Computer Vision",
    icon: Target,
    color: "emerald",
    papers: [26, 7, 10, 15, 11, 12],
    description: "Deep dive into CNNs and visual understanding",
  },
  theory: {
    name: "Theory & AGI",
    icon: Brain,
    color: "amber",
    papers: [1, 19, 5, 23, 25, 16, 17, 20, 24],
    description: "Advanced theory, complexity, and AGI concepts",
  },
};

const COLOR_MAP: Record<string, { bg: string; text: string; gradient: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", gradient: "from-blue-500 to-blue-600" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", gradient: "from-purple-500 to-purple-600" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", gradient: "from-amber-500 to-amber-600" },
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function LearningDashboard() {
  const [completedPapers, setCompletedPapers] = useState<Set<number>>(new Set());
  const [activePath, setActivePath] = useState<string>("foundations");
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("completedPapers");
    if (saved) {
      const completed = new Set<number>(JSON.parse(saved));
      setCompletedPapers(completed);

      const pathProgress = Object.entries(LEARNING_PATHS).map(([key, path]) => ({
        key,
        completed: path.papers.filter(id => completed.has(id)).length,
        total: path.papers.length,
      }));

      const inProgress = pathProgress.find(p => p.completed > 0 && p.completed < p.total);
      const notStarted = pathProgress.find(p => p.completed === 0);

      if (inProgress) {
        setActivePath(inProgress.key);
      } else if (notStarted) {
        setActivePath(notStarted.key);
      }
    }

    const savedStreak = localStorage.getItem("studyStreak");
    if (savedStreak) setStreak(parseInt(savedStreak));

    const savedCurrent = localStorage.getItem("currentPaper");
    if (savedCurrent) setCurrentPaper(parseInt(savedCurrent));
  }, []);

  const markComplete = (paperId: number) => {
    const newCompleted = new Set(completedPapers);
    newCompleted.add(paperId);
    setCompletedPapers(newCompleted);
    localStorage.setItem("completedPapers", JSON.stringify([...newCompleted]));

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastStudyDate");
    if (lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("studyStreak", newStreak.toString());
      localStorage.setItem("lastStudyDate", today);
    }

    setShowConfetti(true);
    setCurrentPaper(null);
    localStorage.removeItem("currentPaper");
  };

  const currentPathData = LEARNING_PATHS[activePath as keyof typeof LEARNING_PATHS];
  const pathPapers = currentPathData.papers.map(id => PAPERS.find(p => p.id === id)!);
  const pathCompleted = pathPapers.filter(p => completedPapers.has(p.id)).length;
  const totalProgress = (completedPapers.size / PAPERS.length) * 100;
  const currentPaperData = currentPaper ? PAPERS.find(p => p.id === currentPaper) : null;

  return (
    <div className="min-h-screen pb-8">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Hero Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Your Learning Journey
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              Master the foundations of modern AI, one paper at a time
            </p>
          </div>

          {/* Stats badges - horizontal scroll on mobile */}
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex-shrink-0">
              <Flame className="w-4 sm:w-5 h-4 sm:h-5 text-orange-500" />
              <span className="font-bold text-sm sm:text-base text-orange-600 dark:text-orange-400 whitespace-nowrap">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex-shrink-0">
              <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
              <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{Math.round(totalProgress)}% complete</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Overall Progress</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{completedPapers.size} / {PAPERS.length} papers</span>
          </div>
          <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="hidden sm:flex justify-between mt-2 text-xs text-slate-400">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
            <span>Expert</span>
          </div>
        </div>
      </div>

      {/* Currently Reading */}
      {currentPaperData && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <BookOpen className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Currently Reading</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold mb-2">{currentPaperData.title}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-blue-100 mb-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                {formatTime(currentPaperData.time)}
              </span>
              <span>{currentPaperData.category}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href={`/learn?paper=${currentPaperData.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base"
              >
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                Continue Learning
              </Link>
              <button
                onClick={() => markComplete(currentPaperData.id)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" />
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Paths */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Learning Paths</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {Object.entries(LEARNING_PATHS).map(([key, path]) => {
            const Icon = path.icon;
            const colors = COLOR_MAP[path.color];
            const completed = path.papers.filter(id => completedPapers.has(id)).length;
            const progress = (completed / path.papers.length) * 100;
            const isActive = activePath === key;

            return (
              <button
                key={key}
                onClick={() => setActivePath(key)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                  isActive
                    ? `border-${path.color}-500 bg-${path.color}-50 dark:bg-${path.color}-900/20`
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 active:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">{path.name}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500">{completed}/{path.papers.length}</div>
                  </div>
                </div>
                <div className="h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.gradient} transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Path Papers + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Papers List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${COLOR_MAP[currentPathData.color].gradient} flex items-center justify-center flex-shrink-0`}>
                    <currentPathData.icon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{currentPathData.name} Path</h3>
                    <p className="text-xs sm:text-sm text-slate-500 truncate hidden sm:block">{currentPathData.description}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 flex-shrink-0">
                  {pathCompleted}/{pathPapers.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {pathPapers.map((paper, index) => {
                const isCompleted = completedPapers.has(paper.id);
                const isCurrent = currentPaper === paper.id;
                const isRecommended = index === 0 || completedPapers.has(pathPapers[index - 1].id);

                return (
                  <Link
                    key={paper.id}
                    href={`/learn?paper=${paper.id}`}
                    className={`p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 cursor-pointer ${
                      isCompleted ? "bg-emerald-50/50 dark:bg-emerald-900/10" :
                      isCurrent ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? "bg-emerald-500" :
                      isCurrent ? "bg-blue-500" :
                      isRecommended ? "bg-blue-100 dark:bg-blue-900/50" :
                      "bg-slate-200 dark:bg-slate-700"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className={`font-bold text-sm sm:text-base ${isRecommended ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}>{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm sm:text-base truncate ${
                        isCompleted ? "text-emerald-700 dark:text-emerald-400" :
                        isCurrent ? "text-blue-700 dark:text-blue-400" :
                        "text-slate-900 dark:text-white"
                      }`}>
                        {paper.title}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(paper.time)}
                        </span>
                        <span className="hidden sm:inline">{paper.category}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Review
                        </span>
                      ) : isCurrent ? (
                        <span className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1">
                          <BookOpen className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span className="hidden sm:inline">Continue</span>
                        </span>
                      ) : isRecommended ? (
                        <span className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1">
                          <Play className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span className="hidden sm:inline">Start</span>
                        </span>
                      ) : (
                        <span className="px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1">
                          <Play className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span className="hidden sm:inline">Study</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Shows first on mobile */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* LEARN Section - AI-Powered Tools */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-amber-300" />
              <h3 className="font-bold text-base sm:text-lg">LEARN</h3>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">AI-powered tools to accelerate your learning</p>
            <div className="space-y-2">
              <Link
                href="/quiz"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Quiz Mode</div>
                  <div className="text-[10px] sm:text-xs text-blue-200 truncate">Test yourself with AI-generated questions</div>
                </div>
              </Link>
              <Link
                href="/flashcards"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Flashcards</div>
                  <div className="text-[10px] sm:text-xs text-blue-200 truncate">Spaced repetition for long-term retention</div>
                </div>
              </Link>
              <Link
                href="/concepts"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Concept Map</div>
                  <div className="text-[10px] sm:text-xs text-blue-200 truncate">Explore key concepts from each paper</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Navigation - Hidden on very small screens */}
          <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Explore</h3>
            <div className="space-y-2">
              <Link
                href="/graph"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 transition-colors group"
              >
                <span className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <Network className="w-5 h-5 text-blue-500" />
                  Paper Connections
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              </Link>
              <Link
                href="/papers"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 active:bg-amber-100 transition-colors group"
              >
                <span className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  All Papers
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
              </Link>
              <Link
                href="/share"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:bg-emerald-100 transition-colors group"
              >
                <span className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Share Progress
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
              </Link>
            </div>
          </div>

          {/* Achievements - Simplified on mobile */}
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Award className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${completedPapers.size >= 1 ? "bg-amber-50 dark:bg-amber-900/20" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${completedPapers.size >= 1 ? "bg-amber-500" : "bg-slate-300"}`}>
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">First Steps</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">Complete first paper</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${completedPapers.size >= 5 ? "bg-blue-50 dark:bg-blue-900/20" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${completedPapers.size >= 5 ? "bg-blue-500" : "bg-slate-300"}`}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">Getting Started</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">Complete 5 papers</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${streak >= 7 ? "bg-orange-50 dark:bg-orange-900/20" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${streak >= 7 ? "bg-orange-500" : "bg-slate-300"}`}>
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">Week Warrior</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">7 day streak</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${Object.values(LEARNING_PATHS).some(p => p.papers.every(id => completedPapers.has(id))) ? "bg-purple-50 dark:bg-purple-900/20" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${Object.values(LEARNING_PATHS).some(p => p.papers.every(id => completedPapers.has(id))) ? "bg-purple-500" : "bg-slate-300"}`}>
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">Path Master</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">Complete a path</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote - Hidden on mobile */}
          <div className="hidden lg:block bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <Sparkles className="w-6 h-6 text-amber-400 mb-3" />
            <blockquote className="text-sm italic text-slate-300 mb-3">
              "If you really learn all of these, you'll know 90% of what matters today."
            </blockquote>
            <p className="text-xs text-slate-400">— Ilya Sutskever</p>
          </div>
        </div>
      </div>
    </div>
  );
}
