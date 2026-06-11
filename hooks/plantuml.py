"""PlantUML support for MkDocs Material pages.

This hook keeps PlantUML sources reviewable as Markdown / .puml text while
rendering them through the public PlantUML SVG endpoint at build output time.
"""

from __future__ import annotations

import html
import re
import zlib
from pathlib import Path
from typing import Any

PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
PLANTUML_SERVER = "https://www.plantuml.com/plantuml/svg"
FENCED_PLANTUML_RE = re.compile(r"```plantuml\n(.*?)\n```", re.DOTALL)
PUML_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+\.puml)\.svg\)")


def _encode_6bit(value: int) -> str:
    return PLANTUML_ALPHABET[value & 0x3F]


def _append_3_bytes(b1: int, b2: int, b3: int) -> str:
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return "".join(_encode_6bit(value) for value in (c1, c2, c3, c4))


def _encode_plantuml(source: str) -> str:
    compressed = zlib.compress(source.encode("utf-8"))[2:-4]
    encoded = []
    for index in range(0, len(compressed), 3):
        chunk = compressed[index : index + 3]
        if len(chunk) == 1:
            encoded.append(_append_3_bytes(chunk[0], 0, 0))
        elif len(chunk) == 2:
            encoded.append(_append_3_bytes(chunk[0], chunk[1], 0))
        else:
            encoded.append(_append_3_bytes(chunk[0], chunk[1], chunk[2]))
    return "".join(encoded)


def _plantuml_url(source: str) -> str:
    return f"{PLANTUML_SERVER}/{_encode_plantuml(source)}"


def _figure(markdown_alt: str, source: str) -> str:
    alt = html.escape(markdown_alt or "PlantUML diagram", quote=True)
    return (
        f'<figure class="plantuml-card">\n'
        f'  <img src="{_plantuml_url(source)}" alt="{alt}" />\n'
        f'  <figcaption>{alt}</figcaption>\n'
        f'</figure>'
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
