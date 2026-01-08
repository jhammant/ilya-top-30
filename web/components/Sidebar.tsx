"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Calculator,
  Microscope,
  Edit3,
  Settings,
  Book,
  GraduationCap,
  Lightbulb,
  Github,
  Library,
  Network,
  Share2,
} from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";
import { getTranslation } from "@/lib/i18n";

export default function Sidebar() {
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
        { name: t("Knowledge Bases"), href: "/knowledge", icon: BookOpen },
        { name: t("Notebooks"), href: "/notebook", icon: Book },
      ],
    },
    {
      name: t("Learn"),
      items: [
        { name: t("Question Generator"), href: "/question", icon: PenTool },
        { name: t("Smart Solver"), href: "/solver", icon: Calculator },
        { name: t("Guided Learning"), href: "/guide", icon: GraduationCap },
      ],
    },
    {
      name: t("Research"),
      items: [
        { name: t("IdeaGen"), href: "/ideagen", icon: Lightbulb },
        { name: t("Deep Research"), href: "/research", icon: Microscope },
        { name: t("Co-Writer"), href: "/co_writer", icon: Edit3 },
      ],
    },
  ];

  return (
    <div className="w-64 bg-slate-50/50 dark:bg-slate-800/50 h-full border-r border-slate-200 dark:border-slate-700 flex flex-col backdrop-blur-xl transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="DeepTutor Logo"
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
              href="https://github.com/HKUDS/DeepTutor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="View DeepTutor on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
            Learn 90% of what matters in AI
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {group.name && (
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-2">
                {group.name}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out border ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border-slate-100 dark:border-slate-600"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
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
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2 bg-slate-50/30 dark:bg-slate-800/30">
        {/* Settings */}
        <Link
          href="/settings"
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
            pathname === "/settings"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Settings
            className={`w-4 h-4 ${pathname === "/settings" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
          />
          <span>{t("Settings")}</span>
        </Link>
      </div>
    </div>
  );
}
