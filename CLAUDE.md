# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ilya's Top 30** - An AI-powered learning platform focused on Ilya Sutskever's foundational AI papers reading list. Built on top of DeepTutor, this platform helps users learn and understand key papers in deep learning and AI.

## Architecture

- **Backend**: Python 3.12+, FastAPI (port 8001)
- **Frontend**: Next.js 16, React 19, TailwindCSS (port 3782)
- **RAG Engine**: LightRAG for knowledge graph-based retrieval
- **LLM Support**: Dual support for local (LM Studio/Ollama) and cloud (OpenAI) models

### Key Directories

```
src/
├── api/          # FastAPI backend endpoints
├── agents/       # AI agent implementations (solve, research, guide, etc.)
├── knowledge/    # Knowledge base and RAG functionality
├── tools/        # Tools available to agents (web search, code execution, etc.)
└── core/         # Core utilities and configuration

web/
├── app/          # Next.js app router pages
├── components/   # React components
├── context/      # React context providers
└── lib/          # Utility functions and i18n

data/
├── papers/       # Downloaded papers from Ilya's Top 30 list
└── knowledge_bases/  # RAG knowledge bases
```

## Development Commands

### Setup
```bash
# Create Python virtual environment (use Python 3.12)
/opt/homebrew/opt/python@3.12/bin/python3.12 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd web && npm install
```

### Running the Application
```bash
# Start both backend and frontend
source venv/bin/activate
python scripts/start_web.py

# Access:
# - Frontend: http://localhost:3782
# - Backend API: http://localhost:8001/docs
```

### Download Papers
```bash
python scripts/download_papers.py
```

### Key Configuration

Environment variables are in `.env`:
- `LLM_BINDING`: Provider type (openai, ollama)
- `LLM_HOST`: API endpoint (localhost:1234 for LM Studio, localhost:11434 for Ollama)
- `LLM_MODEL`: Model name
- `EMBEDDING_*`: Embedding model configuration (uses Ollama nomic-embed-text by default)

## LLM Configuration

### Local LLM (LM Studio)
```env
LLM_BINDING=openai
LLM_HOST=http://localhost:1234/v1
LLM_MODEL=local-model
LLM_API_KEY=lm-studio
```

### Local LLM (Ollama)
```env
LLM_BINDING=ollama
LLM_HOST=http://localhost:11434/v1/
LLM_MODEL=llama3.2
LLM_API_KEY=ollama
```

### OpenAI
```env
LLM_BINDING=openai
LLM_HOST=https://api.openai.com/v1
LLM_MODEL=gpt-4o
LLM_API_KEY=sk-your-key-here
```

## Testing

Run backend tests:
```bash
pytest tests/
```

Frontend linting:
```bash
cd web && npm run lint
```

## Adding Papers to Knowledge Base

1. Place PDF files in `data/papers/downloads/`
2. Start the application
3. Go to Knowledge Bases section
4. Create a new knowledge base and upload PDFs
5. The system will process and index them for RAG

## Key Files

- `settings.py` - Pydantic settings for LLM/embedding configuration
- `config/main.yaml` - Server ports and feature configuration
- `config/agents.yaml` - Agent-specific configuration
- `.env` - Environment variables (API keys, endpoints)
