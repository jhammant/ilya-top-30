"""
RAG Context Extractor for papers.

Extracts content from PDFs and blog posts for LLM processing.
"""
import json
import logging
from pathlib import Path
from typing import Optional
import re

# Try to import PDF extraction libraries
try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

from .config import PAPERS_DOWNLOADS, PAPERS_DIR

logger = logging.getLogger(__name__)


def get_paper_filename(paper_id: int) -> Optional[Path]:
    """Get the filename for a paper by ID."""
    # Look for files starting with the paper ID
    pattern = f"{paper_id:02d}_*"
    matches = list(PAPERS_DOWNLOADS.glob(pattern))

    if not matches:
        logger.warning(f"No file found for paper {paper_id}")
        return None

    return matches[0]


def extract_pdf_content(pdf_path: Path) -> str:
    """Extract text content from a PDF file."""
    if HAS_PDFPLUMBER:
        try:
            text_parts = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            return "\n\n".join(text_parts)
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}, trying PyPDF2")

    if HAS_PYPDF2:
        try:
            text_parts = []
            with open(pdf_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            return "\n\n".join(text_parts)
        except Exception as e:
            logger.error(f"PyPDF2 failed: {e}")

    logger.error(f"No PDF extraction library available for {pdf_path}")
    return ""


def extract_url_content(url_path: Path) -> str:
    """Extract URL from .url file and fetch content."""
    try:
        with open(url_path, 'r') as f:
            content = f.read()

        # Extract URL from .url file format
        url = None
        for line in content.split('\n'):
            if line.startswith('URL='):
                url = line[4:].strip()
                break

        if not url:
            logger.warning(f"No URL found in {url_path}")
            return ""

        # For now, return placeholder - actual web scraping would need additional libraries
        return f"[Web content from: {url}]\n\nNote: Full content extraction requires web scraping."

    except Exception as e:
        logger.error(f"Failed to read URL file {url_path}: {e}")
        return ""


def get_paper_content(paper_id: int) -> str:
    """
    Get the content for a paper.

    Args:
        paper_id: Paper ID

    Returns:
        Paper content as string
    """
    filepath = get_paper_filename(paper_id)

    if not filepath:
        return ""

    if filepath.suffix == '.pdf':
        return extract_pdf_content(filepath)
    elif filepath.suffix == '.url':
        return extract_url_content(filepath)
    else:
        logger.warning(f"Unknown file type: {filepath.suffix}")
        return ""


def load_paper_metadata() -> dict:
    """Load paper metadata from JSON file."""
    metadata_path = PAPERS_DIR / "ilya_top_30.json"

    try:
        with open(metadata_path, 'r') as f:
            data = json.load(f)
        return {p["id"]: p for p in data["papers"]}
    except Exception as e:
        logger.error(f"Failed to load paper metadata: {e}")
        return {}


def clean_text(text: str) -> str:
    """Clean extracted text for LLM processing."""
    # Remove null bytes and control characters (except newline, tab, carriage return)
    text = ''.join(c for c in text if c >= ' ' or c in '\n\r\t')

    # Remove private use area characters (U+E000 to U+F8FF)
    text = re.sub(r'[\uE000-\uF8FF]', '', text)

    # Replace problematic Unicode characters with ASCII equivalents
    replacements = {
        '"': '"', '"': '"', ''': "'", ''': "'",
        '—': '-', '–': '-', '−': '-',
        '→': '->', '←': '<-',
        '×': 'x', '÷': '/',
        '…': '...',
        '\u00a0': ' ',  # Non-breaking space
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Remove remaining non-ASCII characters that might cause issues
    # Keep only basic printable ASCII and common extended chars
    text = ''.join(c if ord(c) < 128 or c in 'àáâãäåèéêëìíîïòóôõöùúûüýÿñçß' else ' ' for c in text)

    # Remove excessive whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
