"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLearning, ACHIEVEMENTS } from "@/context/LearningContext";
import { AchievementBadge, XPBar, StreakCounter } from "@/components/gamification";

export default function AchievementsPage() {
  const { unlockedAchievements, totalXP } = useLearning();

  const allAchievements = Object.values(ACHIEVEMENTS);
  const unlockedCount = unlockedAchievements.size;
  const totalPossibleXP = allAchievements.reduce((sum, a) => sum + a.xp, 0);
  const earnedXP = allAchievements
    .filter((a) => unlockedAchievements.has(a.id))
    .reduce((sum, a) => sum + a.xp, 0);

  // Group achievements by type
  const streakAchievements = ["firstDay", "weekStreak", "monthStreak"];
  const paperAchievements = ["firstPaper", "fivePapers", "tenPapers", "allPapers"];
  const pathAchievements = ["pathComplete", "allPaths"];
  const quizAchievements = ["perfectQuiz", "speedDemon", "quizMaster"];
  const engagementAchievements = ["nightOwl", "earlyBird"];

  const sections = [
    { title: "Study Streaks", ids: streakAchievements, icon: "flame" },
    { title: "Paper Mastery", ids: paperAchievements, icon: "book" },
    { title: "Learning Paths", ids: pathAchievements, icon: "map" },
    { title: "Quiz Performance", ids: quizAchievements, icon: "brain" },
    { title: "Engagement", ids: engagementAchievements, icon: "clock" },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Achievements
            </h1>
            <p className="text-slate-500">
              {unlockedCount} of {allAchievements.length} unlocked
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <XPBar compact />
          <StreakCounter compact />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {unlockedCount}
          </div>
          <div className="text-sm text-slate-500">Unlocked</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {earnedXP.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500">XP Earned</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {allAchievements.length - unlockedCount}
          </div>
          <div className="text-sm text-slate-500">Remaining</div>
        </div>
      </div>

      {/* Achievement Sections */}
      <div className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.ids.map((id, index) => {
                const achievement = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
                const unlocked = unlockedAchievements.has(id);

                return (
                  <motion.div
                    key={id}
                    className={`p-4 rounded-2xl border transition-all ${
                      unlocked
                        ? "bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800"
                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <AchievementBadge
                      achievementId={id as keyof typeof ACHIEVEMENTS}
                      unlocked={unlocked}
                      showDetails
                      size="md"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress to next achievement */}
      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              Keep going!
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-300">
              {totalPossibleXP - earnedXP} XP remaining from achievements
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
