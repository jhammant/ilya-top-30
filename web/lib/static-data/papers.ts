/**
 * Static paper data for the PWA.
 *
 * This is the source of truth for paper metadata.
 */

export const PAPERS = [
  { id: 1, title: "The First Law of Complexodynamics", category: "Complexity Theory", difficulty: 4, time: 30, path: "theory", type: "blog" },
  { id: 2, title: "The Unreasonable Effectiveness of RNNs", category: "RNNs", difficulty: 2, time: 45, path: "foundations", type: "blog" },
  { id: 3, title: "Understanding LSTM Networks", category: "RNNs", difficulty: 2, time: 30, path: "foundations", type: "blog" },
  { id: 4, title: "Recurrent Neural Network Regularization", category: "RNNs", difficulty: 3, time: 60, path: "foundations", type: "paper" },
  { id: 5, title: "Keeping Neural Networks Simple (MDL)", category: "Information Theory", difficulty: 4, time: 90, path: "theory", type: "paper" },
  { id: 6, title: "Pointer Networks", category: "Sequence Models", difficulty: 3, time: 75, path: "transformers", type: "paper" },
  { id: 7, title: "ImageNet Classification (AlexNet)", category: "CNNs", difficulty: 2, time: 60, path: "vision", type: "paper" },
  { id: 8, title: "Order Matters: Seq2Seq for Sets", category: "Sequence Models", difficulty: 3, time: 60, path: "transformers", type: "paper" },
  { id: 9, title: "GPipe: Pipeline Parallelism", category: "Scaling", difficulty: 3, time: 45, path: "transformers", type: "paper" },
  { id: 10, title: "Deep Residual Learning (ResNet)", category: "CNNs", difficulty: 2, time: 60, path: "vision", type: "paper" },
  { id: 11, title: "Dilated Convolutions", category: "CNNs", difficulty: 3, time: 45, path: "vision", type: "paper" },
  { id: 12, title: "Neural Message Passing", category: "GNNs", difficulty: 4, time: 90, path: "vision", type: "paper" },
  { id: 13, title: "Attention Is All You Need", category: "Transformers", difficulty: 3, time: 120, path: "transformers", type: "paper" },
  { id: 14, title: "Neural Machine Translation (Attention)", category: "Attention", difficulty: 3, time: 90, path: "transformers", type: "paper" },
  { id: 15, title: "Identity Mappings in ResNets", category: "CNNs", difficulty: 3, time: 45, path: "vision", type: "paper" },
  { id: 16, title: "Relational Reasoning Networks", category: "Reasoning", difficulty: 3, time: 60, path: "theory", type: "paper" },
  { id: 17, title: "Variational Lossy Autoencoder", category: "Generative", difficulty: 4, time: 90, path: "theory", type: "paper" },
  { id: 18, title: "Relational Recurrent Neural Networks", category: "RNNs", difficulty: 4, time: 60, path: "foundations", type: "paper" },
  { id: 19, title: "The Coffee Automaton", category: "Complexity Theory", difficulty: 5, time: 120, path: "theory", type: "paper" },
  { id: 20, title: "Neural Turing Machines", category: "Memory Networks", difficulty: 4, time: 90, path: "theory", type: "paper" },
  { id: 21, title: "Deep Speech 2", category: "Speech", difficulty: 3, time: 75, path: "foundations", type: "paper" },
  { id: 22, title: "Scaling Laws for Neural LMs", category: "Scaling", difficulty: 3, time: 90, path: "transformers", type: "paper" },
  { id: 23, title: "MDL Principle Tutorial", category: "Information Theory", difficulty: 4, time: 180, path: "theory", type: "paper" },
  { id: 24, title: "Machine Super Intelligence", category: "AGI", difficulty: 4, time: 240, path: "theory", type: "paper" },
  { id: 25, title: "Kolmogorov Complexity", category: "Information Theory", difficulty: 5, time: 600, path: "theory", type: "book" },
  { id: 26, title: "CS231n Course", category: "CNNs", difficulty: 2, time: 1200, path: "vision", type: "course" },
] as const;

export const LEARNING_PATHS = {
  foundations: {
    key: "foundations",
    name: "Foundations",
    icon: "GraduationCap",
    color: "blue",
    papers: [3, 2, 4, 18, 21],
    description: "Start here! Learn RNNs, LSTMs, and the basics",
  },
  transformers: {
    key: "transformers",
    name: "Transformers",
    icon: "Zap",
    color: "purple",
    papers: [14, 13, 6, 8, 9, 22],
    description: "Master attention and the Transformer architecture",
  },
  vision: {
    key: "vision",
    name: "Computer Vision",
    icon: "Target",
    color: "emerald",
    papers: [26, 7, 10, 15, 11, 12],
    description: "Deep dive into CNNs and visual understanding",
  },
  theory: {
    key: "theory",
    name: "Theory & AGI",
    icon: "Brain",
    color: "amber",
    papers: [1, 19, 5, 23, 25, 16, 17, 20, 24],
    description: "Advanced theory, complexity, and AGI concepts",
  },
} as const;

export const CATEGORIES = [
  "Complexity Theory",
  "RNNs",
  "Information Theory",
  "Sequence Models",
  "CNNs",
  "Scaling",
  "GNNs",
  "Transformers",
  "Attention",
  "Reasoning",
  "Generative",
  "Memory Networks",
  "Speech",
  "AGI",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type PathKey = keyof typeof LEARNING_PATHS;
