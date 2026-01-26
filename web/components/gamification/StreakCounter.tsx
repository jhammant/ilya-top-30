"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, Trophy, TrendingUp } from "lucide-react";
import { useLearning } from "@/context/LearningContext";

interface StreakCounterProps {
  compact?: boolean;
  showDetails?: boolean;
}

export default function StreakCounter({ compact = false, showDetails = false }: StreakCounterProps) {
  const { streak, recordStudySession } = useLearning();

  const isActive = (() => {
    if (!streak.lastDate) return false;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    return streak.lastDate === today || streak.lastDate === yesterdayStr;
  })();

  const studiedToday = streak.lastDate === new Date().toISOString().split("T")[0];

  if (compact) {
    return (
      <motion.div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          isActive
            ? "bg-orange-100 dark:bg-orange-900/30"
            : "bg-slate-100 dark:bg-slate-800"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
        >
          <Flame
            className={`w-4 h-4 ${
              isActive ? "text-orange-500 fill-orange-500" : "text-slate-400"
            }`}
          />
        </motion.div>
        <span
          className={`font-bold text-sm ${
            isActive ? "text-orange-600 dark:text-orange-400" : "text-slate-500"
          }`}
        >
          {streak.current}
        </span>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-4">
        <motion.div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isActive
              ? "bg-gradient-to-br from-orange-400 to-red-500"
              : "bg-slate-200 dark:bg-slate-700"
          }`}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame
            className={`w-8 h-8 ${isActive ? "text-white fill-white" : "text-slate-400"}`}
          />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={streak.current}
                className="text-3xl font-bold text-slate-900 dark:text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                {streak.current}
              </motion.span>
            </AnimatePresence>
            <span className="text-slate-500">day streak</span>
          </div>

          {!studiedToday && isActive && (
            <motion.button
              onClick={() => recordStudySession()}
              className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
              whileHover={{ x: 3 }}
            >
              Study today to keep your streak!
            </motion.button>
          )}

          {studiedToday && (
            <div className="text-sm text-emerald-500 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Studied today
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {streak.totalDays}
            </div>
            <div className="text-xs text-slate-500">Total Days</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {streak.longest}
            </div>
            <div className="text-xs text-slate-500">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {streak.current > 0 ? Math.round((streak.current / streak.longest) * 100) : 0}%
            </div>
            <div className="text-xs text-slate-500">Of Best</div>
          </div>
        </div>
      )}
    </div>
  );
}
