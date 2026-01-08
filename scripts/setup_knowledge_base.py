#!/usr/bin/env python
"""
Setup the Ilya's Top 30 Knowledge Base

This script creates a knowledge base pre-loaded with all downloaded papers,
enabling AI-powered Q&A about the papers.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(project_root / ".env")

PAPERS_DIR = project_root / "data" / "papers" / "downloads"
KB_NAME = "ilya-top-30"
KB_BASE_DIR = project_root / "data" / "knowledge_bases"


async def create_knowledge_base():
    """Create and populate the knowledge base."""
    from src.knowledge.manager import KnowledgeBaseManager

    print("=" * 60)
    print("Setting up Ilya's Top 30 Knowledge Base")
    print("=" * 60)

    # Check for PDFs
    pdfs = list(PAPERS_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"\nNo PDFs found in {PAPERS_DIR}")
        print("Run 'python scripts/download_papers.py' first!")
        return

    print(f"\nFound {len(pdfs)} PDFs to process")

    # Initialize manager
    print("\nInitializing knowledge base manager...")
    manager = KnowledgeBaseManager(str(KB_BASE_DIR))

    # Check if KB already exists
    existing_kbs = manager.list_knowledge_bases()
    if KB_NAME in [kb["name"] for kb in existing_kbs]:
        print(f"\nKnowledge base '{KB_NAME}' already exists!")
        response = input("Do you want to delete and recreate it? (y/N): ")
        if response.lower() != 'y':
            print("Keeping existing knowledge base.")
            return
        print(f"Deleting existing knowledge base '{KB_NAME}'...")
        manager.delete_knowledge_base(KB_NAME)

    # Create new KB
    print(f"\nCreating knowledge base '{KB_NAME}'...")
    kb_info = manager.create_knowledge_base(
        name=KB_NAME,
        description="Ilya Sutskever's Top 30 foundational AI papers"
    )
    print(f"Created: {kb_info}")

    # Add documents
    print(f"\nAdding {len(pdfs)} papers to knowledge base...")
    print("This may take a while depending on your LLM speed...\n")

    for i, pdf in enumerate(sorted(pdfs), 1):
        print(f"[{i}/{len(pdfs)}] Processing: {pdf.name}")
        try:
            await manager.add_document(KB_NAME, str(pdf))
            print(f"         ✓ Added successfully")
        except Exception as e:
            print(f"         ✗ Error: {e}")

    print("\n" + "=" * 60)
    print("Knowledge Base Setup Complete!")
    print("=" * 60)
    print(f"\nYou can now use the Smart Solver and other AI features")
    print(f"with the '{KB_NAME}' knowledge base selected.")
    print("\nTo ask questions about the papers:")
    print("1. Go to Smart Solver (/solver)")
    print("2. Select 'ilya-top-30' as your knowledge base")
    print("3. Ask any question about the papers!")


def main():
    """Simple synchronous wrapper."""
    print("\nNote: This requires your LLM (LM Studio/Ollama) to be running!")
    print("Make sure you have a model loaded.\n")

    # Check if LLM is available
    import requests
    try:
        # Try LM Studio first
        response = requests.get("http://localhost:1234/v1/models", timeout=5)
        if response.status_code == 200:
            print("✓ LM Studio detected")
    except:
        try:
            # Try Ollama
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                print("✓ Ollama detected")
        except:
            print("✗ No LLM server detected!")
            print("  Please start LM Studio or Ollama first.")
            return

    asyncio.run(create_knowledge_base())


if __name__ == "__main__":
    main()
