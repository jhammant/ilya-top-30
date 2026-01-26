/**
 * IndexedDB storage for PWA user data.
 *
 * Stores user progress, bookmarks, achievements, and settings locally.
 * All data persists offline and syncs when online (future enhancement).
 */

const DB_NAME = "ilya-top-30-db";
const DB_VERSION = 1;

// Store names
const STORES = {
  PROGRESS: "progress",
  REVIEWS: "reviews",
  ACHIEVEMENTS: "achievements",
  STREAK: "streak",
  SETTINGS: "settings",
  BOOKMARKS: "bookmarks",
} as const;

// Types
export interface PaperProgress {
  paperId: number;
  masteryLevel: number; // 0-4
  xp: number;
  completedSteps: number[];
  quizScores: number[];
  lastStudied: string; // ISO date
  completed: boolean;
}

export interface ReviewCard {
  id: string;
  paperId: number;
  questionId: string;
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReview: string; // ISO date
  lastReview: string; // ISO date
}

export interface Achievement {
  id: string;
  unlockedAt: string; // ISO date
  progress?: number; // For progress-based achievements
}

export interface StreakData {
  current: number;
  longest: number;
  lastDate: string; // ISO date
  totalDays: number;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  dailyReminder: string | null; // Time string like "09:00"
  soundEffects: boolean;
}

export interface Bookmark {
  id: string;
  paperId: number;
  type: "paper" | "concept" | "question";
  itemId?: string;
  note?: string;
  createdAt: string;
}

// Database initialization
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Progress store
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: "paperId" });
        progressStore.createIndex("completed", "completed");
        progressStore.createIndex("lastStudied", "lastStudied");
      }

      // Reviews store (spaced repetition)
      if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
        const reviewsStore = db.createObjectStore(STORES.REVIEWS, { keyPath: "id" });
        reviewsStore.createIndex("paperId", "paperId");
        reviewsStore.createIndex("nextReview", "nextReview");
      }

      // Achievements store
      if (!db.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
        db.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: "id" });
      }

      // Streak store (single record)
      if (!db.objectStoreNames.contains(STORES.STREAK)) {
        db.createObjectStore(STORES.STREAK, { keyPath: "id" });
      }

      // Settings store (single record)
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
        const bookmarksStore = db.createObjectStore(STORES.BOOKMARKS, { keyPath: "id" });
        bookmarksStore.createIndex("paperId", "paperId");
        bookmarksStore.createIndex("type", "type");
      }
    };
  });

  return dbPromise;
}

// Generic database operations
async function getFromStore<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function putToStore<T>(storeName: string, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function deleteFromStore(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Progress API
export const progressDB = {
  async get(paperId: number): Promise<PaperProgress | null> {
    return getFromStore<PaperProgress>(STORES.PROGRESS, paperId);
  },

  async getAll(): Promise<PaperProgress[]> {
    return getAllFromStore<PaperProgress>(STORES.PROGRESS);
  },

  async save(progress: PaperProgress): Promise<void> {
    return putToStore(STORES.PROGRESS, progress);
  },

  async getCompleted(): Promise<PaperProgress[]> {
    const all = await this.getAll();
    return all.filter((p) => p.completed);
  },

  async getTotalXP(): Promise<number> {
    const all = await this.getAll();
    return all.reduce((sum, p) => sum + (p.xp || 0), 0);
  },
};

// Reviews API (Spaced Repetition)
export const reviewsDB = {
  async get(id: string): Promise<ReviewCard | null> {
    return getFromStore<ReviewCard>(STORES.REVIEWS, id);
  },

  async getAll(): Promise<ReviewCard[]> {
    return getAllFromStore<ReviewCard>(STORES.REVIEWS);
  },

  async save(review: ReviewCard): Promise<void> {
    return putToStore(STORES.REVIEWS, review);
  },

  async getDue(): Promise<ReviewCard[]> {
    const all = await this.getAll();
    const now = new Date().toISOString();
    return all.filter((r) => r.nextReview <= now);
  },

  async getByPaper(paperId: number): Promise<ReviewCard[]> {
    const all = await this.getAll();
    return all.filter((r) => r.paperId === paperId);
  },
};

// Achievements API
export const achievementsDB = {
  async get(id: string): Promise<Achievement | null> {
    return getFromStore<Achievement>(STORES.ACHIEVEMENTS, id);
  },

  async getAll(): Promise<Achievement[]> {
    return getAllFromStore<Achievement>(STORES.ACHIEVEMENTS);
  },

  async unlock(id: string): Promise<void> {
    const existing = await this.get(id);
    if (!existing) {
      await putToStore(STORES.ACHIEVEMENTS, {
        id,
        unlockedAt: new Date().toISOString(),
      });
    }
  },

  async isUnlocked(id: string): Promise<boolean> {
    const achievement = await this.get(id);
    return achievement !== null;
  },
};

// Streak API
export const streakDB = {
  async get(): Promise<StreakData> {
    const data = await getFromStore<StreakData & { id: string }>(STORES.STREAK, "current");
    if (!data) {
      return {
        current: 0,
        longest: 0,
        lastDate: "",
        totalDays: 0,
      };
    }
    return {
      current: data.current,
      longest: data.longest,
      lastDate: data.lastDate,
      totalDays: data.totalDays,
    };
  },

  async update(): Promise<StreakData> {
    const current = await this.get();
    const today = new Date().toISOString().split("T")[0];

    if (current.lastDate === today) {
      // Already studied today
      return current;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak: number;
    if (current.lastDate === yesterdayStr) {
      // Continuing streak
      newStreak = current.current + 1;
    } else {
      // Streak broken, start new
      newStreak = 1;
    }

    const newData: StreakData & { id: string } = {
      id: "current",
      current: newStreak,
      longest: Math.max(newStreak, current.longest),
      lastDate: today,
      totalDays: current.totalDays + 1,
    };

    await putToStore(STORES.STREAK, newData);
    return newData;
  },
};

// Settings API
export const settingsDB = {
  async get(): Promise<UserSettings> {
    const data = await getFromStore<UserSettings & { id: string }>(STORES.SETTINGS, "user");
    if (!data) {
      return {
        theme: "system",
        notifications: false,
        dailyReminder: null,
        soundEffects: true,
      };
    }
    return {
      theme: data.theme,
      notifications: data.notifications,
      dailyReminder: data.dailyReminder,
      soundEffects: data.soundEffects,
    };
  },

  async save(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.get();
    const merged = { ...current, ...settings, id: "user" };
    return putToStore(STORES.SETTINGS, merged);
  },
};

// Bookmarks API
export const bookmarksDB = {
  async get(id: string): Promise<Bookmark | null> {
    return getFromStore<Bookmark>(STORES.BOOKMARKS, id);
  },

  async getAll(): Promise<Bookmark[]> {
    return getAllFromStore<Bookmark>(STORES.BOOKMARKS);
  },

  async add(bookmark: Omit<Bookmark, "id" | "createdAt">): Promise<string> {
    const id = `${bookmark.paperId}-${bookmark.type}-${Date.now()}`;
    const data: Bookmark = {
      ...bookmark,
      id,
      createdAt: new Date().toISOString(),
    };
    await putToStore(STORES.BOOKMARKS, data);
    return id;
  },

  async remove(id: string): Promise<void> {
    return deleteFromStore(STORES.BOOKMARKS, id);
  },

  async getByPaper(paperId: number): Promise<Bookmark[]> {
    const all = await this.getAll();
    return all.filter((b) => b.paperId === paperId);
  },
};
