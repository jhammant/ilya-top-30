"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  Check,
  Trophy,
  Flame,
  BookOpen,
  Star,
  Zap,
  Brain,
  Target,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const TOTAL_PAPERS = 26;

const LEARNING_PATHS = {
  foundations: { name: "Foundations", papers: [3, 2, 4, 18, 21], color: "blue" },
  transformers: { name: "Transformers", papers: [14, 13, 6, 8, 9, 22], color: "purple" },
  vision: { name: "Vision", papers: [26, 7, 10, 15, 11, 12], color: "emerald" },
  theory: { name: "Theory", papers: [1, 19, 5, 23, 25, 16, 17, 20, 24], color: "amber" },
};

const CARD_THEMES = [
  {
    name: "Galaxy",
    gradient: "from-slate-900 via-purple-900 to-slate-900",
    accent: "text-purple-400",
    secondary: "text-purple-300",
  },
  {
    name: "Ocean",
    gradient: "from-blue-900 via-cyan-800 to-blue-900",
    accent: "text-cyan-400",
    secondary: "text-cyan-300",
  },
  {
    name: "Sunset",
    gradient: "from-orange-900 via-red-800 to-pink-900",
    accent: "text-orange-400",
    secondary: "text-orange-300",
  },
  {
    name: "Forest",
    gradient: "from-emerald-900 via-green-800 to-teal-900",
    accent: "text-emerald-400",
    secondary: "text-emerald-300",
  },
];

function getMasteryLevel(completed: number): { level: string; icon: typeof Star } {
  if (completed >= 23) return { level: "Expert", icon: Trophy };
  if (completed >= 15) return { level: "Advanced", icon: Star };
  if (completed >= 5) return { level: "Intermediate", icon: Zap };
  return { level: "Beginner", icon: BookOpen };
}

export default function SharePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [completedPapers, setCompletedPapers] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showName, setShowName] = useState(true);
  const [userName, setUserName] = useState("AI Learner");

  useEffect(() => {
    const saved = localStorage.getItem("completedPapers");
    if (saved) {
      setCompletedPapers(JSON.parse(saved));
    }
    const savedStreak = localStorage.getItem("studyStreak");
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  const progress = Math.round((completedPapers.length / TOTAL_PAPERS) * 100);
  const mastery = getMasteryLevel(completedPapers.length);
  const theme = CARD_THEMES[selectedTheme];

  const pathProgress = Object.entries(LEARNING_PATHS).map(([key, path]) => ({
    name: path.name,
    completed: path.papers.filter(id => completedPapers.includes(id)).length,
    total: path.papers.length,
    color: path.color,
  }));

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    // Dynamic import of html-to-image
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `ilya-top-30-progress-${progress}percent.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: show alert with instructions
      alert("To save your progress card, take a screenshot of the card above!");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Share Your Progress
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Generate a shareable card showing your AI learning journey
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview Card */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-4">
            Preview
          </h2>
          <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 text-white shadow-2xl`}
            style={{ aspectRatio: "1.91 / 1" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-5 h-5 ${theme.accent}`} />
                    <span className="text-sm font-medium opacity-80">Ilya's Top 30</span>
                  </div>
                  {showName && (
                    <h3 className="text-xl font-bold">{userName}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur ${theme.accent}`}>
                    <mastery.icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{mastery.level}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-end justify-between">
                <div className="space-y-3">
                  {/* Main Progress */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-bold">{progress}%</span>
                      <span className={`text-lg ${theme.secondary}`}>complete</span>
                    </div>
                    <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`text-sm mt-1 ${theme.secondary}`}>
                      {completedPapers.length} of {TOTAL_PAPERS} papers
                    </p>
                  </div>
                </div>

                {/* Path Progress Pills */}
                <div className="flex flex-wrap gap-2 max-w-[200px] justify-end">
                  {pathProgress.map(path => (
                    <div
                      key={path.name}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 backdrop-blur text-xs"
                    >
                      <span className="opacity-80">{path.name}</span>
                      <span className="font-bold">{path.completed}/{path.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-4">
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">{streak} day streak</span>
                    </div>
                  )}
                </div>
                <span className="text-xs opacity-60">ilya-top-30.vercel.app</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={downloadCard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>
            <button
              onClick={copyShareLink}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Customization Options */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-4">
            Customize
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            {/* Theme Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-4 gap-3">
                {CARD_THEMES.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTheme(i)}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${t.gradient} border-2 transition-all ${
                      selectedTheme === i
                        ? "border-blue-500 scale-105 shadow-lg"
                        : "border-transparent hover:scale-105"
                    }`}
                    title={t.name}
                  />
                ))}
              </div>
            </div>

            {/* Name Toggle */}
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Show Name
                </span>
                <button
                  onClick={() => setShowName(!showName)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showName ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showName ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Name Input */}
            {showName && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            )}

            {/* Stats Summary */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Your Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Papers Read</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {completedPapers.length}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs">Progress</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {progress}%
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs">Streak</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {streak} days
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Level</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {mastery.level}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Share Your Journey
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Download your progress card and share it on Twitter, LinkedIn, or with friends to inspire others to learn AI fundamentals!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
