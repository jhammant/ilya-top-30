"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// Pages that should not show the sidebar
const FULL_WIDTH_PAGES = ["/welcome"];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidth = FULL_WIDTH_PAGES.includes(pathname);

  if (isFullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        <div className="w-full p-8">{children}</div>
      </main>
    </div>
  );
}
