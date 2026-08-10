import json
from pathlib import Path


def test_catalogue_is_complete_and_safe():
    payload = json.loads(Path("data/feature_catalog.json").read_text(encoding="utf-8"))
    assert payload["summary"]["records"] == 1067
    assert len(payload["features"]) == 1067
    assert payload["summary"]["unique_feature_numbers"] == 710
    assert all("description" not in record for record in payload["features"])
    assert all("source_file" not in record for record in payload["features"])
    assert all("source_reference" not in record for record in payload["features"])


def test_catalogue_preserves_provenance():
    payload = json.loads(Path("data/feature_catalog.json").read_text(encoding="utf-8"))
    first = payload["features"][0]
    assert first["public_record_id"]
    assert first["public_scope_note"]
    assert first["title"]
