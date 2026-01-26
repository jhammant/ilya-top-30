#!/usr/bin/env python3
"""
Main precomputation pipeline orchestrator.

Generates all precomputed content for the Ilya's Top 30 papers.
"""
import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from .config import (
    PAPERS_METADATA,
    PAPERS_PRECOMPUTED,
    CROSS_PAPER_DIR,
    LEARNING_PATHS,
    ContentConfig,
)
from .llm_client import LLMClient, create_client
from .rag_context import get_paper_content, load_paper_metadata, clean_text
from .generators import (
    generate_summary,
    generate_concepts,
    generate_qa_pairs,
    generate_learning_steps,
    generate_faq,
)
from .validators import (
    validate_summary,
    validate_concepts,
    validate_qa,
    validate_learning,
    validate_faq,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("precompute.log"),
    ],
)
logger = logging.getLogger(__name__)


def save_json(data: dict, filepath: Path) -> None:
    """Save data as JSON file."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved: {filepath}")


def process_paper(
    client: LLMClient,
    paper_id: int,
    content_config: ContentConfig,
    skip_existing: bool = True,
    content_types: Optional[List[str]] = None,
) -> dict:
    """
    Process a single paper and generate all content.

    Args:
        client: LLM client
        paper_id: Paper ID
        content_config: Content configuration
        skip_existing: Skip if content already exists
        content_types: List of content types to generate (None = all)

    Returns:
        Dictionary with generation results
    """
    results = {"paper_id": paper_id, "success": False, "generated": [], "errors": []}

    # Get paper metadata
    if paper_id not in PAPERS_METADATA:
        results["errors"].append(f"Paper {paper_id} not found in metadata")
        return results

    metadata = PAPERS_METADATA[paper_id]
    title = metadata["title"]
    category = metadata["category"]
    content_type = metadata["type"]
    time_estimate = metadata["time"]

    logger.info(f"Processing paper {paper_id}: {title}")

    # Create output directory
    paper_dir = PAPERS_PRECOMPUTED / str(paper_id)
    paper_dir.mkdir(parents=True, exist_ok=True)

    # Get paper content
    content = get_paper_content(paper_id)
    if not content:
        # Use a placeholder for papers without extracted content
        content = f"Title: {title}\nCategory: {category}\nType: {content_type}"
        logger.warning(f"Using placeholder content for paper {paper_id}")
    else:
        content = clean_text(content)

    all_types = ["summary", "concepts", "qa", "learning", "faq"]
    types_to_generate = content_types or all_types

    # Generate each content type
    try:
        # Summary
        if "summary" in types_to_generate:
            summary_path = paper_dir / "summary.json"
            if skip_existing and summary_path.exists():
                logger.info(f"Skipping existing summary for paper {paper_id}")
            else:
                summary = generate_summary(
                    client, paper_id, title, category, content_type, content
                )
                valid, issues = validate_summary(summary)
                if valid:
                    save_json(summary, summary_path)
                    results["generated"].append("summary")
                else:
                    results["errors"].extend([f"summary: {i}" for i in issues])

        # Concepts
        if "concepts" in types_to_generate:
            concepts_path = paper_dir / "concepts.json"
            if skip_existing and concepts_path.exists():
                logger.info(f"Skipping existing concepts for paper {paper_id}")
            else:
                concepts = generate_concepts(
                    client, paper_id, title, category, content,
                    num_concepts=content_config.concepts_per_paper
                )
                valid, issues = validate_concepts(concepts)
                if valid:
                    save_json(concepts, concepts_path)
                    results["generated"].append("concepts")
                else:
                    results["errors"].extend([f"concepts: {i}" for i in issues])

        # Q&A pairs
        if "qa" in types_to_generate:
            qa_path = paper_dir / "qa.json"
            if skip_existing and qa_path.exists():
                logger.info(f"Skipping existing Q&A for paper {paper_id}")
            else:
                qa = generate_qa_pairs(
                    client, paper_id, title, category, content,
                    num_questions=content_config.qa_pairs_per_paper,
                    difficulty_distribution=content_config.difficulty_distribution
                )
                valid, issues = validate_qa(qa)
                if valid:
                    save_json(qa, qa_path)
                    results["generated"].append("qa")
                else:
                    results["errors"].extend([f"qa: {i}" for i in issues])

        # Learning steps
        if "learning" in types_to_generate:
            learning_path = paper_dir / "learning_steps.json"
            if skip_existing and learning_path.exists():
                logger.info(f"Skipping existing learning steps for paper {paper_id}")
            else:
                learning = generate_learning_steps(
                    client, paper_id, title, category, content,
                    time_estimate=time_estimate,
                    num_steps=content_config.learning_steps
                )
                valid, issues = validate_learning(learning)
                if valid:
                    save_json(learning, learning_path)
                    results["generated"].append("learning")
                else:
                    results["errors"].extend([f"learning: {i}" for i in issues])

        # FAQ
        if "faq" in types_to_generate:
            faq_path = paper_dir / "faq.json"
            if skip_existing and faq_path.exists():
                logger.info(f"Skipping existing FAQ for paper {paper_id}")
            else:
                faq = generate_faq(
                    client, paper_id, title, category, content,
                    num_faqs=content_config.faq_per_paper
                )
                valid, issues = validate_faq(faq)
                if valid:
                    save_json(faq, faq_path)
                    results["generated"].append("faq")
                else:
                    results["errors"].extend([f"faq: {i}" for i in issues])

        results["success"] = len(results["errors"]) == 0

    except Exception as e:
        logger.error(f"Error processing paper {paper_id}: {e}")
        results["errors"].append(str(e))

    return results


def generate_cross_paper_content(client: LLMClient) -> None:
    """Generate cross-paper content like knowledge graph and learning paths."""
    logger.info("Generating cross-paper content...")

    # Generate knowledge graph connections
    knowledge_graph = {
        "nodes": [],
        "edges": [],
        "generated_at": datetime.now().isoformat(),
    }

    for paper_id, metadata in PAPERS_METADATA.items():
        knowledge_graph["nodes"].append({
            "id": paper_id,
            "title": metadata["title"],
            "category": metadata["category"],
            "difficulty": metadata["difficulty"],
            "path": metadata["path"],
        })

    # Add edges based on category and learning path relationships
    category_papers = {}
    for paper_id, metadata in PAPERS_METADATA.items():
        cat = metadata["category"]
        if cat not in category_papers:
            category_papers[cat] = []
        category_papers[cat].append(paper_id)

    # Connect papers in same category
    for cat, papers in category_papers.items():
        for i, p1 in enumerate(papers):
            for p2 in papers[i+1:]:
                knowledge_graph["edges"].append({
                    "source": p1,
                    "target": p2,
                    "type": "same_category",
                    "category": cat,
                })

    # Connect papers in same learning path (sequential)
    for path_key, path_data in LEARNING_PATHS.items():
        papers = path_data["papers"]
        for i in range(len(papers) - 1):
            knowledge_graph["edges"].append({
                "source": papers[i],
                "target": papers[i + 1],
                "type": "learning_sequence",
                "path": path_key,
            })

    save_json(knowledge_graph, CROSS_PAPER_DIR / "knowledge_graph.json")

    # Generate learning paths with enhanced metadata
    learning_paths_data = {
        "paths": {},
        "generated_at": datetime.now().isoformat(),
    }

    for path_key, path_data in LEARNING_PATHS.items():
        papers_in_path = []
        total_time = 0
        avg_difficulty = 0

        for paper_id in path_data["papers"]:
            if paper_id in PAPERS_METADATA:
                metadata = PAPERS_METADATA[paper_id]
                papers_in_path.append({
                    "id": paper_id,
                    "title": metadata["title"],
                    "difficulty": metadata["difficulty"],
                    "time": metadata["time"],
                })
                total_time += metadata["time"]
                avg_difficulty += metadata["difficulty"]

        learning_paths_data["paths"][path_key] = {
            "name": path_data["name"],
            "description": path_data["description"],
            "papers": papers_in_path,
            "total_papers": len(papers_in_path),
            "total_time_minutes": total_time,
            "average_difficulty": round(avg_difficulty / len(papers_in_path), 1) if papers_in_path else 0,
        }

    save_json(learning_paths_data, CROSS_PAPER_DIR / "learning_paths.json")

    logger.info("Cross-paper content generated successfully")


def main():
    """Main entry point for precomputation pipeline."""
    parser = argparse.ArgumentParser(
        description="Precompute content for Ilya's Top 30 papers"
    )
    parser.add_argument(
        "--papers",
        type=int,
        nargs="+",
        help="Specific paper IDs to process (default: all)",
    )
    parser.add_argument(
        "--types",
        nargs="+",
        choices=["summary", "concepts", "qa", "learning", "faq"],
        help="Content types to generate (default: all)",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        default=True,
        help="Skip papers with existing content",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force regeneration of all content",
    )
    parser.add_argument(
        "--cross-paper-only",
        action="store_true",
        help="Only generate cross-paper content",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be processed without generating",
    )

    args = parser.parse_args()

    # Configuration
    content_config = ContentConfig()

    # Determine which papers to process
    paper_ids = args.papers or list(PAPERS_METADATA.keys())

    logger.info(f"Precomputation pipeline starting")
    logger.info(f"Papers to process: {len(paper_ids)}")
    logger.info(f"Content types: {args.types or 'all'}")

    if args.dry_run:
        logger.info("DRY RUN - no content will be generated")
        for paper_id in paper_ids:
            if paper_id in PAPERS_METADATA:
                logger.info(f"  Would process: {paper_id} - {PAPERS_METADATA[paper_id]['title']}")
        return

    # Check LLM connection
    logger.info("Checking LLM connection...")
    client = create_client()

    if not client.check_connection():
        logger.error("Cannot connect to LLM API. Make sure LM Studio is running.")
        logger.error("Expected endpoint: http://localhost:1234/v1")
        sys.exit(1)

    logger.info("LLM connection successful")

    # Generate cross-paper content first (doesn't need LLM)
    if args.cross_paper_only:
        generate_cross_paper_content(client)
        return

    # Process each paper
    results = []
    skip_existing = not args.force and args.skip_existing

    with client:
        for paper_id in paper_ids:
            result = process_paper(
                client,
                paper_id,
                content_config,
                skip_existing=skip_existing,
                content_types=args.types,
            )
            results.append(result)

        # Generate cross-paper content
        generate_cross_paper_content(client)

    # Summary
    successful = sum(1 for r in results if r["success"])
    failed = len(results) - successful

    logger.info("=" * 50)
    logger.info(f"Precomputation complete!")
    logger.info(f"Successful: {successful}/{len(results)}")
    logger.info(f"Failed: {failed}/{len(results)}")

    if failed > 0:
        logger.info("Failed papers:")
        for r in results:
            if not r["success"]:
                logger.info(f"  Paper {r['paper_id']}: {r['errors']}")

    # Save run summary
    summary = {
        "run_at": datetime.now().isoformat(),
        "papers_processed": len(results),
        "successful": successful,
        "failed": failed,
        "results": results,
    }
    save_json(summary, CROSS_PAPER_DIR / "run_summary.json")


if __name__ == "__main__":
    main()
