"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface MasteryMeterProps {
  level: number; // 0-4
  paperId: number;
}

const MASTERY_LEVELS = [
  { level: 0, name: "Unread", color: "bg-slate-300 dark:bg-slate-600" },
  { level: 1, name: "Familiar", color: "bg-blue-400" },
  { level: 2, name: "Comfortable", color: "bg-emerald-400" },
  { level: 3, name: "Proficient", color: "bg-purple-400" },
  { level: 4, name: "Mastered", color: "bg-amber-400" },
];

export default function MasteryMeter({ level, paperId }: MasteryMeterProps) {
  const currentMastery = MASTERY_LEVELS[Math.min(level, 4)];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {MASTERY_LEVELS.slice(1).map((m, index) => (
          <motion.div
            key={m.level}
            className={`h-2 flex-1 rounded-full ${
              level >= m.level ? m.color : "bg-slate-200 dark:bg-slate-700"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          {currentMastery.name}
        </span>
        {level === 4 && (
          <motion.div
            className="flex items-center gap-1 text-xs text-amber-500"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check className="w-3 h-3" />
            <span>Mastered</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
