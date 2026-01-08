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
  Send,
  Loader2,
  Sparkles,
  GraduationCap,
  Target,
  MessageSquare,
  Zap,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Confetti from "@/components/Confetti";

// Paper data (same as papers page)
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

// Sample questions based on paper topics
const SAMPLE_QUESTIONS: Record<number, string[]> = {
  3: [
    "What problem do LSTMs solve that vanilla RNNs cannot?",
    "Explain the forget gate in your own words.",
    "Why is the cell state important?",
  ],
  2: [
    "What makes RNNs effective for text generation?",
    "What is meant by 'character-level' modeling?",
    "How do hidden states capture patterns?",
  ],
  13: [
    "What is self-attention and why is it important?",
    "How does multi-head attention differ from single-head?",
    "Why do transformers need positional encoding?",
  ],
  7: [
    "What made AlexNet different from previous approaches?",
    "Why was ReLU activation a breakthrough?",
    "How did GPU training enable deep learning?",
  ],
  10: [
    "What problem do skip connections solve?",
    "Explain residual learning in simple terms.",
    "Why can ResNets train deeper than plain networks?",
  ],
};

// Default questions for papers without specific ones
const DEFAULT_QUESTIONS = [
  "What is the main contribution of this paper?",
  "How does this relate to modern AI systems?",
  "What are the key limitations mentioned?",
];

function LearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paperId = parseInt(searchParams.get("paper") || "3");

  const [paper, setPaper] = useState(PAPERS.find(p => p.id === paperId) || PAPERS[2]);
  const [completedPapers, setCompletedPapers] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "solver" | "guided">("overview");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    const foundPaper = PAPERS.find(p => p.id === paperId);
    if (foundPaper) {
      setPaper(foundPaper);
    }
  }, [paperId]);

  useEffect(() => {
    const saved = localStorage.getItem("completedPapers");
    if (saved) {
      setCompletedPapers(new Set(JSON.parse(saved)));
    }
  }, []);

  const isCompleted = completedPapers.has(paper.id);

  const markComplete = () => {
    const newCompleted = new Set(completedPapers);
    newCompleted.add(paper.id);
    setCompletedPapers(newCompleted);
    localStorage.setItem("completedPapers", JSON.stringify([...newCompleted]));

    // Update streak
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastStudyDate");
    if (lastDate !== today) {
      const currentStreak = parseInt(localStorage.getItem("studyStreak") || "0");
      localStorage.setItem("studyStreak", (currentStreak + 1).toString());
      localStorage.setItem("lastStudyDate", today);
    }

    // Clear current paper
    localStorage.removeItem("currentPaper");

    setShowConfetti(true);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://localhost:8001/api/v1/agents/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context: I'm studying the paper "${paper.title}" (${paper.category}). ${paper.description}\n\nQuestion: ${question}`,
          knowledge_base: "ilya-top-30",
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullAnswer += chunk;
          setAnswer(fullAnswer);
        }
      } else {
        setAnswer("I apologize, but I couldn't process your question. Please try again.");
      }
    } catch (error) {
      setAnswer("Unable to connect to the AI. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setGeneratedQuestions([]);

    try {
      const response = await fetch("http://localhost:8001/api/v1/agents/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Generate 5 thoughtful study questions about "${paper.title}". The paper is about: ${paper.description}. Key takeaways include: ${paper.keyTakeaways.join(", ")}. Format as a numbered list.`,
          knowledge_base: "ilya-top-30",
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }

        // Parse questions from response
        const questions = fullResponse
          .split(/\d+\./)
          .filter(q => q.trim())
          .map(q => q.trim())
          .slice(0, 5);

        setGeneratedQuestions(questions);
      }
    } catch (error) {
      setGeneratedQuestions(["Unable to generate questions. Please try again."]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const sampleQuestions = SAMPLE_QUESTIONS[paper.id] || DEFAULT_QUESTIONS;

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
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                paper.type === "paper" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                : paper.type === "blog" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300"
                : paper.type === "course" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
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
                {formatTime(paper.timeMinutes)}
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
        {/* Left Column - Paper Info & Reading */}
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
              href={paper.url}
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
                { id: "questions", label: "Question Generator", icon: HelpCircle },
                { id: "solver", label: "Smart Solver", icon: Brain },
                { id: "guided", label: "Guided Learning", icon: GraduationCap },
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
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-300">{paper.description}</p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
                    <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Why It Matters
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">{paper.whyItMatters}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {paper.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "questions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Study Questions</h3>
                      <p className="text-sm text-slate-500">Test your understanding of the paper</p>
                    </div>
                    <button
                      onClick={generateQuestions}
                      disabled={isGeneratingQuestions}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isGeneratingQuestions ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Generate New
                    </button>
                  </div>

                  {/* Sample/Generated Questions */}
                  <div className="space-y-3">
                    {(generatedQuestions.length > 0 ? generatedQuestions : sampleQuestions).map((q, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-700 dark:text-slate-200">{q}</p>
                            <button
                              onClick={() => {
                                setQuestion(q);
                                setActiveTab("solver");
                              }}
                              className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              Ask AI for help <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "solver" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Smart Solver</h3>
                    <p className="text-sm text-slate-500">Ask any question about this paper</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                      placeholder="Ask a question about this paper..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={askQuestion}
                      disabled={isLoading || !question.trim()}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Quick questions */}
                  <div className="flex flex-wrap gap-2">
                    {sampleQuestions.slice(0, 3).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(q)}
                        className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {q.slice(0, 40)}...
                      </button>
                    ))}
                  </div>

                  {/* Answer */}
                  {answer && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Response</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{answer}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "guided" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Guided Learning</h3>
                    <p className="text-sm text-slate-500">Step-by-step guidance through the paper</p>
                  </div>

                  <div className="space-y-4">
                    {/* Learning Steps */}
                    {[
                      { step: 1, title: "Read the Abstract", desc: "Get the main idea in 2 minutes", done: false },
                      { step: 2, title: "Understand the Problem", desc: "What problem does this paper solve?", done: false },
                      { step: 3, title: "Key Contributions", desc: "What's new and important?", done: false },
                      { step: 4, title: "Method Overview", desc: "How does the approach work?", done: false },
                      { step: 5, title: "Results & Implications", desc: "What did they achieve?", done: false },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <Link
                          href={`/guide?topic=${encodeURIComponent(paper.title)}&step=${item.step}`}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Start
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Pro Tip</span>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Don't try to understand everything at once. Focus on the main ideas first, then dive deeper into sections that interest you.
                    </p>
                  </div>
                </div>
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
                <span className="font-medium text-slate-900 dark:text-white">{formatTime(paper.timeMinutes)}</span>
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

          {/* Prerequisites */}
          {paper.prerequisites.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Prerequisites</h3>
              <div className="space-y-2">
                {paper.prerequisites.map(prereqId => {
                  const prereq = PAPERS.find(p => p.id === prereqId);
                  const isPrereqCompleted = completedPapers.has(prereqId);
                  return prereq ? (
                    <Link
                      key={prereqId}
                      href={`/learn?paper=${prereqId}`}
                      className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                        isPrereqCompleted
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : "bg-amber-50 dark:bg-amber-900/20"
                      }`}
                    >
                      {isPrereqCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        #{prereqId} {prereq.title}
                      </span>
                    </Link>
                  ) : null;
                })}
              </div>
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
                href={`/solver?paper=${encodeURIComponent(paper.title)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Full AI Chat
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
