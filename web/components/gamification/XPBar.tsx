"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp } from "lucide-react";
import { useLearning } from "@/context/LearningContext";

interface XPBarProps {
  compact?: boolean;
}

export default function XPBar({ compact = false }: XPBarProps) {
  const { totalXP, currentLevel, xpToNextLevel } = useLearning();

  const progress = currentLevel.xp === 0 ? 0 : ((totalXP - currentLevel.xp) / (xpToNextLevel + totalXP - currentLevel.xp)) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
          <Star className="w-4 h-4 fill-amber-500" />
          <span>{totalXP.toLocaleString()}</span>
        </div>
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold">
            {currentLevel.level}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {currentLevel.title}
            </div>
            <div className="text-xs text-slate-500">Level {currentLevel.level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="font-bold">{totalXP.toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-500">
            {xpToNextLevel.toLocaleString()} to next level
          </div>
        </div>
      </div>

      <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div
          className="absolute h-full bg-white/30"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)",
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>{currentLevel.title}</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
