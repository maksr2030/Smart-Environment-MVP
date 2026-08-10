import json
from pathlib import Path


def test_catalogue_is_complete_and_safe():
    payload = json.loads(Path("data/feature_catalog.json").read_text(encoding="utf-8"))
    assert payload["summary"]["records"] == 1067
    assert len(payload["features"]) == 1067
    assert payload["summary"]["unique_feature_numbers"] == 710
    assert all("code_sample" not in record for record in payload["features"])
    assert all("code" not in record for record in payload["features"])


def test_catalogue_preserves_provenance():
    payload = json.loads(Path("data/feature_catalog.json").read_text(encoding="utf-8"))
    first = payload["features"][0]
    assert first["source_family"]
    assert first["implementation_status"]
    assert first["source_reference"]

