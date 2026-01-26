"use client";

import { WifiOff, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          You&apos;re Offline
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Don&apos;t worry! Your learning content is available offline.
          Check your connection and try again, or continue with cached content.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            View Cached Content
          </Link>
        </div>

        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Offline Features Available:
          </h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>View all paper summaries</li>
            <li>Continue learning steps</li>
            <li>Take quizzes</li>
            <li>Track your progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
