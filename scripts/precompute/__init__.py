"""
Precomputation pipeline for Ilya's Top 30 papers.

This package generates all precomputed content for the PWA and iOS app,
including summaries, concepts, Q&A pairs, learning steps, and FAQs.

Usage:
    python -m scripts.precompute.main [options]

Options:
    --papers 1 2 3      Process specific paper IDs
    --types summary qa  Generate specific content types
    --force             Regenerate all content
    --dry-run           Show what would be processed
"""

from .config import (
    PAPERS_METADATA,
    LEARNING_PATHS,
    PRECOMPUTED_DIR,
    get_llm_config,
)
from .llm_client import LLMClient, create_client
from .rag_context import get_paper_content, load_paper_metadata

__all__ = [
    "PAPERS_METADATA",
    "LEARNING_PATHS",
    "PRECOMPUTED_DIR",
    "get_llm_config",
    "LLMClient",
    "create_client",
    "get_paper_content",
    "load_paper_metadata",
]
