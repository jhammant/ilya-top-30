"use client";

import { motion } from "framer-motion";
import {
  Star,
  Flame,
  Crown,
  BookOpen,
  Library,
  Trophy,
  Map,
  Compass,
  Zap,
  Brain,
  Moon,
  Sun,
  Footprints,
} from "lucide-react";
import { ACHIEVEMENTS } from "@/context/LearningContext";

type AchievementId = keyof typeof ACHIEVEMENTS;

const ICONS: Record<string, React.ElementType> = {
  Star,
  Flame,
  Crown,
  BookOpen,
  Books: Library,
  Library,
  Trophy,
  Map,
  Compass,
  Zap,
  Brain,
  Moon,
  Sun,
  Footprints,
};

interface AchievementBadgeProps {
  achievementId: AchievementId;
  unlocked?: boolean;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AchievementBadge({
  achievementId,
  unlocked = false,
  showDetails = false,
  size = "md",
}: AchievementBadgeProps) {
  const achievement = ACHIEVEMENTS[achievementId];
  const Icon = ICONS[achievement.icon] || Star;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  return (
    <motion.div
      className={`flex ${showDetails ? "items-start gap-3" : "items-center justify-center"}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center relative ${
          unlocked
            ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <Icon
          className={`${iconSizes[size]} ${
            unlocked ? "text-white" : "text-slate-400"
          }`}
        />
        {unlocked && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </div>

      {showDetails && (
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold ${
              unlocked ? "text-slate-900 dark:text-white" : "text-slate-400"
            }`}
          >
            {achievement.name}
          </div>
          <div className="text-sm text-slate-500 truncate">
            {achievement.description}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
            <Star className="w-3 h-3 fill-amber-500" />
            <span>+{achievement.xp} XP</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
