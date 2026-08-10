#!/usr/bin/env python3
"""Render the safe public feature index as human-readable Markdown files."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "feature_catalog_manifest.json"
OUTPUT_ROOT = ROOT / "docs" / "features"
INDEX = ROOT / "FEATURES.md"


def load_records() -> list[dict]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records: list[dict] = []
    for chunk_name in manifest["chunks"]:
        records.extend(json.loads((ROOT / "data" / "catalogue" / chunk_name).read_text(encoding="utf-8")))
    return records


def render_record(record: dict, number: int) -> str:
    tags = "، ".join(record.get("capability_tags", []))
    return "\n".join(
        [
            f"### {number}. {record.get('title') or 'ميزة بيئية'}",
            "",
            f"- المعرف: `{record.get('record_key') or record.get('public_record_id')}`",
            f"- المجال: {record.get('domain') or 'البيئة والموارد الطبيعية'}",
            f"- نوع الوظيفة: {record.get('function_type') or 'وظيفة بيئية مؤسسية'}",
            f"- الوصف العام: {record.get('public_description') or ''}",
            f"- القيمة الوظيفية: {record.get('public_value') or ''}",
            f"- تصنيفات القدرة: {tags}",
            "",
        ]
    )


def main() -> None:
    records = load_records()
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    part_size = 50
    part_names = []
    for offset in range(0, len(records), part_size):
        part_number = (offset // part_size) + 1
        name = f"part-{part_number:03d}.md"
        part_names.append(name)
        lines = [
            f"# سجل الميزات العام، الجزء {part_number}",
            "",
            "هذا الجزء يعرض الوصف العام للميزات دون الأكواد أو التفاصيل التنفيذية أو المصادر الداخلية.",
            "",
        ]
        for number, record in enumerate(records[offset : offset + part_size], start=offset + 1):
            lines.append(render_record(record, number))
        (OUTPUT_ROOT / name).write_text("\n".join(lines) + "\n", encoding="utf-8")

    index_lines = [
        "# سجل الميزات العام لمنصة البيئة الذكية",
        "",
        f"يضم هذا السجل الوصفي جميع الميزات العامة للمنصة وعددها {len(records):,} سجلًا. لكل ميزة اسم ومعرف ومجال ونوع وظيفة ووصف عام وقيمة وظيفية وتصنيفات قدرة.",
        "",
        "تم تقسيم السجل إلى أجزاء لسهولة القراءة. لا يتضمن هذا الإصدار الأكواد أو التفاصيل التنفيذية أو مصادر الإثبات الداخلية.",
        "",
        "## أجزاء السجل",
        "",
    ]
    for index, name in enumerate(part_names, start=1):
        start = ((index - 1) * part_size) + 1
        end = min(index * part_size, len(records))
        index_lines.append(f"- [الجزء {index}: الميزات من {start} إلى {end}](docs/features/{name})")
    INDEX.write_text("\n".join(index_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

