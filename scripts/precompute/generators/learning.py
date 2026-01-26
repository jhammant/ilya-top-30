"""
Learning steps generator for papers.

Generates guided learning sections for each paper.
"""
import logging
from typing import Dict, Any

from ..llm_client import LLMClient

logger = logging.getLogger(__name__)

LEARNING_SYSTEM_PROMPT = """You are an expert AI educator creating structured learning guides.
Break down complex papers into digestible learning steps.
Focus on building understanding progressively.
Include checkpoints and reflection questions."""

LEARNING_PROMPT_TEMPLATE = """Create a structured learning guide for this paper.

Paper Title: {title}
Category: {category}
Estimated Time: {time} minutes

Paper Content:
{content}

Generate a JSON response with {num_steps} learning steps:
{{
    "learning_guide": {{
        "introduction": "Brief overview of what the learner will gain",
        "objectives": ["Learning objective 1", "Learning objective 2", "Learning objective 3"],
        "steps": [
            {{
                "step_number": 1,
                "title": "Step Title",
                "duration_minutes": 15,
                "content": "Detailed explanation in markdown format",
                "key_points": ["Key point 1", "Key point 2"],
                "checkpoint_question": "Question to verify understanding",
                "checkpoint_answer": "Expected answer or key points to cover",
                "tips": ["Helpful tip for this section"]
            }}
        ],
        "summary": "Concise summary of the entire paper",
        "next_steps": ["What to learn next", "Related papers to explore"]
    }}
}}

Steps should cover:
1. Abstract & Motivation - Why does this paper exist?
2. Background & Prerequisites - What do I need to know?
3. Core Methodology - How does it work?
4. Key Results - What did they find?
5. Implications & Applications - Why does it matter?"""


def generate_learning_steps(
    client: LLMClient,
    paper_id: int,
    title: str,
    category: str,
    content: str,
    time_estimate: int,
    num_steps: int = 5,
) -> Dict[str, Any]:
    """
    Generate learning steps for a paper.

    Args:
        client: LLM client instance
        paper_id: Paper ID
        title: Paper title
        category: Paper category
        content: Full paper content
        time_estimate: Estimated reading time in minutes
        num_steps: Number of learning steps

    Returns:
        Dictionary containing learning guide
    """
    logger.info(f"Generating learning steps for paper {paper_id}: {title}")

    prompt = LEARNING_PROMPT_TEMPLATE.format(
        title=title,
        category=category,
        time=time_estimate,
        content=content[:8000],
        num_steps=num_steps,
    )

    try:
        result = client.generate_json(
            prompt=prompt,
            system_prompt=LEARNING_SYSTEM_PROMPT,
            temperature=0.6,
            max_tokens=8192,
        )

        if "learning_guide" not in result:
            raise ValueError("Missing learning_guide field")

        result["paper_id"] = paper_id
        result["title"] = title
        result["total_steps"] = len(result["learning_guide"].get("steps", []))

        logger.info(f"Generated {result['total_steps']} learning steps for paper {paper_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to generate learning steps for paper {paper_id}: {e}")
        raise
