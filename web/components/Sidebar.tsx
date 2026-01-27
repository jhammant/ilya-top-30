"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Library,
  Network,
  Share2,
  Github,
  Trophy,
  Brain,
  Map,
  HelpCircle,
} from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";
import { getTranslation } from "@/lib/i18n";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { uiSettings } = useGlobal();
  const lang = uiSettings.language;

  const t = (key: string) => getTranslation(lang, key);

  const navGroups = [
    {
      name: t("Start"),
      items: [
        { name: "Learn", href: "/", icon: LayoutDashboard },
        { name: "The Papers", href: "/papers", icon: Library },
        { name: "Paper Graph", href: "/graph", icon: Network },
        { name: "Share Progress", href: "/share", icon: Share2 },
      ],
    },
    {
      name: t("Study"),
      items: [
        { name: "Quiz", href: "/quiz", icon: Brain },
        { name: "Flashcards", href: "/flashcards", icon: BookOpen },
        { name: "Concept Map", href: "/concepts", icon: Map },
        { name: "Achievements", href: "/achievements", icon: Trophy },
      ],
    },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-800 h-full border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Ilya's Top 30 Logo"
                  width={38}
                  height={38}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-lg">
                Ilya's Top 30
              </h1>
            </div>
            <a
              href="https://github.com/jhammant/ilya-top-30"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
            Learn 90% of what matters in AI
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {group.name && (
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                {group.name}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-700 space-y-1 bg-slate-50 dark:bg-slate-800/50">
        {/* Settings */}
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm ${
            pathname === "/settings"
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600"
          }`}
        >
          <Settings
            className={`w-5 h-5 ${pathname === "/settings" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
          />
          <span>{t("Settings")}</span>
        </Link>

        {/* Tutorial */}
        <Link
          href="/welcome"
          onClick={onNavigate}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm ${
            pathname === "/welcome"
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600"
          }`}
        >
          <HelpCircle
            className={`w-5 h-5 ${pathname === "/welcome" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
          />
          <span>Tutorial</span>
        </Link>

        {/* Offline-first badge */}
        <div className="px-3 py-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Works offline - all data stored locally
        </div>
      </div>
    </div>
  );
}
