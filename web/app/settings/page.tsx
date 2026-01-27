"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HardDrive,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Smartphone,
  CloudOff,
  Trophy,
  Flame,
  BookOpen,
  Brain,
  RefreshCw,
} from "lucide-react";
import {
  progressDB,
  streakDB,
  achievementsDB,
  reviewsDB,
  bookmarksDB,
  resetAllData,
  type StreakData,
} from "@/lib/storage";

interface Stats {
  papersCompleted: number;
  totalXP: number;
  streak: StreakData;
  achievementsUnlocked: number;
  reviewCards: number;
  bookmarks: number;
}

export default function SettingsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [progress, streak, achievements, reviews, bookmarks] = await Promise.all([
        progressDB.getAll(),
        streakDB.get(),
        achievementsDB.getAll(),
        reviewsDB.getAll(),
        bookmarksDB.getAll(),
      ]);

      setStats({
        papersCompleted: progress.filter((p) => p.completed).length,
        totalXP: progress.reduce((sum, p) => sum + (p.xp || 0), 0),
        streak,
        achievementsUnlocked: achievements.length,
        reviewCards: reviews.length,
        bookmarks: bookmarks.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      setResetComplete(true);
      setShowResetConfirm(false);
      // Reload stats to show zeroed values
      await loadStats();
      // Reset the learning context by reloading the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Failed to reset data:", error);
      alert("Failed to reset data. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3 sm:mb-4 -ml-1 p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Manage your learning data and understand how it's stored
        </p>
      </div>

      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {/* How Data is Stored */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                How Your Data is Stored
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                This app stores all your learning progress <strong>locally in your browser</strong> using
                IndexedDB. This means:
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Smartphone className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Device-specific</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your progress is stored only on this device and browser. Using a different device or
                  browser means starting fresh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <CloudOff className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">No cloud sync</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your data never leaves your device. There's no account or login required, but this also
                  means no sync between devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Clearing browser data</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  If you clear your browser data/cache, your learning progress will be lost. The app
                  works offline once loaded.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Multiple users:</strong> Each person using this browser will share the same
                progress. For separate progress, use different browsers or browser profiles.
              </span>
            </p>
          </div>
        </div>

        {/* Current Stats */}
        {stats && (
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Current Data</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.papersCompleted}
                </div>
                <div className="text-xs text-slate-500">Papers Completed</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <Brain className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalXP}</div>
                <div className="text-xs text-slate-500">Total XP</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.streak.current}
                </div>
                <div className="text-xs text-slate-500">Day Streak</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.achievementsUnlocked}
                </div>
                <div className="text-xs text-slate-500">Achievements</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.reviewCards}
                </div>
                <div className="text-xs text-slate-500">Flashcards Saved</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.bookmarks}</div>
                <div className="text-xs text-slate-500">Bookmarks</div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-200 dark:border-red-900/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reset All Progress</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                This will permanently delete all your learning data including completed papers, XP,
                streaks, achievements, flashcards, and bookmarks. This action cannot be undone.
              </p>

              {resetComplete ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Progress reset successfully. Reloading...</span>
                </div>
              ) : showResetConfirm ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Are you absolutely sure?</p>
                        <p className="text-sm mt-1">
                          All your progress will be permanently deleted. You will lose:
                        </p>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>
                            - {stats?.papersCompleted || 0} completed papers
                          </li>
                          <li>- {stats?.totalXP || 0} XP</li>
                          <li>- {stats?.streak.current || 0} day streak</li>
                          <li>
                            - {stats?.achievementsUnlocked || 0} achievements
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={isResetting}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isResetting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Yes, Reset Everything
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All Progress
                </button>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About This App</h2>
          <div className="space-y-3 text-slate-600 dark:text-slate-300">
            <p>
              <strong>Ilya's Top 30</strong> is an AI-powered learning platform built to help you master
              the foundational papers in AI and deep learning, as curated by Ilya Sutskever.
            </p>
            <p>
              The app works entirely offline after the first load. All paper content, quizzes, and
              learning materials are pre-generated and bundled with the app.
            </p>
            <p className="text-sm text-slate-500">
              <a
                href="https://github.com/jhammant/ilya-top-30"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
