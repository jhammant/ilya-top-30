"""
LLM Client for precomputation pipeline.

Supports LM Studio and OpenAI-compatible APIs.
"""
import json
import logging
from typing import Optional, Any
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import get_llm_config, LMStudioConfig

logger = logging.getLogger(__name__)


class LLMClient:
    """Client for interacting with LM Studio or OpenAI-compatible APIs."""

    def __init__(self, config: Optional[LMStudioConfig] = None):
        self.config = config or get_llm_config()
        # Use explicit timeout configuration for all phases
        timeout = httpx.Timeout(
            timeout=float(self.config.timeout),  # Total timeout
            connect=30.0,  # Connection timeout
        )
        self.client = httpx.Client(timeout=timeout)
        logger.info(f"LLM client initialized with {self.config.timeout}s timeout")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=10, max=120))
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False,
    ) -> str:
        """
        Generate text from the LLM.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            model: Model to use (defaults to quality_model)
            temperature: Temperature for generation
            max_tokens: Max tokens to generate
            json_mode: If True, request JSON output

        Returns:
            Generated text
        """
        model = model or self.config.quality_model
        temperature = temperature if temperature is not None else self.config.temperature
        max_tokens = max_tokens or self.config.max_tokens

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = self.client.post(
                f"{self.config.host}/chat/completions",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during LLM request: {e}")
            raise
        except (KeyError, IndexError) as e:
            logger.error(f"Unexpected response format: {e}")
            raise

    def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Any:
        """
        Generate JSON output from the LLM.

        Args:
            prompt: User prompt (should request JSON output)
            system_prompt: Optional system prompt
            model: Model to use
            temperature: Temperature for generation
            max_tokens: Max tokens to generate

        Returns:
            Parsed JSON object
        """
        import re

        # Add JSON instruction to system prompt
        json_system = (system_prompt or "") + "\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, just the JSON object."

        response = self.generate(
            prompt=prompt,
            system_prompt=json_system.strip(),
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=False,  # Don't use response_format - not all APIs support it
        )

        def fix_json(json_str: str) -> str:
            """Attempt to fix common JSON issues."""
            # Remove trailing commas before } or ]
            json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
            # Fix missing commas between elements (basic heuristic)
            json_str = re.sub(r'"\s*\n\s*"', '",\n"', json_str)
            json_str = re.sub(r'}\s*\n\s*{', '},\n{', json_str)
            json_str = re.sub(r']\s*\n\s*"', '],\n"', json_str)
            return json_str

        def try_parse(json_str: str) -> Any:
            """Try to parse JSON with optional fixing."""
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                # Try fixing common issues
                fixed = fix_json(json_str)
                return json.loads(fixed)

        # Try to parse JSON from response
        try:
            # First try direct parsing
            return try_parse(response.strip())
        except json.JSONDecodeError as e:
            logger.warning(f"Direct JSON parse failed: {e}")

            # Try to extract JSON from markdown code blocks
            json_str = None
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()

            if json_str:
                try:
                    return try_parse(json_str)
                except json.JSONDecodeError as e:
                    logger.warning(f"Code block JSON parse failed: {e}")

            # Try to find JSON object in response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                try:
                    return try_parse(json_str)
                except json.JSONDecodeError as e:
                    logger.error(f"All JSON parse attempts failed: {e}")
                    # Log a snippet of the problematic JSON
                    logger.error(f"JSON snippet (chars {max(0, e.pos-50)}-{e.pos+50}): {json_str[max(0, e.pos-50):e.pos+50]}")
            raise

    def generate_bulk(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generate text using the bulk model (faster, for large-scale generation).

        Uses the bulk_model configuration for Q&A generation and similar tasks.
        """
        return self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.config.bulk_model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    def check_connection(self) -> bool:
        """Check if the LLM API is accessible."""
        try:
            response = self.client.get(f"{self.config.host}/models")
            return response.status_code == 200
        except httpx.HTTPError:
            return False


def create_client() -> LLMClient:
    """Create and return an LLM client instance."""
    return LLMClient()
