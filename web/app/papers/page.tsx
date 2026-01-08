"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  ExternalLink,
  FileText,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Clock,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Route,
  List,
  Play,
  Star,
} from "lucide-react";
import Link from "next/link";

// Learning path definitions - recommended order for different goals
const LEARNING_PATHS = {
  foundations: {
    name: "Foundations First",
    description: "Start with fundamentals, build up to transformers",
    icon: "Route",
    papers: [3, 2, 4, 7, 10, 15, 14, 13, 22], // LSTM → RNN blog → RNN reg → AlexNet → ResNet → ResNet v2 → Attention → Transformer → Scaling
  },
  transformers: {
    name: "Transformer Track",
    description: "Focus on attention and transformers",
    icon: "Zap",
    papers: [14, 13, 22, 6, 8], // Attention → Transformer → Scaling Laws → Pointer Networks → Order Matters
  },
  theory: {
    name: "Theory Deep Dive",
    description: "Information theory and complexity foundations",
    icon: "Lightbulb",
    papers: [23, 5, 25, 1, 19, 24], // MDL Tutorial → Hinton MDL → Kolmogorov → Complexodynamics → Coffee Automaton → Superintelligence
  },
  vision: {
    name: "Computer Vision",
    description: "CNNs and image understanding",
    icon: "Target",
    papers: [7, 10, 15, 11, 26], // AlexNet → ResNet → ResNet v2 → Dilated Conv → CS231n
  },
};

// Enhanced paper data with learning metadata
const PAPERS = [
  {
    id: 1,
    title: "The First Law of Complexodynamics",
    url: "https://scottaaronson.blog/?p=762",
    type: "blog",
    category: "Complexity Theory",
    difficulty: 4,
    timeMinutes: 30,
    prerequisites: [],
    keyTakeaways: [
      "Complexity isn't just entropy - it peaks in the middle",
      "Simple systems and chaotic systems are both 'simple' in different ways",
      "There's a 'sweet spot' where interesting computation happens",
    ],
    whyItMatters: "Helps understand why neural networks work - they live in the complexity sweet spot between too simple and too random.",
    description: "Scott Aaronson's exploration of complexity and entropy in physical systems.",
  },
  {
    id: 2,
    title: "The Unreasonable Effectiveness of Recurrent Neural Networks",
    url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/",
    type: "blog",
    category: "RNNs",
    difficulty: 2,
    timeMinutes: 45,
    prerequisites: [],
    keyTakeaways: [
      "RNNs can learn to generate surprisingly coherent text",
      "Character-level models can learn structure without explicit rules",
      "Hidden states capture meaningful patterns",
    ],
    whyItMatters: "Classic introduction to sequence modeling - the stepping stone to understanding LLMs.",
    description: "Andrej Karpathy's famous blog post demonstrating RNN capabilities for text generation.",
  },
  {
    id: 3,
    title: "Understanding LSTM Networks",
    url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
    type: "blog",
    category: "RNNs",
    difficulty: 2,
    timeMinutes: 30,
    prerequisites: [],
    keyTakeaways: [
      "Vanilla RNNs suffer from vanishing gradients",
      "LSTM gates control information flow: forget, input, output",
      "Cell state acts as a 'conveyor belt' for gradients",
    ],
    whyItMatters: "Essential for understanding how neural networks handle sequences - foundation for all modern language models.",
    description: "Chris Olah's visual explanation of LSTM architecture and how it solves the vanishing gradient problem.",
  },
  {
    id: 4,
    title: "Recurrent Neural Network Regularization",
    url: "https://arxiv.org/abs/1409.2329",
    type: "paper",
    category: "RNNs",
    difficulty: 3,
    timeMinutes: 60,
    prerequisites: [3],
    keyTakeaways: [
      "Dropout can be applied to RNNs (but carefully!)",
      "Don't dropout the recurrent connections",
      "Proper regularization enables much deeper RNN training",
    ],
    whyItMatters: "Showed how to train deeper, better RNNs - key technique still used today.",
    description: "Introduces dropout for RNNs, enabling training of much deeper recurrent networks.",
  },
  {
    id: 5,
    title: "Keeping Neural Networks Simple by Minimizing the Description Length of the Weights",
    url: "https://www.cs.toronto.edu/~hinton/absps/colt93.pdf",
    type: "paper",
    category: "Information Theory",
    difficulty: 4,
    timeMinutes: 90,
    prerequisites: [23],
    keyTakeaways: [
      "Simpler models = fewer bits to describe = better generalization",
      "Weight sharing and pruning as compression",
      "Connection between compression and learning",
    ],
    whyItMatters: "Foundation of modern model compression and understanding why regularization works.",
    description: "Hinton's paper on weight pruning using minimum description length principle.",
  },
  {
    id: 6,
    title: "Pointer Networks",
    url: "https://arxiv.org/abs/1506.03134",
    type: "paper",
    category: "Sequence Models",
    difficulty: 3,
    timeMinutes: 75,
    prerequisites: [14],
    keyTakeaways: [
      "Attention can point to input positions as output",
      "Solves variable-output-size problems elegantly",
      "Combinatorial problems can be learned end-to-end",
    ],
    whyItMatters: "Key innovation used in many modern architectures for tasks like sorting and routing.",
    description: "A novel architecture that learns to point to positions in the input sequence.",
  },
  {
    id: 7,
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    url: "https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
    type: "paper",
    category: "CNNs",
    difficulty: 2,
    timeMinutes: 60,
    prerequisites: [],
    keyTakeaways: [
      "Deep CNNs can dramatically outperform hand-crafted features",
      "ReLU activation enables faster training",
      "Dropout prevents overfitting in large networks",
      "GPU training is essential for scale",
    ],
    whyItMatters: "THE paper that started the deep learning revolution. Everything modern AI builds on this.",
    note: "AlexNet",
    description: "The AlexNet paper that sparked the deep learning revolution in computer vision.",
  },
  {
    id: 8,
    title: "Order Matters: Sequence to Sequence for Sets",
    url: "https://arxiv.org/abs/1511.06391",
    type: "paper",
    category: "Sequence Models",
    difficulty: 3,
    timeMinutes: 60,
    prerequisites: [14],
    keyTakeaways: [
      "Input order affects seq2seq performance significantly",
      "Read-Process-Write architecture for set inputs",
      "Attention over sets requires careful design",
    ],
    whyItMatters: "Important for understanding how transformers handle unordered inputs and positional encoding.",
    description: "Explores how input/output ordering affects seq2seq model performance.",
  },
  {
    id: 9,
    title: "GPipe: Easy Scaling with Micro-Batch Pipeline Parallelism",
    url: "https://arxiv.org/abs/1811.06965",
    type: "paper",
    category: "Scaling",
    difficulty: 3,
    timeMinutes: 45,
    prerequisites: [10],
    keyTakeaways: [
      "Pipeline parallelism splits model across devices",
      "Micro-batches reduce bubble overhead",
      "Enables training models too large for single GPU",
    ],
    whyItMatters: "Core technique for training GPT-scale models. Without this, no ChatGPT.",
    description: "Efficient pipeline parallelism for training giant neural networks.",
  },
  {
    id: 10,
    title: "Deep Residual Learning for Image Recognition",
    url: "https://arxiv.org/abs/1512.03385",
    type: "paper",
    category: "CNNs",
    difficulty: 2,
    timeMinutes: 60,
    prerequisites: [7],
    keyTakeaways: [
      "Skip connections enable training 100+ layer networks",
      "Residual learning: learn F(x) = H(x) - x instead of H(x)",
      "Deeper networks can now always be at least as good as shallower ones",
    ],
    whyItMatters: "Skip connections are now everywhere - transformers, diffusion models, everything uses this idea.",
    note: "ResNet",
    description: "Introduces skip connections enabling training of 100+ layer networks.",
  },
  {
    id: 11,
    title: "Multi-Scale Context Aggregation by Dilated Convolutions",
    url: "https://arxiv.org/abs/1511.07122",
    type: "paper",
    category: "CNNs",
    difficulty: 3,
    timeMinutes: 45,
    prerequisites: [7],
    keyTakeaways: [
      "Dilated convolutions expand receptive field without pooling",
      "Maintain resolution while seeing more context",
      "Essential for dense prediction tasks",
    ],
    whyItMatters: "Used in WaveNet, semantic segmentation, and many audio/image generation models.",
    description: "Dilated convolutions for dense prediction without losing resolution.",
  },
  {
    id: 12,
    title: "Neural Message Passing for Quantum Chemistry",
    url: "https://arxiv.org/abs/1704.01212",
    type: "paper",
    category: "Graph Neural Networks",
    difficulty: 4,
    timeMinutes: 90,
    prerequisites: [],
    keyTakeaways: [
      "Unified framework for graph neural networks",
      "Message passing: aggregate neighbor information iteratively",
      "Molecules are graphs - atoms are nodes, bonds are edges",
    ],
    whyItMatters: "Foundation of GNNs used in drug discovery, social networks, and recommendation systems.",
    description: "Unifies various graph neural network architectures under message passing framework.",
  },
  {
    id: 13,
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    type: "paper",
    category: "Transformers",
    difficulty: 3,
    timeMinutes: 120,
    prerequisites: [14],
    keyTakeaways: [
      "Self-attention replaces recurrence entirely",
      "Parallel processing of all positions",
      "Multi-head attention captures different relationships",
      "Positional encoding adds sequence information",
    ],
    whyItMatters: "THE most important paper in modern AI. GPT, BERT, Claude, everything is transformers.",
    note: "Transformer",
    description: "The Transformer paper - foundation of modern LLMs like GPT and BERT.",
  },
  {
    id: 14,
    title: "Neural Machine Translation by Jointly Learning to Align and Translate",
    url: "https://arxiv.org/abs/1409.0473",
    type: "paper",
    category: "Attention",
    difficulty: 3,
    timeMinutes: 90,
    prerequisites: [3],
    keyTakeaways: [
      "Attention: dynamically focus on relevant input parts",
      "Alignment learned end-to-end, not separate",
      "Soft attention is differentiable",
    ],
    whyItMatters: "Introduced attention mechanism - the key innovation that enabled transformers.",
    note: "Bahdanau Attention",
    description: "Introduces attention mechanism for sequence-to-sequence models.",
  },
  {
    id: 15,
    title: "Identity Mappings in Deep Residual Networks",
    url: "https://arxiv.org/abs/1603.05027",
    type: "paper",
    category: "CNNs",
    difficulty: 3,
    timeMinutes: 45,
    prerequisites: [10],
    keyTakeaways: [
      "Pre-activation (BN-ReLU-Conv) works better than post",
      "Clean identity path improves gradient flow",
      "Enables training even deeper networks (1000+ layers)",
    ],
    whyItMatters: "Refined understanding of why residual connections work - influences all modern architectures.",
    description: "Improved residual block design with pre-activation.",
  },
  {
    id: 16,
    title: "A Simple Neural Network Module for Relational Reasoning",
    url: "https://arxiv.org/abs/1706.01427",
    type: "paper",
    category: "Reasoning",
    difficulty: 3,
    timeMinutes: 60,
    prerequisites: [],
    keyTakeaways: [
      "Relation Networks explicitly model pairwise relationships",
      "Simple but powerful: just MLPs on object pairs",
      "Dramatically improves visual reasoning tasks",
    ],
    whyItMatters: "Shows how to add explicit reasoning capabilities - relevant for AI safety and interpretability.",
    description: "Relation Networks for learning relationships between objects.",
  },
  {
    id: 17,
    title: "Variational Lossy Autoencoder",
    url: "https://arxiv.org/abs/1611.02731",
    type: "paper",
    category: "Generative Models",
    difficulty: 4,
    timeMinutes: 90,
    prerequisites: [],
    keyTakeaways: [
      "VAE + autoregressive decoder = best of both worlds",
      "Bits-back coding connection to compression",
      "Hierarchical latent variables for better generation",
    ],
    whyItMatters: "Key ideas used in modern image generation and understanding latent spaces.",
    description: "Combines VAEs with autoregressive models for better generation.",
  },
  {
    id: 18,
    title: "Relational Recurrent Neural Networks",
    url: "https://arxiv.org/abs/1806.01822",
    type: "paper",
    category: "RNNs",
    difficulty: 4,
    timeMinutes: 60,
    prerequisites: [3, 16],
    keyTakeaways: [
      "Add relational memory module to LSTM",
      "Self-attention over memory slots",
      "Better long-range reasoning in sequences",
    ],
    whyItMatters: "Bridge between RNNs and transformers - shows attention improving recurrent models.",
    description: "Adds relational memory to RNNs for better long-range reasoning.",
  },
  {
    id: 19,
    title: "Quantifying the Rise and Fall of Complexity in Closed Systems: The Coffee Automaton",
    url: "https://arxiv.org/abs/1405.6903",
    type: "paper",
    category: "Complexity Theory",
    difficulty: 5,
    timeMinutes: 120,
    prerequisites: [1],
    keyTakeaways: [
      "Complexity rises then falls as systems evolve",
      "Coffee mixing as a model of complexity evolution",
      "Connection to thermodynamics and computation",
    ],
    whyItMatters: "Deep theory on why interesting structures emerge and disappear - relevant to understanding AI training dynamics.",
    description: "Explores how complexity evolves in closed systems using cellular automata.",
  },
  {
    id: 20,
    title: "Neural Turing Machines",
    url: "https://arxiv.org/abs/1410.5401",
    type: "paper",
    category: "Memory Networks",
    difficulty: 4,
    timeMinutes: 90,
    prerequisites: [3],
    keyTakeaways: [
      "Neural networks with external differentiable memory",
      "Content-based and location-based addressing",
      "Can learn simple algorithms like copying and sorting",
    ],
    whyItMatters: "Early attempt at giving networks explicit memory - ideas echoed in modern retrieval-augmented models.",
    description: "Neural networks with external memory and attention-based read/write.",
  },
  {
    id: 21,
    title: "Deep Speech 2: End-to-End Speech Recognition in English and Mandarin",
    url: "https://arxiv.org/abs/1512.02595",
    type: "paper",
    category: "Speech",
    difficulty: 3,
    timeMinutes: 75,
    prerequisites: [3, 7],
    keyTakeaways: [
      "End-to-end learning beats hand-engineered pipelines",
      "CTC loss for sequence-to-sequence without alignment",
      "Batch normalization for RNNs",
    ],
    whyItMatters: "Showed end-to-end deep learning wins - philosophy now standard across all AI.",
    description: "End-to-end deep learning for speech recognition at scale.",
  },
  {
    id: 22,
    title: "Scaling Laws for Neural Language Models",
    url: "https://arxiv.org/abs/2001.08361",
    type: "paper",
    category: "Scaling",
    difficulty: 3,
    timeMinutes: 90,
    prerequisites: [13],
    keyTakeaways: [
      "Loss scales as power law with compute, data, and parameters",
      "Smooth, predictable improvement with scale",
      "Optimal allocation: scale all three together",
    ],
    whyItMatters: "THE paper explaining why bigger models work better. Justified the GPT-4 scale investments.",
    description: "Empirical scaling laws showing how model performance improves with size.",
  },
  {
    id: 23,
    title: "A Tutorial Introduction to the Minimum Description Length Principle",
    url: "https://arxiv.org/abs/math/0406077",
    type: "paper",
    category: "Information Theory",
    difficulty: 4,
    timeMinutes: 180,
    prerequisites: [],
    keyTakeaways: [
      "Best model = shortest description of data + model",
      "Occam's Razor formalized mathematically",
      "Connection between compression and prediction",
    ],
    whyItMatters: "Deep theoretical foundation for why simpler models generalize better.",
    description: "Comprehensive tutorial on MDL - compression as a model selection criterion.",
  },
  {
    id: 24,
    title: "Machine Super Intelligence",
    url: "https://www.vetta.org/documents/Machine_Super_Intelligence.pdf",
    type: "paper",
    category: "AGI",
    difficulty: 4,
    timeMinutes: 240,
    prerequisites: [25],
    keyTakeaways: [
      "AIXI: theoretical optimal agent",
      "Intelligence = compression",
      "Theoretical limits of machine intelligence",
    ],
    whyItMatters: "Theoretical framework Ilya referenced for thinking about AGI and superintelligence.",
    description: "Shane Legg's PhD thesis on measuring and achieving machine intelligence.",
  },
  {
    id: 25,
    title: "Kolmogorov Complexity and Algorithmic Randomness",
    url: "https://www.lirmm.fr/~ashen/kolmbook-eng-scan.pdf",
    type: "book",
    category: "Information Theory",
    difficulty: 5,
    timeMinutes: 600,
    prerequisites: [],
    keyTakeaways: [
      "Kolmogorov complexity: shortest program to produce output",
      "Incomputable but fundamental",
      "Random = incompressible",
    ],
    whyItMatters: "The deepest theoretical foundation for understanding learning and compression.",
    description: "Comprehensive textbook on algorithmic information theory.",
  },
  {
    id: 26,
    title: "Stanford's CS231n Convolutional Neural Networks for Visual Recognition",
    url: "https://cs231n.github.io/",
    type: "course",
    category: "CNNs",
    difficulty: 2,
    timeMinutes: 1200,
    prerequisites: [],
    keyTakeaways: [
      "Complete introduction to CNNs and deep learning",
      "Backpropagation from first principles",
      "Practical training tips and tricks",
    ],
    whyItMatters: "The course that trained a generation of deep learning practitioners.",
    description: "Stanford's famous course on CNNs, taught by Fei-Fei Li and Andrej Karpathy.",
  },
];

const CATEGORIES = [
  "All",
  "RNNs",
  "CNNs",
  "Transformers",
  "Attention",
  "Scaling",
  "Information Theory",
  "Complexity Theory",
  "Sequence Models",
  "Graph Neural Networks",
  "Memory Networks",
  "Generative Models",
  "Reasoning",
  "Speech",
  "AGI",
];

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Moderate", "Advanced", "Expert"];
const DIFFICULTY_COLORS = ["", "text-green-500", "text-green-500", "text-yellow-500", "text-orange-500", "text-red-500"];

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

export default function PapersPage() {
  const [completedPapers, setCompletedPapers] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "path">("all");
  const [selectedPath, setSelectedPath] = useState<string>("foundations");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("completedPapers");
    if (saved) {
      setCompletedPapers(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleCompleted = (id: number) => {
    const newCompleted = new Set(completedPapers);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedPapers(newCompleted);
    localStorage.setItem("completedPapers", JSON.stringify([...newCompleted]));
  };

  const filteredPapers = viewMode === "path"
    ? LEARNING_PATHS[selectedPath as keyof typeof LEARNING_PATHS].papers.map(id => PAPERS.find(p => p.id === id)!)
    : PAPERS.filter((paper) => {
        const matchesCategory =
          selectedCategory === "All" || paper.category === selectedCategory;
        const matchesSearch =
          searchQuery === "" ||
          paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });

  const progress = (completedPapers.size / PAPERS.length) * 100;
  const totalTime = PAPERS.reduce((acc, p) => acc + p.timeMinutes, 0);
  const completedTime = PAPERS.filter(p => completedPapers.has(p.id)).reduce((acc, p) => acc + p.timeMinutes, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Ilya's Top 30 Papers
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          "If you really learn all of these, you'll know 90% of what matters today" — Ilya Sutskever
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {completedPapers.size}/{PAPERS.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Invested</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatTime(completedTime)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            of {formatTime(totalTime)} total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Next Up</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                {PAPERS.find(p => !completedPapers.has(p.id))?.title.slice(0, 25) || "All done!"}...
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Play className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* View Mode */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setViewMode("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <List className="w-4 h-4" />
            All Papers
          </button>
          <button
            onClick={() => setViewMode("path")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "path"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Route className="w-4 h-4" />
            Learning Path
          </button>
        </div>

        {/* Filters (only in "all" mode) */}
        {viewMode === "all" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Learning Path Selector (only in "path" mode) */}
      {viewMode === "path" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(LEARNING_PATHS).map(([key, path]) => (
            <button
              key={key}
              onClick={() => setSelectedPath(key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedPath === key
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Route className={`w-4 h-4 ${selectedPath === key ? "text-blue-500" : "text-slate-400"}`} />
                <span className={`font-semibold text-sm ${selectedPath === key ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                  {path.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{path.description}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{path.papers.length} papers</p>
            </button>
          ))}
        </div>
      )}

      {/* Papers List */}
      <div className="space-y-3">
        {filteredPapers.map((paper, index) => {
          const isCompleted = completedPapers.has(paper.id);
          const isExpanded = expandedPaper === paper.id;
          const prereqsMet = paper.prerequisites.every(id => completedPapers.has(id));
          const prereqPapers = paper.prerequisites.map(id => PAPERS.find(p => p.id === id)!);

          return (
            <div
              key={paper.id}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all duration-200 ${
                isCompleted
                  ? "border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/10"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="p-4">
                <div className="flex gap-3">
                  {/* Completion Toggle */}
                  <button
                    onClick={() => toggleCompleted(paper.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-blue-400 transition-colors" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {viewMode === "path" && (
                            <span className="text-xs font-bold text-blue-500 dark:text-blue-400">
                              Step {index + 1}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">#{paper.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            paper.type === "paper" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                            : paper.type === "blog" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300"
                            : paper.type === "course" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            {paper.type}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {paper.category}
                          </span>
                          {paper.note && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {paper.note}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`font-semibold ${isCompleted ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                          {paper.title}
                        </h3>

                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(paper.timeMinutes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            <DifficultyStars level={paper.difficulty} />
                            <span className={DIFFICULTY_COLORS[paper.difficulty]}>{DIFFICULTY_LABELS[paper.difficulty]}</span>
                          </div>
                          {prereqPapers.length > 0 && !prereqsMet && (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Prerequisites needed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                          title="Read"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/solver?paper=${encodeURIComponent(paper.title)}`}
                          className="p-2 rounded-lg text-slate-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                          title="Ask AI"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 ml-8 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{paper.description}</p>

                    {/* Why It Matters */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Why It Matters
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{paper.whyItMatters}</p>
                    </div>

                    {/* Key Takeaways */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Key Takeaways
                      </h4>
                      <ul className="space-y-1">
                        {paper.keyTakeaways.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                            {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prerequisites */}
                    {prereqPapers.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Read First
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {prereqPapers.map((prereq) => (
                            <span
                              key={prereq.id}
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                completedPapers.has(prereq.id)
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {completedPapers.has(prereq.id) ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                              #{prereq.id} {prereq.title.slice(0, 30)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Read Paper
                      </a>
                      <Link
                        href={`/guide?topic=${encodeURIComponent(paper.title)}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        Guided Learning
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPapers.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No papers found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
