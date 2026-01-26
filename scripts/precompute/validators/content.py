"""
Content validators for precomputed data.

Validates structure and quality of generated content.
"""
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)


def validate_summary(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate summary content.

    Returns:
        Tuple of (is_valid, list of issues)
    """
    issues = []

    required_fields = ["one_liner", "paragraphs", "key_takeaways", "eli5"]
    for field in required_fields:
        if field not in data:
            issues.append(f"Missing required field: {field}")

    if "paragraphs" in data:
        if len(data["paragraphs"]) < 2:
            issues.append("Summary should have at least 2 paragraphs")

    if "key_takeaways" in data:
        if len(data["key_takeaways"]) < 3:
            issues.append("Should have at least 3 key takeaways")

    if "one_liner" in data:
        if len(data["one_liner"]) < 20:
            issues.append("One-liner is too short")
        if len(data["one_liner"]) > 400:
            issues.append("One-liner is too long")

    return len(issues) == 0, issues


def validate_concepts(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate concepts content."""
    issues = []

    if "concepts" not in data:
        issues.append("Missing concepts field")
        return False, issues

    concepts = data["concepts"]
    if len(concepts) < 5:
        issues.append(f"Too few concepts: {len(concepts)}, expected at least 5")

    for i, concept in enumerate(concepts):
        required = ["name", "definition", "intuition"]
        for field in required:
            if field not in concept:
                issues.append(f"Concept {i+1} missing {field}")

        if "definition" in concept and len(concept["definition"]) < 20:
            issues.append(f"Concept {i+1} definition too short")

    return len(issues) == 0, issues


def validate_qa(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate Q&A content."""
    issues = []

    if "questions" not in data:
        issues.append("Missing questions field")
        return False, issues

    questions = data["questions"]
    if len(questions) < 10:
        issues.append(f"Too few questions: {len(questions)}, expected at least 10")

    difficulties = {"easy": 0, "medium": 0, "hard": 0}
    for i, q in enumerate(questions):
        required = ["question", "answer", "difficulty"]
        for field in required:
            if field not in q:
                issues.append(f"Question {i+1} missing {field}")

        if "difficulty" in q:
            diff = q["difficulty"]
            if diff in difficulties:
                difficulties[diff] += 1
            else:
                issues.append(f"Question {i+1} has invalid difficulty: {diff}")

    # Check difficulty distribution
    total = sum(difficulties.values())
    if total > 0:
        if difficulties["easy"] / total < 0.1:
            issues.append("Too few easy questions")
        if difficulties["hard"] / total > 0.4:
            issues.append("Too many hard questions")

    return len(issues) == 0, issues


def validate_learning(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate learning steps content."""
    issues = []

    if "learning_guide" not in data:
        issues.append("Missing learning_guide field")
        return False, issues

    guide = data["learning_guide"]

    if "steps" not in guide:
        issues.append("Missing steps in learning guide")
        return False, issues

    steps = guide["steps"]
    if len(steps) < 3:
        issues.append(f"Too few steps: {len(steps)}, expected at least 3")

    for i, step in enumerate(steps):
        required = ["title", "content"]
        for field in required:
            if field not in step:
                issues.append(f"Step {i+1} missing {field}")

        if "content" in step and len(step["content"]) < 100:
            issues.append(f"Step {i+1} content too short")

    return len(issues) == 0, issues


def validate_faq(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate FAQ content."""
    issues = []

    if "faqs" not in data:
        issues.append("Missing faqs field")
        return False, issues

    faqs = data["faqs"]
    if len(faqs) < 10:
        issues.append(f"Too few FAQs: {len(faqs)}, expected at least 10")

    for i, faq in enumerate(faqs):
        required = ["question", "answer"]
        for field in required:
            if field not in faq:
                issues.append(f"FAQ {i+1} missing {field}")

        if "answer" in faq and len(faq["answer"]) < 50:
            issues.append(f"FAQ {i+1} answer too short")

    return len(issues) == 0, issues
