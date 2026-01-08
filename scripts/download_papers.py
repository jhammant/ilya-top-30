#!/usr/bin/env python
"""
Download all papers from Ilya Sutskever's Top 30 reading list.

This script downloads PDFs from arxiv and other sources,
preparing them for ingestion into the knowledge base.
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import aiohttp
import requests

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Papers data file
PAPERS_JSON = project_root / "data" / "papers" / "ilya_top_30.json"
DOWNLOAD_DIR = project_root / "data" / "papers" / "downloads"


def load_papers():
    """Load papers from JSON file."""
    with open(PAPERS_JSON, "r") as f:
        data = json.load(f)
    return data["papers"]


def get_arxiv_pdf_url(arxiv_id: str) -> str:
    """Convert arxiv ID to PDF download URL."""
    # Handle different arxiv ID formats
    # e.g., "1409.2329" or "math/0406077"
    return f"https://arxiv.org/pdf/{arxiv_id}.pdf"


def sanitize_filename(title: str) -> str:
    """Convert title to safe filename."""
    # Remove or replace problematic characters
    safe = re.sub(r'[<>:"/\\|?*]', '', title)
    safe = safe.replace(' ', '_')
    safe = safe[:100]  # Limit length
    return safe


async def download_file(session: aiohttp.ClientSession, url: str, dest: Path) -> bool:
    """Download a file asynchronously."""
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=60)) as response:
            if response.status == 200:
                content = await response.read()
                dest.write_bytes(content)
                return True
            else:
                print(f"  Failed: HTTP {response.status}")
                return False
    except Exception as e:
        print(f"  Error: {e}")
        return False


async def download_paper(session: aiohttp.ClientSession, paper: dict, download_dir: Path) -> dict:
    """Download a single paper."""
    paper_id = paper["id"]
    title = paper["title"]
    url = paper["url"]
    paper_type = paper.get("type", "paper")

    print(f"\n[{paper_id}] {title}")

    # Create filename
    safe_title = sanitize_filename(title)

    # Handle different paper types
    if "arxiv_id" in paper:
        # ArXiv paper - download PDF
        pdf_url = get_arxiv_pdf_url(paper["arxiv_id"])
        dest = download_dir / f"{paper_id:02d}_{safe_title}.pdf"

        if dest.exists():
            print(f"  Already exists: {dest.name}")
            return {"paper": paper, "path": str(dest), "status": "exists"}

        print(f"  Downloading from arxiv: {paper['arxiv_id']}")
        success = await download_file(session, pdf_url, dest)

        if success:
            print(f"  Saved: {dest.name}")
            return {"paper": paper, "path": str(dest), "status": "downloaded"}
        else:
            return {"paper": paper, "path": None, "status": "failed"}

    elif url.endswith(".pdf"):
        # Direct PDF link
        dest = download_dir / f"{paper_id:02d}_{safe_title}.pdf"

        if dest.exists():
            print(f"  Already exists: {dest.name}")
            return {"paper": paper, "path": str(dest), "status": "exists"}

        print(f"  Downloading PDF...")
        success = await download_file(session, url, dest)

        if success:
            print(f"  Saved: {dest.name}")
            return {"paper": paper, "path": str(dest), "status": "downloaded"}
        else:
            return {"paper": paper, "path": None, "status": "failed"}

    elif paper_type in ["blog", "course"]:
        # Blog post or course - save URL for reference
        # These need to be handled differently (web scraping or manual)
        info_file = download_dir / f"{paper_id:02d}_{safe_title}.url"
        info_file.write_text(f"[InternetShortcut]\nURL={url}\n")
        print(f"  Saved URL reference: {info_file.name}")
        print(f"  Note: This is a {paper_type} - visit: {url}")
        return {"paper": paper, "path": str(info_file), "status": "url_saved"}

    else:
        # Unknown type - save URL
        info_file = download_dir / f"{paper_id:02d}_{safe_title}.url"
        info_file.write_text(f"[InternetShortcut]\nURL={url}\n")
        print(f"  Saved URL reference: {info_file.name}")
        return {"paper": paper, "path": str(info_file), "status": "url_saved"}


async def main():
    """Main download function."""
    print("=" * 60)
    print("Ilya's Top 30 Papers Downloader")
    print("=" * 60)

    # Create download directory
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nDownload directory: {DOWNLOAD_DIR}")

    # Load papers
    papers = load_papers()
    print(f"Found {len(papers)} papers to process")

    # Download papers
    results = []
    async with aiohttp.ClientSession() as session:
        for paper in papers:
            result = await download_paper(session, paper, DOWNLOAD_DIR)
            results.append(result)

    # Summary
    print("\n" + "=" * 60)
    print("Download Summary")
    print("=" * 60)

    downloaded = [r for r in results if r["status"] == "downloaded"]
    exists = [r for r in results if r["status"] == "exists"]
    url_saved = [r for r in results if r["status"] == "url_saved"]
    failed = [r for r in results if r["status"] == "failed"]

    print(f"  Downloaded: {len(downloaded)}")
    print(f"  Already existed: {len(exists)}")
    print(f"  URL references saved: {len(url_saved)}")
    print(f"  Failed: {len(failed)}")

    if failed:
        print("\nFailed downloads:")
        for r in failed:
            print(f"  - {r['paper']['title']}")

    # List PDFs ready for knowledge base
    pdfs = list(DOWNLOAD_DIR.glob("*.pdf"))
    print(f"\n{len(pdfs)} PDF files ready for knowledge base ingestion")
    print(f"Location: {DOWNLOAD_DIR}")

    # Save results
    results_file = DOWNLOAD_DIR / "download_results.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {results_file}")

    print("\n" + "=" * 60)
    print("Next steps:")
    print("1. Start the application: python scripts/start_web.py")
    print("2. Go to Knowledge Bases and create a new knowledge base")
    print("3. Upload the PDFs from data/papers/downloads/")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
