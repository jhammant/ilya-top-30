"""
FAQ generator for papers.

Pre-generates answers to frequently asked questions.
"""
import logging
from typing import Dict, Any

from ..llm_client import LLMClient

logger = logging.getLogger(__name__)

FAQ_SYSTEM_PROMPT = """You are an expert AI researcher who answers student questions clearly.
Anticipate common questions about this paper and provide thorough, accessible answers.
Focus on clarifying complex ideas and common misconceptions."""

FAQ_PROMPT_TEMPLATE = """Generate a comprehensive FAQ for this paper.

Paper Title: {title}
Category: {category}

Paper Content:
{content}

Generate {num_faqs} frequently asked questions covering:
- Basic understanding questions
- Implementation questions
- Comparison questions (how does this relate to other work?)
- Practical application questions
- Edge cases and limitations

JSON format:
{{
    "faqs": [
        {{
            "id": "faq1",
            "category": "understanding|implementation|comparison|application|limitations",
            "question": "Common question about the paper",
            "answer": "Clear, comprehensive answer",
            "related_concepts": ["Related concept 1"],
            "follow_up": "A natural follow-up question to explore further"
        }}
    ]
}}"""


def generate_faq(
    client: LLMClient,
    paper_id: int,
    title: str,
    category: str,
    content: str,
    num_faqs: int = 50,
) -> Dict[str, Any]:
    """
    Generate FAQ entries for a paper.

    Args:
        client: LLM client instance
        paper_id: Paper ID
        title: Paper title
        category: Paper category
        content: Full paper content
        num_faqs: Number of FAQ entries

    Returns:
        Dictionary containing FAQ data
    """
    logger.info(f"Generating FAQ for paper {paper_id}: {title}")

    prompt = FAQ_PROMPT_TEMPLATE.format(
        title=title,
        category=category,
        content=content[:8000],
        num_faqs=num_faqs,
    )

    try:
        result = client.generate_json(
            prompt=prompt,
            system_prompt=FAQ_SYSTEM_PROMPT,
            temperature=0.6,
            max_tokens=8192,
        )

        if "faqs" not in result:
            raise ValueError("Missing faqs field")

        result["paper_id"] = paper_id
        result["title"] = title
        result["total_faqs"] = len(result["faqs"])

        # Add category statistics
        categories = {}
        for faq in result["faqs"]:
            cat = faq.get("category", "other")
            categories[cat] = categories.get(cat, 0) + 1
        result["category_stats"] = categories

        logger.info(f"Generated {len(result['faqs'])} FAQs for paper {paper_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to generate FAQ for paper {paper_id}: {e}")
        raise
