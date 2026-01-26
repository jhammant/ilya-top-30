"""
Configuration for LLM precomputation pipeline.

Uses LM Studio for local LLM inference.
"""
from dataclasses import dataclass
from pathlib import Path
import os

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Data directories
DATA_DIR = PROJECT_ROOT / "data"
PAPERS_DIR = DATA_DIR / "papers"
PAPERS_DOWNLOADS = PAPERS_DIR / "downloads"
PRECOMPUTED_DIR = DATA_DIR / "precomputed"
PAPERS_PRECOMPUTED = PRECOMPUTED_DIR / "papers"
CROSS_PAPER_DIR = PRECOMPUTED_DIR / "cross_paper"


@dataclass
class LMStudioConfig:
    """Configuration for LM Studio API."""
    host: str = "http://localhost:1234/v1"
    quality_model: str = "qwen/qwen3-next-80b"  # For summaries, explanations
    bulk_model: str = "qwen/qwen3-next-80b"     # For Q&A generation
    temperature: float = 0.7
    max_tokens: int = 4096
    timeout: int = 600  # seconds (10 minutes for large Q&A generation)


@dataclass
class ContentConfig:
    """Configuration for content generation."""
    # Number of Q&A pairs per paper (reduced from 50 for reliability)
    qa_pairs_per_paper: int = 20

    # Number of FAQ entries per paper (reduced from 50 for reliability)
    faq_per_paper: int = 20

    # Number of key concepts per paper
    concepts_per_paper: int = 15

    # Number of learning steps per paper
    learning_steps: int = 5

    # Difficulty levels for Q&A
    difficulty_levels = ["easy", "medium", "hard"]
    difficulty_distribution = {"easy": 0.3, "medium": 0.5, "hard": 0.2}


# Load environment variables
def get_llm_config() -> LMStudioConfig:
    """Get LLM configuration from environment or defaults."""
    return LMStudioConfig(
        host=os.getenv("LM_STUDIO_HOST", "http://localhost:1234/v1"),
        quality_model=os.getenv("QUALITY_MODEL", "qwen/qwen3-next-80b"),
        bulk_model=os.getenv("BULK_MODEL", "openai/gpt-oss-120b"),
        temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
        max_tokens=int(os.getenv("LLM_MAX_TOKENS", "4096")),
        timeout=int(os.getenv("LLM_TIMEOUT", "600")),  # 10 minutes for large Q&A generation
    )


# Paper metadata with enhanced info
PAPERS_METADATA = {
    1: {"title": "The First Law of Complexodynamics", "type": "blog", "category": "Complexity Theory", "difficulty": 4, "time": 30, "path": "theory"},
    2: {"title": "The Unreasonable Effectiveness of RNNs", "type": "blog", "category": "RNNs", "difficulty": 2, "time": 45, "path": "foundations"},
    3: {"title": "Understanding LSTM Networks", "type": "blog", "category": "RNNs", "difficulty": 2, "time": 30, "path": "foundations"},
    4: {"title": "Recurrent Neural Network Regularization", "type": "paper", "category": "RNNs", "difficulty": 3, "time": 60, "path": "foundations"},
    5: {"title": "Keeping Neural Networks Simple (MDL)", "type": "paper", "category": "Information Theory", "difficulty": 4, "time": 90, "path": "theory"},
    6: {"title": "Pointer Networks", "type": "paper", "category": "Sequence Models", "difficulty": 3, "time": 75, "path": "transformers"},
    7: {"title": "ImageNet Classification (AlexNet)", "type": "paper", "category": "CNNs", "difficulty": 2, "time": 60, "path": "vision"},
    8: {"title": "Order Matters: Seq2Seq for Sets", "type": "paper", "category": "Sequence Models", "difficulty": 3, "time": 60, "path": "transformers"},
    9: {"title": "GPipe: Pipeline Parallelism", "type": "paper", "category": "Scaling", "difficulty": 3, "time": 45, "path": "transformers"},
    10: {"title": "Deep Residual Learning (ResNet)", "type": "paper", "category": "CNNs", "difficulty": 2, "time": 60, "path": "vision"},
    11: {"title": "Dilated Convolutions", "type": "paper", "category": "CNNs", "difficulty": 3, "time": 45, "path": "vision"},
    12: {"title": "Neural Message Passing", "type": "paper", "category": "GNNs", "difficulty": 4, "time": 90, "path": "vision"},
    13: {"title": "Attention Is All You Need", "type": "paper", "category": "Transformers", "difficulty": 3, "time": 120, "path": "transformers"},
    14: {"title": "Neural Machine Translation (Attention)", "type": "paper", "category": "Attention", "difficulty": 3, "time": 90, "path": "transformers"},
    15: {"title": "Identity Mappings in ResNets", "type": "paper", "category": "CNNs", "difficulty": 3, "time": 45, "path": "vision"},
    16: {"title": "Relational Reasoning Networks", "type": "paper", "category": "Reasoning", "difficulty": 3, "time": 60, "path": "theory"},
    17: {"title": "Variational Lossy Autoencoder", "type": "paper", "category": "Generative", "difficulty": 4, "time": 90, "path": "theory"},
    18: {"title": "Relational Recurrent Neural Networks", "type": "paper", "category": "RNNs", "difficulty": 4, "time": 60, "path": "foundations"},
    19: {"title": "The Coffee Automaton", "type": "paper", "category": "Complexity Theory", "difficulty": 5, "time": 120, "path": "theory"},
    20: {"title": "Neural Turing Machines", "type": "paper", "category": "Memory Networks", "difficulty": 4, "time": 90, "path": "theory"},
    21: {"title": "Deep Speech 2", "type": "paper", "category": "Speech", "difficulty": 3, "time": 75, "path": "foundations"},
    22: {"title": "Scaling Laws for Neural LMs", "type": "paper", "category": "Scaling", "difficulty": 3, "time": 90, "path": "transformers"},
    23: {"title": "MDL Principle Tutorial", "type": "paper", "category": "Information Theory", "difficulty": 4, "time": 180, "path": "theory"},
    24: {"title": "Machine Super Intelligence", "type": "paper", "category": "AGI", "difficulty": 4, "time": 240, "path": "theory"},
    25: {"title": "Kolmogorov Complexity", "type": "book", "category": "Information Theory", "difficulty": 5, "time": 600, "path": "theory"},
    26: {"title": "CS231n Course", "type": "course", "category": "CNNs", "difficulty": 2, "time": 1200, "path": "vision"},
}

LEARNING_PATHS = {
    "foundations": {
        "name": "Foundations",
        "papers": [3, 2, 4, 18, 21],
        "description": "Start here! Learn RNNs, LSTMs, and the basics",
    },
    "transformers": {
        "name": "Transformers",
        "papers": [14, 13, 6, 8, 9, 22],
        "description": "Master attention and the Transformer architecture",
    },
    "vision": {
        "name": "Computer Vision",
        "papers": [26, 7, 10, 15, 11, 12],
        "description": "Deep dive into CNNs and visual understanding",
    },
    "theory": {
        "name": "Theory & AGI",
        "papers": [1, 19, 5, 23, 25, 16, 17, 20, 24],
        "description": "Advanced theory, complexity, and AGI concepts",
    },
}
