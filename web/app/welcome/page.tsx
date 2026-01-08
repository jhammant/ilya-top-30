"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Brain,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  GraduationCap,
  Play,
  Network,
  HelpCircle,
  MessageSquare,
  Trophy,
  Flame,
  Share2,
  ChevronRight,
  Lightbulb,
  Route,
  BarChart3,
} from "lucide-react";

const FEATURED_PAPERS = [
  { id: 13, title: "Attention Is All You Need", note: "Transformer", category: "The foundation of GPT & Claude" },
  { id: 7, title: "ImageNet Classification with Deep CNNs", note: "AlexNet", category: "Started the deep learning revolution" },
  { id: 22, title: "Scaling Laws for Neural Language Models", note: "", category: "Why bigger models work better" },
  { id: 10, title: "Deep Residual Learning", note: "ResNet", category: "Skip connections everywhere" },
];

const LEARNING_STATS = [
  { label: "Papers", value: "26", icon: BookOpen },
  { label: "Hours of Content", value: "60+", icon: Clock },
  { label: "Key Concepts", value: "100+", icon: Brain },
  { label: "Learning Paths", value: "4", icon: Target },
];

const LEARNING_PATHS = [
  { name: "Foundations", icon: GraduationCap, color: "blue", papers: 5, description: "RNNs, LSTMs, and the basics" },
  { name: "Transformers", icon: Zap, color: "purple", papers: 6, description: "Attention and modern architectures" },
  { name: "Computer Vision", icon: Target, color: "emerald", papers: 6, description: "CNNs and image understanding" },
  { name: "Theory & AGI", icon: Brain, color: "amber", papers: 9, description: "Deep theory and complexity" },
];

const FEATURES = [
  {
    title: "Smart Solver",
    description: "Ask any question about the papers and get AI-powered answers backed by the actual content. Like having a tutor who's read everything.",
    icon: Brain,
    color: "purple",
    href: "/solver",
  },
  {
    title: "Question Generator",
    description: "Generate study questions to test your understanding. Perfect for self-assessment and exam prep.",
    icon: HelpCircle,
    color: "emerald",
    href: "/question",
  },
  {
    title: "Guided Learning",
    description: "Step-by-step guidance through each paper. Break down complex concepts into digestible pieces.",
    icon: GraduationCap,
    color: "blue",
    href: "/guide",
  },
  {
    title: "Paper Graph",
    description: "Visualize how papers connect to each other. See the intellectual lineage of modern AI.",
    icon: Network,
    color: "pink",
    href: "/graph",
  },
];

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
          {/* Badge */}
          <div className={`flex justify-center mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Curated by Ilya Sutskever (OpenAI Co-founder)</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className={`text-5xl md:text-7xl font-bold text-center mb-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "200ms" }}>
            Master the{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Foundations
            </span>
            <br />
            of Modern AI
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-slate-300 text-center max-w-3xl mx-auto mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "300ms" }}>
            An AI-powered learning platform for Ilya's legendary reading list.{" "}
            <span className="text-white font-semibold">26 papers</span> that shaped the AI revolution.
          </p>

          {/* Quote */}
          <p className={`text-center text-slate-400 mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
            "If you really learn all of these, you'll know <span className="text-amber-400">90% of what matters</span> today" — Ilya Sutskever
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "500ms" }}>
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Play className="w-5 h-5" />
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/papers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm"
            >
              <BookOpen className="w-5 h-5" />
              Browse Papers
            </Link>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "600ms" }}>
            {LEARNING_STATS.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI-Powered Learning Section */}
      <div className="relative py-24 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">AI-Powered Learning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Learn Smarter, Not Harder
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Four powerful AI tools to accelerate your understanding of these foundational papers
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Feature Cards */}
            <div className="space-y-4">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const isActive = activeFeature === i;
                return (
                  <button
                    key={feature.title}
                    onClick={() => setActiveFeature(i)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? "bg-white/10 border-white/20 scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${feature.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                        <p className={`text-sm transition-all duration-300 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                          {feature.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "text-white rotate-90" : "text-slate-500"}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feature Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-800/80 rounded-3xl p-8 border border-slate-700 backdrop-blur-sm">
                {activeFeature === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <Brain className="w-8 h-8 text-purple-400" />
                      <h3 className="text-xl font-bold">Smart Solver</h3>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-sm text-slate-400 mb-2">Your question:</p>
                      <p className="text-white">"How does multi-head attention differ from single attention?"</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-sm text-purple-400 mb-2">AI Response:</p>
                      <p className="text-slate-300 text-sm">Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With single attention, averaging inhibits this...</p>
                    </div>
                  </div>
                )}
                {activeFeature === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <HelpCircle className="w-8 h-8 text-emerald-400" />
                      <h3 className="text-xl font-bold">Question Generator</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Generated questions for "Attention Is All You Need":</p>
                    {[
                      "What problem does self-attention solve?",
                      "Why do we need positional encoding?",
                      "What are the benefits of multi-head attention?",
                    ].map((q, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-200">{q}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <GraduationCap className="w-8 h-8 text-blue-400" />
                      <h3 className="text-xl font-bold">Guided Learning</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Step-by-step guidance:</p>
                    {[
                      { step: 1, title: "Read the Abstract", status: "complete" },
                      { step: 2, title: "Understand the Problem", status: "current" },
                      { step: 3, title: "Key Contributions", status: "locked" },
                      { step: 4, title: "Method Overview", status: "locked" },
                    ].map((item) => (
                      <div key={item.step} className={`flex items-center gap-3 p-3 rounded-lg ${
                        item.status === "complete" ? "bg-emerald-500/10" :
                        item.status === "current" ? "bg-blue-500/10 border border-blue-500/30" :
                        "bg-slate-700/30 opacity-50"
                      }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.status === "complete" ? "bg-emerald-500 text-white" :
                          item.status === "current" ? "bg-blue-500 text-white" :
                          "bg-slate-600 text-slate-400"
                        }`}>
                          {item.status === "complete" ? "✓" : item.step}
                        </span>
                        <span className="text-sm text-slate-200">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <Network className="w-8 h-8 text-pink-400" />
                      <h3 className="text-xl font-bold">Paper Graph</h3>
                    </div>
                    <div className="relative h-48 bg-slate-700/30 rounded-xl overflow-hidden">
                      {/* Simplified graph visualization */}
                      <svg viewBox="0 0 300 150" className="w-full h-full">
                        {/* Connections */}
                        <line x1="60" y1="75" x2="150" y2="45" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                        <line x1="60" y1="75" x2="150" y2="105" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                        <line x1="150" y1="45" x2="240" y2="75" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                        <line x1="150" y1="105" x2="240" y2="75" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                        {/* Nodes */}
                        <circle cx="60" cy="75" r="20" fill="#3b82f6" />
                        <text x="60" y="80" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">LSTM</text>
                        <circle cx="150" cy="45" r="20" fill="#8b5cf6" />
                        <text x="150" y="50" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Attn</text>
                        <circle cx="150" cy="105" r="20" fill="#10b981" />
                        <text x="150" y="110" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">CNN</text>
                        <circle cx="240" cy="75" r="25" fill="#ef4444" />
                        <text x="240" y="80" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Trans</text>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 text-center">See how papers build on each other</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths Section */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-6">
              <Route className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Structured Learning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Four Curated Paths
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose your journey based on your interests and goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEARNING_PATHS.map((path, i) => {
              const Icon = path.icon;
              return (
                <Link
                  key={path.name}
                  href="/"
                  className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700 hover:border-blue-500/50 transition-all hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${path.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 text-${path.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">{path.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{path.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{path.papers} papers</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Papers */}
      <div className="py-24 bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Foundational Papers
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              The most influential papers that shaped modern AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_PAPERS.map((paper) => (
              <div
                key={paper.id}
                className="group p-5 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 hover:border-blue-500/50 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-400">#{paper.id}</span>
                  {paper.note && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {paper.note}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {paper.title}
                </h3>
                <p className="text-sm text-slate-400">{paper.category}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/papers"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              View all 26 papers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Progress & Gamification */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Track Progress</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Stay Motivated with
                <br />
                <span className="text-amber-400">Achievements & Streaks</span>
              </h2>
              <ul className="space-y-4">
                {[
                  { icon: Flame, text: "Build study streaks to stay consistent", color: "orange" },
                  { icon: Trophy, text: "Unlock achievements as you progress", color: "amber" },
                  { icon: BarChart3, text: "Track your overall progress", color: "blue" },
                  { icon: Share2, text: "Share your journey with others", color: "purple" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/20 flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    </div>
                    <span className="text-slate-300">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-800/80 rounded-3xl p-8 border border-slate-700">
                {/* Progress Preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">7 day streak</div>
                        <div className="text-sm text-slate-400">Keep it going!</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Overall Progress</span>
                      <span className="font-bold">42%</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">11 of 26 papers completed</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Star, name: "First Steps", unlocked: true },
                      { icon: Zap, name: "Quick Learner", unlocked: true },
                      { icon: Target, name: "Path Master", unlocked: false },
                      { icon: Trophy, name: "AI Expert", unlocked: false },
                    ].map((badge) => (
                      <div
                        key={badge.name}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          badge.unlocked ? "bg-amber-500/10" : "bg-slate-700/50 opacity-50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          badge.unlocked ? "bg-amber-500" : "bg-slate-600"
                        }`}>
                          <badge.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ilya Quote Section */}
      <div className="py-24 bg-gradient-to-b from-slate-800/50 to-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-slate-800/50 rounded-3xl p-12 border border-slate-700 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                "If you really learn all of these, you'll know{" "}
                <span className="text-amber-400">90% of what matters</span> today."
              </blockquote>
              <div className="text-slate-400">
                <div className="font-semibold text-white">Ilya Sutskever</div>
                <div className="text-sm">Co-founder, OpenAI • Chief Scientist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master AI?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your journey through the foundational papers that shaped modern artificial intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Zap className="w-6 h-6" />
              Start Learning Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-xl transition-all"
            >
              <Network className="w-6 h-6" />
              Explore Paper Graph
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">Ilya's Top 30</div>
                <div className="text-xs text-slate-500">AI Paper Learning Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/papers" className="hover:text-white transition-colors">Papers</Link>
              <Link href="/graph" className="hover:text-white transition-colors">Graph</Link>
              <Link href="/solver" className="hover:text-white transition-colors">AI Solver</Link>
              <Link href="/share" className="hover:text-white transition-colors">Share</Link>
            </div>
            <div className="text-sm text-slate-500">
              Built with{" "}
              <a href="https://github.com/HKUDS/DeepTutor" className="text-blue-400 hover:underline">
                DeepTutor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
