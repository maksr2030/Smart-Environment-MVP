#!/usr/bin/env python3
"""Build a safe public feature catalogue from the internal combined register.

The public catalogue keeps descriptive and provenance fields while removing
embedded code samples and fields that can expose private implementation detail.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


PUBLIC_FIELDS = (
    "feature_id",
    "title",
    "english_title",
    "record_type",
    "domain",
    "function_type",
    "record_key",
)

EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
URL_RE = re.compile(r"https?://\S+", re.IGNORECASE)
CODE_MARKERS_RE = re.compile(
    r"(?:كود البرنامج الموسع|كود البرنامج|الكود المدمج|رسالة حفظ الحقوق|code sample).*",
    re.IGNORECASE | re.DOTALL,
)


def sanitize_text(value: object) -> str:
    """Remove embedded code, contact details, and implementation URLs."""
    text = str(value or "")
    text = CODE_MARKERS_RE.split(text, maxsplit=1)[0]
    text = URL_RE.sub("[رابط محذوف من النسخة العامة]", text)
    text = EMAIL_RE.sub("[بريد محذوف من النسخة العامة]", text)
    return " ".join(text.split()).strip()


def build(source: Path, target: Path) -> None:
    payload = json.loads(source.read_text(encoding="utf-8"))
    records = []
    for index, raw in enumerate(payload.get("features", []), start=1):
        record = {field: raw.get(field, "") for field in PUBLIC_FIELDS}
        for field in ("title", "english_title", "domain", "function_type", "record_type"):
            record[field] = sanitize_text(record[field])
        record["public_scope_note"] = "وظيفة بيئية موثقة ضمن نطاق المنصة. التفاصيل التشغيلية ومصادر الإثبات محفوظة خارج الإصدار العام."
        record["public_record_id"] = raw.get("record_key") or f"PUB-{index:04d}"
        records.append(record)

    summary = payload.get("summary", {})
    public_payload = {
        "catalogue_type": "public-descriptive-feature-catalogue",
        "generated_from": "Smart Environment combined documented register",
        "rights_notice": "Descriptive scope only; no production or revenue claim is implied.",
        "summary": {
            "records": len(records),
            "unique_feature_numbers": summary.get("unique_feature_numbers"),
            "minimum_feature_number": summary.get("min_feature_number"),
            "maximum_feature_number": summary.get("max_feature_number"),
            "number_gaps": summary.get("number_gaps", []),
            "redactions": ["descriptive implementation detail", "embedded code", "vendor and device references", "source filenames", "contact details"],
        },
        "features": records,
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(public_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("../outputs/complete_feature_register_data.json"),
    )
    parser.add_argument("--target", type=Path, default=Path("data/feature_catalog.json"))
    args = parser.parse_args()
    build(args.source, args.target)


if __name__ == "__main__":
    main()
