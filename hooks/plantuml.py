"""PlantUML support for MkDocs Material pages.

This hook keeps PlantUML sources reviewable as Markdown / .puml text while
rendering them with a local PlantUML command at build output time. It never
sends diagram source to a public PlantUML endpoint.
"""

from __future__ import annotations

import html
import os
import re
import shlex
import shutil
import subprocess
from pathlib import Path
from typing import Any

FENCED_PLANTUML_RE = re.compile(r"```plantuml\n(.*?)\n```", re.DOTALL)
PUML_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+\.puml)\.svg\)")
DEFAULT_TIMEOUT_SECONDS = 30


def _plantuml_command() -> list[str] | None:
    """Return the local PlantUML command to use, if one is configured."""

    if command := os.environ.get("PLANTUML_COMMAND"):
        return shlex.split(command)

    if jar_path := os.environ.get("PLANTUML_JAR"):
        return ["java", "-jar", jar_path]

    if executable := shutil.which("plantuml"):
        return [executable]

    return None


def _plantuml_timeout() -> int:
    raw_timeout = os.environ.get("PLANTUML_TIMEOUT", str(DEFAULT_TIMEOUT_SECONDS))
    try:
        return max(1, int(raw_timeout))
    except ValueError:
        return DEFAULT_TIMEOUT_SECONDS


def _strip_xml_preamble(svg: str) -> str:
    """Make PlantUML's SVG output safe to inline in MkDocs-generated HTML."""

    svg = re.sub(r"^\s*<\?xml[^>]*>\s*", "", svg)
    svg = re.sub(r"^\s*<!DOCTYPE[^>]*>\s*", "", svg)
    return svg.strip()


def _render_plantuml_svg(source: str) -> tuple[str | None, str | None]:
    """Render PlantUML to SVG with a local command.

    Returns ``(svg, None)`` on success and ``(None, message)`` when local
    rendering is not available. No network fallback is used, because PlantUML
    sources can contain internal design details.
    """

    command = _plantuml_command()
    if command is None:
        return (
            None,
            "PlantUML local renderer is not configured. Install `plantuml`, "
            "or set PLANTUML_COMMAND / PLANTUML_JAR.",
        )

    try:
        completed = subprocess.run(
            [*command, "-tsvg", "-pipe"],
            input=source,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=_plantuml_timeout(),
        )
    except FileNotFoundError:
        return None, f"PlantUML command was not found: {command[0]}"
    except subprocess.TimeoutExpired:
        return None, "PlantUML local rendering timed out."

    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        return None, f"PlantUML local rendering failed: {detail}"

    svg = _strip_xml_preamble(completed.stdout)
    if not svg.startswith("<svg"):
        return None, "PlantUML local renderer did not return SVG output."

    return svg, None


def _placeholder_svg(markdown_alt: str, message: str, source: str) -> str:
    alt = html.escape(markdown_alt or "PlantUML diagram", quote=True)
    message_text = html.escape(message)
    source_text = html.escape(source[:400])
    if len(source) > 400:
        source_text += "…"

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="960" height="260" viewBox="0 0 960 260" role="img" aria-label="{alt}">
  <rect width="960" height="260" rx="16" fill="#fff7ed" stroke="#fdba74" stroke-width="2" />
  <text x="32" y="48" fill="#9a3412" font-family="sans-serif" font-size="22" font-weight="700">PlantUML diagram was not rendered locally</text>
  <text x="32" y="84" fill="#7c2d12" font-family="monospace" font-size="15">{message_text}</text>
  <foreignObject x="32" y="112" width="896" height="116">
    <pre xmlns="http://www.w3.org/1999/xhtml" style="margin:0;white-space:pre-wrap;font:13px monospace;color:#431407;">{source_text}</pre>
  </foreignObject>
</svg>"""


def _figure(markdown_alt: str, source: str) -> str:
    alt = html.escape(markdown_alt or "PlantUML diagram", quote=True)
    svg, error = _render_plantuml_svg(source)
    if svg is None:
        svg = _placeholder_svg(markdown_alt, error or "PlantUML local rendering failed.", source)

    return (
        f'<figure class="plantuml-card">\n'
        f"  {svg}\n"
        f"  <figcaption>{alt}</figcaption>\n"
        f"</figure>"
    )


def on_page_markdown(markdown: str, page: Any, config: Any, files: Any) -> str:
    """Render PlantUML fences and .puml.svg image references as SVG figures."""

    source_dir = Path(page.file.abs_src_path).parent

    def replace_fence(match: re.Match[str]) -> str:
        return _figure("PlantUML diagram", match.group(1))

    def replace_puml_image(match: re.Match[str]) -> str:
        alt, puml_href = match.groups()
        puml_path = (source_dir / puml_href).resolve()
        try:
            source = puml_path.read_text(encoding="utf-8")
        except FileNotFoundError:
            return match.group(0)
        return _figure(alt, source)

    markdown = FENCED_PLANTUML_RE.sub(replace_fence, markdown)
    return PUML_IMAGE_RE.sub(replace_puml_image, markdown)
