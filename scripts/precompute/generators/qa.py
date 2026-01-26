"""
Q&A pair generator for papers.

Generates quiz questions at different difficulty levels.
"""
import logging
from typing import Dict, Any, List

from ..llm_client import LLMClient

logger = logging.getLogger(__name__)

QA_SYSTEM_PROMPT = """You are an expert AI educator creating quiz questions.
Generate diverse questions that test understanding at different levels.
Include conceptual, applied, and analytical questions.
Ensure answers are accurate and well-explained."""

QA_PROMPT_TEMPLATE = """Generate {num_questions} quiz questions for this paper.

Paper Title: {title}
Category: {category}

Paper Content:
{content}

Distribution:
- {easy_count} easy questions (basic recall and understanding)
- {medium_count} medium questions (application and analysis)
- {hard_count} hard questions (synthesis and evaluation)

Generate a JSON response:
{{
    "questions": [
        {{
            "id": "q1",
            "question": "The question text",
            "answer": "Detailed correct answer",
            "explanation": "Why this is the correct answer",
            "difficulty": "easy|medium|hard",
            "type": "conceptual|applied|analytical",
            "distractors": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
            "hint": "A helpful hint for struggling learners"
        }}
    ]
}}

Make questions specific to this paper's content and contributions."""


def generate_qa_pairs(
    client: LLMClient,
    paper_id: int,
    title: str,
    category: str,
    content: str,
    num_questions: int = 50,
    difficulty_distribution: Dict[str, float] = None,
) -> Dict[str, Any]:
    """
    Generate Q&A pairs for a paper.

    Args:
        client: LLM client instance
        paper_id: Paper ID
        title: Paper title
        category: Paper category
        content: Full paper content
        num_questions: Number of questions to generate
        difficulty_distribution: Distribution of difficulties

    Returns:
        Dictionary containing Q&A pairs
    """
    logger.info(f"Generating Q&A pairs for paper {paper_id}: {title}")

    if difficulty_distribution is None:
        difficulty_distribution = {"easy": 0.3, "medium": 0.5, "hard": 0.2}

    easy_count = int(num_questions * difficulty_distribution["easy"])
    medium_count = int(num_questions * difficulty_distribution["medium"])
    hard_count = num_questions - easy_count - medium_count

    prompt = QA_PROMPT_TEMPLATE.format(
        title=title,
        category=category,
        content=content[:8000],
        num_questions=num_questions,
        easy_count=easy_count,
        medium_count=medium_count,
        hard_count=hard_count,
    )

    try:
        # Use bulk model for Q&A generation
        result = client.generate_json(
            prompt=prompt,
            system_prompt=QA_SYSTEM_PROMPT,
            temperature=0.7,
            max_tokens=8192,
        )

        if "questions" not in result:
            raise ValueError("Missing questions field")

        result["paper_id"] = paper_id
        result["title"] = title
        result["total_questions"] = len(result["questions"])

        # Add statistics
        result["stats"] = {
            "easy": len([q for q in result["questions"] if q.get("difficulty") == "easy"]),
            "medium": len([q for q in result["questions"] if q.get("difficulty") == "medium"]),
            "hard": len([q for q in result["questions"] if q.get("difficulty") == "hard"]),
        }

        logger.info(f"Generated {len(result['questions'])} Q&A pairs for paper {paper_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to generate Q&A pairs for paper {paper_id}: {e}")
        raise
