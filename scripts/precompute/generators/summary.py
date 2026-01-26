"""
Summary generator for papers.

Generates executive summaries with key insights.
"""
import logging
from typing import Dict, Any

from ..llm_client import LLMClient

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = """You are an expert AI researcher who helps explain complex papers clearly.
Your task is to generate comprehensive but accessible summaries of AI research papers.
Focus on practical insights and real-world applications.
Be accurate and avoid jargon when possible."""

SUMMARY_PROMPT_TEMPLATE = """Generate a comprehensive summary for the following paper.

Paper Title: {title}
Category: {category}
Type: {content_type}

Paper Content:
{content}

Generate a JSON response with the following structure:
{{
    "one_liner": "A single sentence capturing the paper's main contribution",
    "paragraphs": [
        "First paragraph: Overview of the problem and motivation",
        "Second paragraph: Key methodology and approach",
        "Third paragraph: Main results and practical implications"
    ],
    "key_takeaways": [
        "Takeaway 1",
        "Takeaway 2",
        "Takeaway 3",
        "Takeaway 4",
        "Takeaway 5"
    ],
    "eli5": "Explain like I'm 5 - simple analogy for the main idea",
    "prerequisites": ["Required knowledge 1", "Required knowledge 2"],
    "applications": ["Real-world application 1", "Application 2"]
}}"""


def generate_summary(
    client: LLMClient,
    paper_id: int,
    title: str,
    category: str,
    content_type: str,
    content: str,
) -> Dict[str, Any]:
    """
    Generate an executive summary for a paper.

    Args:
        client: LLM client instance
        paper_id: Paper ID
        title: Paper title
        category: Paper category
        content_type: Type of content (paper, blog, course)
        content: Full paper content

    Returns:
        Dictionary containing summary data
    """
    logger.info(f"Generating summary for paper {paper_id}: {title}")

    prompt = SUMMARY_PROMPT_TEMPLATE.format(
        title=title,
        category=category,
        content_type=content_type,
        content=content[:8000],  # Truncate to fit model context window
    )

    try:
        result = client.generate_json(
            prompt=prompt,
            system_prompt=SUMMARY_SYSTEM_PROMPT,
            temperature=0.5,  # Lower temperature for accuracy
        )

        # Validate required fields
        required_fields = ["one_liner", "paragraphs", "key_takeaways", "eli5"]
        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing required field: {field}")

        result["paper_id"] = paper_id
        result["title"] = title
        result["category"] = category

        logger.info(f"Successfully generated summary for paper {paper_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to generate summary for paper {paper_id}: {e}")
        raise
