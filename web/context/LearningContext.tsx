"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  progressDB,
  streakDB,
  achievementsDB,
  reviewsDB,
  type PaperProgress,
  type StreakData,
  type Achievement,
  type ReviewCard,
} from "@/lib/storage";
import { PAPERS, LEARNING_PATHS } from "@/lib/static-data/papers";

// Achievement definitions
export const ACHIEVEMENTS = {
  // Streak achievements
  firstDay: { id: "firstDay", name: "First Steps", description: "Complete your first study session", icon: "Footprints", xp: 50 },
  weekStreak: { id: "weekStreak", name: "Week Warrior", description: "Maintain a 7-day study streak", icon: "Flame", xp: 200 },
  monthStreak: { id: "monthStreak", name: "Dedicated Scholar", description: "Maintain a 30-day study streak", icon: "Crown", xp: 1000 },

  // Paper mastery
  firstPaper: { id: "firstPaper", name: "Paper Pioneer", description: "Complete your first paper", icon: "BookOpen", xp: 100 },
  fivePapers: { id: "fivePapers", name: "Growing Scholar", description: "Complete 5 papers", icon: "Books", xp: 300 },
  tenPapers: { id: "tenPapers", name: "Prolific Reader", description: "Complete 10 papers", icon: "Library", xp: 500 },
  allPapers: { id: "allPapers", name: "Ilya's Apprentice", description: "Master all 26 papers", icon: "Trophy", xp: 5000 },

  // Path completion
  pathComplete: { id: "pathComplete", name: "Path Pioneer", description: "Complete a learning path", icon: "Map", xp: 500 },
  allPaths: { id: "allPaths", name: "Master of All", description: "Complete all learning paths", icon: "Compass", xp: 2000 },

  // Quiz achievements
  perfectQuiz: { id: "perfectQuiz", name: "Perfect Score", description: "Get 100% on a paper quiz", icon: "Star", xp: 150 },
  speedDemon: { id: "speedDemon", name: "Speed Demon", description: "Complete a quiz in under 2 minutes", icon: "Zap", xp: 100 },
  quizMaster: { id: "quizMaster", name: "Quiz Master", description: "Answer 100 questions correctly", icon: "Brain", xp: 300 },

  // Engagement
  nightOwl: { id: "nightOwl", name: "Night Owl", description: "Study after midnight", icon: "Moon", xp: 50 },
  earlyBird: { id: "earlyBird", name: "Early Bird", description: "Study before 6am", icon: "Sun", xp: 50 },
} as const;

// XP rewards
const XP_REWARDS = {
  paperStep: 10,
  paperComplete: 100,
  quizCorrect: 10,
  quizComplete: 50,
  perfectQuiz: 200,
  streakDay: 25,
  pathComplete: 500,
  reviewComplete: 5,
} as const;

// Level thresholds
const LEVELS = [
  { level: 1, xp: 0, title: "Novice" },
  { level: 2, xp: 100, title: "Beginner" },
  { level: 3, xp: 300, title: "Student" },
  { level: 4, xp: 600, title: "Scholar" },
  { level: 5, xp: 1000, title: "Researcher" },
  { level: 6, xp: 1500, title: "Scientist" },
  { level: 7, xp: 2500, title: "Expert" },
  { level: 8, xp: 4000, title: "Master" },
  { level: 9, xp: 6000, title: "Guru" },
  { level: 10, xp: 10000, title: "Sage" },
];

// Context types
interface LearningContextType {
  // Progress
  paperProgress: Map<number, PaperProgress>;
  completedPapers: Set<number>;
  totalXP: number;
  currentLevel: typeof LEVELS[number];
  xpToNextLevel: number;

  // Streak
  streak: StreakData;

  // Achievements
  unlockedAchievements: Set<string>;
  recentAchievement: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS] | null;

  // Reviews (spaced repetition)
  dueReviews: ReviewCard[];
  reviewsDueToday: number;

  // Path progress
  pathProgress: Record<string, { completed: number; total: number; percentage: number }>;

  // Actions
  markStepComplete: (paperId: number, stepIndex: number) => Promise<void>;
  markPaperComplete: (paperId: number) => Promise<void>;
  recordQuizScore: (paperId: number, score: number, timeMs: number) => Promise<void>;
  addXP: (amount: number, reason: string) => Promise<void>;
  recordStudySession: () => Promise<void>;
  scheduleReview: (paperId: number, questionId: string, quality: number) => Promise<void>;

  // Loading state
  isLoading: boolean;
}

const LearningContext = createContext<LearningContextType | null>(null);

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}

interface LearningProviderProps {
  children: ReactNode;
}

export function LearningProvider({ children }: LearningProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paperProgress, setPaperProgress] = useState<Map<number, PaperProgress>>(new Map());
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastDate: "", totalDays: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [recentAchievement, setRecentAchievement] = useState<typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS] | null>(null);
  const [dueReviews, setDueReviews] = useState<ReviewCard[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        // Load progress
        const progress = await progressDB.getAll();
        const progressMap = new Map<number, PaperProgress>();
        let xp = 0;
        progress.forEach((p) => {
          progressMap.set(p.paperId, p);
          xp += p.xp || 0;
        });
        setPaperProgress(progressMap);
        setTotalXP(xp);

        // Load streak
        const streakData = await streakDB.get();
        setStreak(streakData);

        // Load achievements
        const achievements = await achievementsDB.getAll();
        setUnlockedAchievements(new Set(achievements.map((a) => a.id)));

        // Load due reviews
        const reviews = await reviewsDB.getDue();
        setDueReviews(reviews);
      } catch (error) {
        console.error("Failed to load learning data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Computed values
  const completedPapers = new Set(
    Array.from(paperProgress.values())
      .filter((p) => p.completed)
      .map((p) => p.paperId)
  );

  const currentLevel = LEVELS.reduce((prev, curr) => (totalXP >= curr.xp ? curr : prev), LEVELS[0]);
  const nextLevel = LEVELS.find((l) => l.xp > totalXP) || LEVELS[LEVELS.length - 1];
  const xpToNextLevel = nextLevel.xp - totalXP;

  const pathProgress = Object.entries(LEARNING_PATHS).reduce(
    (acc, [key, path]) => {
      const completed = path.papers.filter((id) => completedPapers.has(id)).length;
      const total = path.papers.length;
      acc[key] = { completed, total, percentage: Math.round((completed / total) * 100) };
      return acc;
    },
    {} as Record<string, { completed: number; total: number; percentage: number }>
  );

  // Achievement checking
  const checkAchievements = useCallback(async () => {
    const newAchievements: (typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS])[] = [];

    // Streak achievements
    if (streak.current >= 1 && !unlockedAchievements.has("firstDay")) {
      await achievementsDB.unlock("firstDay");
      newAchievements.push(ACHIEVEMENTS.firstDay);
    }
    if (streak.current >= 7 && !unlockedAchievements.has("weekStreak")) {
      await achievementsDB.unlock("weekStreak");
      newAchievements.push(ACHIEVEMENTS.weekStreak);
    }
    if (streak.current >= 30 && !unlockedAchievements.has("monthStreak")) {
      await achievementsDB.unlock("monthStreak");
      newAchievements.push(ACHIEVEMENTS.monthStreak);
    }

    // Paper achievements
    const completedCount = completedPapers.size;
    if (completedCount >= 1 && !unlockedAchievements.has("firstPaper")) {
      await achievementsDB.unlock("firstPaper");
      newAchievements.push(ACHIEVEMENTS.firstPaper);
    }
    if (completedCount >= 5 && !unlockedAchievements.has("fivePapers")) {
      await achievementsDB.unlock("fivePapers");
      newAchievements.push(ACHIEVEMENTS.fivePapers);
    }
    if (completedCount >= 10 && !unlockedAchievements.has("tenPapers")) {
      await achievementsDB.unlock("tenPapers");
      newAchievements.push(ACHIEVEMENTS.tenPapers);
    }
    if (completedCount >= 26 && !unlockedAchievements.has("allPapers")) {
      await achievementsDB.unlock("allPapers");
      newAchievements.push(ACHIEVEMENTS.allPapers);
    }

    // Path achievements
    const completedPaths = Object.values(pathProgress).filter((p) => p.percentage === 100).length;
    if (completedPaths >= 1 && !unlockedAchievements.has("pathComplete")) {
      await achievementsDB.unlock("pathComplete");
      newAchievements.push(ACHIEVEMENTS.pathComplete);
    }
    if (completedPaths >= 4 && !unlockedAchievements.has("allPaths")) {
      await achievementsDB.unlock("allPaths");
      newAchievements.push(ACHIEVEMENTS.allPaths);
    }

    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6 && !unlockedAchievements.has("nightOwl")) {
      await achievementsDB.unlock("nightOwl");
      newAchievements.push(ACHIEVEMENTS.nightOwl);
    }
    if (hour >= 4 && hour < 6 && !unlockedAchievements.has("earlyBird")) {
      await achievementsDB.unlock("earlyBird");
      newAchievements.push(ACHIEVEMENTS.earlyBird);
    }

    // Update state
    if (newAchievements.length > 0) {
      setUnlockedAchievements((prev) => {
        const next = new Set(prev);
        newAchievements.forEach((a) => next.add(a.id));
        return next;
      });

      // Show most recent achievement
      setRecentAchievement(newAchievements[newAchievements.length - 1]);

      // Add XP for achievements
      const achievementXP = newAchievements.reduce((sum, a) => sum + a.xp, 0);
      if (achievementXP > 0) {
        setTotalXP((prev) => prev + achievementXP);
      }

      // Clear recent achievement after 5 seconds
      setTimeout(() => setRecentAchievement(null), 5000);
    }
  }, [streak, completedPapers, pathProgress, unlockedAchievements]);

  // Actions
  const addXP = useCallback(async (amount: number, reason: string) => {
    setTotalXP((prev) => prev + amount);
    console.log(`+${amount} XP: ${reason}`);
  }, []);

  const markStepComplete = useCallback(
    async (paperId: number, stepIndex: number) => {
      const existing = paperProgress.get(paperId) || {
        paperId,
        masteryLevel: 0,
        xp: 0,
        completedSteps: [],
        quizScores: [],
        lastStudied: new Date().toISOString(),
        completed: false,
      };

      if (!existing.completedSteps.includes(stepIndex)) {
        existing.completedSteps.push(stepIndex);
        existing.xp += XP_REWARDS.paperStep;
        existing.lastStudied = new Date().toISOString();

        await progressDB.save(existing);
        setPaperProgress((prev) => new Map(prev).set(paperId, existing));
        await addXP(XP_REWARDS.paperStep, `Completed step ${stepIndex + 1}`);
      }
    },
    [paperProgress, addXP]
  );

  const markPaperComplete = useCallback(
    async (paperId: number) => {
      const existing = paperProgress.get(paperId) || {
        paperId,
        masteryLevel: 0,
        xp: 0,
        completedSteps: [],
        quizScores: [],
        lastStudied: new Date().toISOString(),
        completed: false,
      };

      if (!existing.completed) {
        existing.completed = true;
        existing.masteryLevel = Math.max(existing.masteryLevel, 1);
        existing.xp += XP_REWARDS.paperComplete;
        existing.lastStudied = new Date().toISOString();

        await progressDB.save(existing);
        setPaperProgress((prev) => new Map(prev).set(paperId, existing));
        await addXP(XP_REWARDS.paperComplete, `Completed paper`);
        await checkAchievements();
      }
    },
    [paperProgress, addXP, checkAchievements]
  );

  const recordQuizScore = useCallback(
    async (paperId: number, score: number, timeMs: number) => {
      const existing = paperProgress.get(paperId) || {
        paperId,
        masteryLevel: 0,
        xp: 0,
        completedSteps: [],
        quizScores: [],
        lastStudied: new Date().toISOString(),
        completed: false,
      };

      existing.quizScores.push(score);
      existing.lastStudied = new Date().toISOString();

      // Update mastery based on quiz performance
      const avgScore = existing.quizScores.reduce((a, b) => a + b, 0) / existing.quizScores.length;
      if (avgScore >= 90) existing.masteryLevel = 4;
      else if (avgScore >= 75) existing.masteryLevel = 3;
      else if (avgScore >= 50) existing.masteryLevel = 2;
      else existing.masteryLevel = 1;

      existing.xp += XP_REWARDS.quizComplete;
      if (score === 100) existing.xp += XP_REWARDS.perfectQuiz;

      await progressDB.save(existing);
      setPaperProgress((prev) => new Map(prev).set(paperId, existing));
      await addXP(XP_REWARDS.quizComplete, `Completed quiz`);

      // Check for quiz achievements
      if (score === 100 && !unlockedAchievements.has("perfectQuiz")) {
        await achievementsDB.unlock("perfectQuiz");
        setUnlockedAchievements((prev) => new Set(prev).add("perfectQuiz"));
        setRecentAchievement(ACHIEVEMENTS.perfectQuiz);
        setTimeout(() => setRecentAchievement(null), 5000);
      }

      if (timeMs < 120000 && !unlockedAchievements.has("speedDemon")) {
        await achievementsDB.unlock("speedDemon");
        setUnlockedAchievements((prev) => new Set(prev).add("speedDemon"));
        setRecentAchievement(ACHIEVEMENTS.speedDemon);
        setTimeout(() => setRecentAchievement(null), 5000);
      }
    },
    [paperProgress, addXP, unlockedAchievements]
  );

  const recordStudySession = useCallback(async () => {
    const newStreak = await streakDB.update();
    setStreak(newStreak);
    await addXP(XP_REWARDS.streakDay, `Daily study bonus`);
    await checkAchievements();
  }, [addXP, checkAchievements]);

  // SM-2 Spaced Repetition Algorithm
  const scheduleReview = useCallback(
    async (paperId: number, questionId: string, quality: number) => {
      const id = `${paperId}-${questionId}`;
      let card = await reviewsDB.get(id);

      if (!card) {
        card = {
          id,
          paperId,
          questionId,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReview: new Date().toISOString(),
          lastReview: new Date().toISOString(),
        };
      }

      // SM-2 algorithm
      if (quality >= 3) {
        if (card.repetitions === 0) {
          card.interval = 1;
        } else if (card.repetitions === 1) {
          card.interval = 6;
        } else {
          card.interval = Math.round(card.interval * card.easeFactor);
        }
        card.repetitions += 1;
      } else {
        card.repetitions = 0;
        card.interval = 1;
      }

      // Update ease factor
      card.easeFactor = Math.max(
        1.3,
        card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
      );

      // Calculate next review date
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + card.interval);
      card.nextReview = nextDate.toISOString();
      card.lastReview = new Date().toISOString();

      await reviewsDB.save(card);

      // Refresh due reviews
      const reviews = await reviewsDB.getDue();
      setDueReviews(reviews);

      await addXP(XP_REWARDS.reviewComplete, `Completed review`);
    },
    [addXP]
  );

  const value: LearningContextType = {
    paperProgress,
    completedPapers,
    totalXP,
    currentLevel,
    xpToNextLevel,
    streak,
    unlockedAchievements,
    recentAchievement,
    dueReviews,
    reviewsDueToday: dueReviews.length,
    pathProgress,
    markStepComplete,
    markPaperComplete,
    recordQuizScore,
    addXP,
    recordStudySession,
    scheduleReview,
    isLoading,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}
