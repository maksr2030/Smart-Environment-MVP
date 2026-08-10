#!/usr/bin/env python3
"""Build a safe public feature catalogue from the internal combined register.

The public catalogue keeps descriptive and provenance fields while removing
embedded code samples and fields that can expose private implementation detail.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


PUBLIC_FIELDS = (
    "source_family",
    "source_file",
    "source_reference",
    "feature_id",
    "title",
    "english_title",
    "record_type",
    "domain",
    "function_type",
    "description",
    "objectives",
    "benefits",
    "audience",
    "reuse_note",
    "implementation_status",
    "commercial_role",
    "record_key",
    "comparison_note",
)


def build(source: Path, target: Path) -> None:
    payload = json.loads(source.read_text(encoding="utf-8"))
    records = []
    for index, raw in enumerate(payload.get("features", []), start=1):
        record = {field: raw.get(field, "") for field in PUBLIC_FIELDS}
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
            "source_families": sorted({record["source_family"] for record in records if record["source_family"]}),
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

