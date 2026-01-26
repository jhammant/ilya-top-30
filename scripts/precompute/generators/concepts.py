"""
Concepts generator for papers.

Extracts and explains key concepts from papers.
"""
import logging
from typing import Dict, Any, List

from ..llm_client import LLMClient

logger = logging.getLogger(__name__)

CONCEPTS_SYSTEM_PROMPT = """You are an expert AI educator who explains complex concepts clearly.
Extract and explain key concepts from AI research papers.
Provide clear definitions, intuitive examples, and connections to other concepts."""

CONCEPTS_PROMPT_TEMPLATE = """Extract the key concepts from this paper and provide detailed explanations.

Paper Title: {title}
Category: {category}

Paper Content:
{content}

Generate a JSON response with exactly {num_concepts} concepts:
{{
    "concepts": [
        {{
            "name": "Concept Name",
            "definition": "Clear, precise definition",
            "intuition": "Intuitive explanation with analogy",
            "importance": "Why this concept matters",
            "related_concepts": ["Related concept 1", "Related concept 2"],
            "example": "Concrete example or use case",
            "difficulty": "beginner|intermediate|advanced"
        }}
    ]
}}

Order concepts from most fundamental to most advanced."""


def generate_concepts(
    client: LLMClient,
    paper_id: int,
    title: str,
    category: str,
    content: str,
    num_concepts: int = 15,
) -> Dict[str, Any]:
    """
    Generate key concepts for a paper.

    Args:
        client: LLM client instance
        paper_id: Paper ID
        title: Paper title
        category: Paper category
        content: Full paper content
        num_concepts: Number of concepts to extract

    Returns:
        Dictionary containing concepts data
    """
    logger.info(f"Generating concepts for paper {paper_id}: {title}")

    prompt = CONCEPTS_PROMPT_TEMPLATE.format(
        title=title,
        category=category,
        content=content[:8000],
        num_concepts=num_concepts,
    )

    try:
        result = client.generate_json(
            prompt=prompt,
            system_prompt=CONCEPTS_SYSTEM_PROMPT,
            temperature=0.5,
        )

        # Validate
        if "concepts" not in result:
            raise ValueError("Missing concepts field")

        result["paper_id"] = paper_id
        result["title"] = title

        logger.info(f"Generated {len(result['concepts'])} concepts for paper {paper_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to generate concepts for paper {paper_id}: {e}")
        raise
