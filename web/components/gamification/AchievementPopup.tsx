"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { useLearning, ACHIEVEMENTS } from "@/context/LearningContext";
import AchievementBadge from "./AchievementBadge";
import Confetti from "@/components/Confetti";

export default function AchievementPopup() {
  const { recentAchievement } = useLearning();

  return (
    <>
      <Confetti active={!!recentAchievement} />
      <AnimatePresence>
        {recentAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full pointer-events-auto"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Achievement Unlocked!
                </motion.div>

                <div className="flex justify-center mb-4">
                  <AchievementBadge
                    achievementId={recentAchievement.id as keyof typeof ACHIEVEMENTS}
                    unlocked
                    size="lg"
                  />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {recentAchievement.name}
                </h3>
                <p className="text-slate-500 mb-4">{recentAchievement.description}</p>

                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{recentAchievement.xp} XP
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
