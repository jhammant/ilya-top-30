"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Brain,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  Loader2,
  Sparkles,
  GraduationCap,
  Target,
  MessageSquare,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Confetti from "@/components/Confetti";
import {
  PAPERS,
  getPaperSummary,
  getPaperQA,
  getLearningGuide,
  getPaperFAQ,
  type PaperSummary,
  type PaperQA,
  type LearningGuide,
  type PaperFAQ,
} from "@/lib/static-data";
import { useLearning } from "@/context/LearningContext";

// Paper URLs for external reading
const PAPER_URLS: Record<number, string> = {
  1: "https://scottaaronson.blog/?p=762",
  2: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/",
  3: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
  4: "https://arxiv.org/abs/1409.2329",
  5: "https://www.cs.toronto.edu/~hinton/absps/colt93.pdf",
  6: "https://arxiv.org/abs/1506.03134",
  7: "https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
  8: "https://arxiv.org/abs/1511.06391",
  9: "https://arxiv.org/abs/1811.06965",
  10: "https://arxiv.org/abs/1512.03385",
  11: "https://arxiv.org/abs/1511.07122",
  12: "https://arxiv.org/abs/1704.01212",
  13: "https://arxiv.org/abs/1706.03762",
  14: "https://arxiv.org/abs/1409.0473",
  15: "https://arxiv.org/abs/1603.05027",
  16: "https://arxiv.org/abs/1706.01427",
  17: "https://arxiv.org/abs/1611.02731",
  18: "https://arxiv.org/abs/1806.01822",
  19: "https://arxiv.org/abs/1405.6903",
  20: "https://arxiv.org/abs/1410.5401",
  21: "https://arxiv.org/abs/1512.02595",
  22: "https://arxiv.org/abs/2001.08361",
  23: "https://arxiv.org/abs/math/0406077",
  24: "https://www.vetta.org/documents/Machine_Super_Intelligence.pdf",
  25: "https://www.lirmm.fr/~ashen/kolmbook-eng-scan.pdf",
  26: "https://cs231n.github.io/",
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= level ? "fill-current text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
    </div>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = parseInt(searchParams.get("paper") || "3");

  const { markPaperComplete, completedPapers, addXP } = useLearning();

  const [paper, setPaper] = useState(PAPERS.find((p) => p.id === paperId) || PAPERS[2]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "faq" | "learning">("overview");

  // Precomputed content
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [qa, setQA] = useState<PaperQA | null>(null);
  const [learning, setLearning] = useState<LearningGuide | null>(null);
  const [faq, setFaq] = useState<PaperFAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Learning steps state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Load paper and precomputed content
  useEffect(() => {
    const foundPaper = PAPERS.find((p) => p.id === paperId);
    if (foundPaper) {
      setPaper(foundPaper);
    }

    // Load precomputed content
    setIsLoading(true);
    Promise.all([
      getPaperSummary(paperId),
      getPaperQA(paperId),
      getLearningGuide(paperId),
      getPaperFAQ(paperId),
    ]).then(([s, q, l, f]) => {
      setSummary(s);
      setQA(q);
      setLearning(l);
      setFaq(f);
      setIsLoading(false);
    });
  }, [paperId]);

  const isCompleted = completedPapers.has(paperId);

  const markComplete = () => {
    markPaperComplete(paperId);
    setShowConfetti(true);
  };

  const markStepComplete = (stepNum: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepNum);
    setCompletedSteps(newCompleted);
    addXP(10, "Learning step completed");

    // Auto advance to next step
    if (learning && stepNum < learning.learning_guide.steps.length - 1) {
      setCurrentStep(stepNum + 1);
    }
  };

  const paperUrl = PAPER_URLS[paper.id] || "#";

  return (
    <div className="min-h-screen pb-20">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-500">#{paper.id}</span>
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  paper.type === "paper"
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                    : paper.type === "blog"
                      ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300"
                      : paper.type === "course"
                        ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {paper.type}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                {paper.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {paper.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(paper.time)}
              </span>
              <DifficultyStars level={paper.difficulty} />
            </div>
          </div>

          {!isCompleted ? (
            <button
              onClick={markComplete}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark Complete
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Paper Info & Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Read Paper Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Read the Paper</h2>
                <p className="text-blue-100 text-sm">Open in a new tab to study</p>
              </div>
            </div>
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Open Paper
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Learning Tools Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "faq", label: "FAQ", icon: HelpCircle },
                { id: "learning", label: "Guided Learning", icon: GraduationCap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {activeTab === "overview" && summary && (
                    <div className="space-y-6">
                      {/* One-liner */}
                      <div className="text-lg font-medium text-slate-700 dark:text-slate-200 border-l-4 border-blue-500 pl-4">
                        {summary.one_liner}
                      </div>

                      {/* ELI5 */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                        <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Explain Like I'm 5
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">{summary.eli5}</p>
                      </div>

                      {/* Paragraphs */}
                      <div className="space-y-4">
                        {summary.paragraphs.map((para, i) => (
                          <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Key Takeaways */}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-500" />
                          Key Takeaways
                        </h3>
                        <ul className="space-y-2">
                          {summary.key_takeaways.map((takeaway, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {takeaway}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prerequisites & Applications */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {summary.prerequisites && summary.prerequisites.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Prerequisites
                            </h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                              {summary.prerequisites.map((p, i) => (
                                <li key={i}>• {p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summary.applications && summary.applications.length > 0 && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Applications
                            </h4>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                              {summary.applications.map((a, i) => (
                                <li key={i}>• {a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "overview" && !summary && (
                    <div className="text-center py-8 text-slate-500">
                      <p>Summary content is being generated...</p>
                      <p className="text-sm mt-2">Check back soon!</p>
                    </div>
                  )}

                  {activeTab === "faq" && faq && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                          <p className="text-sm text-slate-500">{faq.total_faqs} questions about this paper</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {faq.faqs.map((item) => (
                          <div
                            key={item.id}
                            className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    item.category === "understanding"
                                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
                                      : item.category === "implementation"
                                        ? "bg-green-100 dark:bg-green-900/50 text-green-600"
                                        : item.category === "comparison"
                                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600"
                                          : item.category === "application"
                                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600"
                                  }`}
                                >
                                  {item.category}
                                </span>
                                <span className="font-medium text-slate-900 dark:text-white">{item.question}</span>
                              </div>
                              {expandedFaq === item.id ? (
                                <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                              )}
                            </button>
                            {expandedFaq === item.id && (
                              <div className="px-4 pb-4 pt-0">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                  <p className="text-slate-700 dark:text-slate-200 mb-3">{item.answer}</p>
                                  {item.related_concepts.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.related_concepts.map((concept, i) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded"
                                        >
                                          {concept}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {item.follow_up && (
                                    <p className="text-sm text-slate-500 mt-3 italic">
                                      Follow-up: {item.follow_up}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "faq" && !faq && (
                    <div className="text-center py-8 text-slate-500">
                      <p>FAQ content is being generated...</p>
                      <p className="text-sm mt-2">Check back soon!</p>
                    </div>
                  )}

                  {activeTab === "learning" && learning && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Guided Learning</h3>
                        <p className="text-sm text-slate-500">{learning.learning_guide.introduction}</p>
                      </div>

                      {/* Learning Objectives */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Learning Objectives</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          {learning.learning_guide.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div className="space-y-4">
                        {learning.learning_guide.steps.map((step, idx) => (
                          <div
                            key={step.step_number}
                            className={`border rounded-xl overflow-hidden transition-all ${
                              currentStep === idx
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                : completedSteps.has(idx)
                                  ? "border-emerald-300 dark:border-emerald-800"
                                  : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <button
                              onClick={() => setCurrentStep(idx)}
                              className="w-full flex items-start gap-4 p-4 text-left"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                                  completedSteps.has(idx)
                                    ? "bg-emerald-500 text-white"
                                    : currentStep === idx
                                      ? "bg-blue-500 text-white"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {completedSteps.has(idx) ? <CheckCircle2 className="w-5 h-5" /> : step.step_number}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900 dark:text-white">{step.title}</h4>
                                <p className="text-sm text-slate-500">~{step.duration_minutes} min</p>
                              </div>
                            </button>

                            {currentStep === idx && (
                              <div className="px-4 pb-4 pt-0 ml-12">
                                <div className="space-y-4">
                                  <p className="text-slate-600 dark:text-slate-300">{step.content}</p>

                                  {step.key_points.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Key Points</h5>
                                      <ul className="space-y-1">
                                        {step.key_points.map((point, i) => (
                                          <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            {point}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Checkpoint */}
                                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                    <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-1 text-sm">Checkpoint</h5>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">{step.checkpoint_question}</p>
                                    <details className="mt-2">
                                      <summary className="text-sm text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
                                        Reveal answer
                                      </summary>
                                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 pl-2 border-l-2 border-amber-300">
                                        {step.checkpoint_answer}
                                      </p>
                                    </details>
                                  </div>

                                  {!completedSteps.has(idx) && (
                                    <button
                                      onClick={() => markStepComplete(idx)}
                                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Mark Step Complete (+10 XP)
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      {completedSteps.size === learning.learning_guide.steps.length && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                          <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            All Steps Completed!
                          </h4>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">{learning.learning_guide.summary}</p>
                          <div className="mt-3">
                            <h5 className="font-medium text-emerald-800 dark:text-emerald-200 text-sm mb-1">Next Steps:</h5>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-300">
                              {learning.learning_guide.next_steps.map((ns, i) => (
                                <li key={i}>• {ns}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "learning" && !learning && (
                    <div className="text-center py-8 text-slate-500">
                      <p>Learning guide is being generated...</p>
                      <p className="text-sm mt-2">Check back soon!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Progress & Tools */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Paper Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900 dark:text-white">{paper.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reading Time</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatTime(paper.time)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">{paper.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Difficulty</span>
                <DifficultyStars level={paper.difficulty} />
              </div>
            </div>
          </div>

          {/* Quiz Card */}
          {qa && qa.questions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Test Your Knowledge</h3>
              <p className="text-sm text-slate-500 mb-4">{qa.total_questions} questions available</p>
              <div className="flex gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded">
                  {qa.stats.easy} Easy
                </span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">
                  {qa.stats.medium} Medium
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                  {qa.stats.hard} Hard
                </span>
              </div>
              <Link
                href={`/quiz?paper=${paper.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
              >
                <Brain className="w-5 h-5" />
                Start Quiz
              </Link>
            </div>
          )}

          {/* Flashcards Card */}
          {qa && qa.questions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Flashcards</h3>
              <p className="text-sm text-slate-500 mb-4">Review with spaced repetition</p>
              <Link
                href={`/flashcards?paper=${paper.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Study Flashcards
              </Link>
            </div>
          )}

          {/* More Tools */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">More Tools</h3>
            <div className="space-y-2">
              <Link
                href="/graph"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  See Related Papers
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/concepts"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Concept Map
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LearnPageContent />
    </Suspense>
  );
}
