import json
from pathlib import Path


def load_chunked_records():
    manifest = json.loads(Path("data/feature_catalog_manifest.json").read_text(encoding="utf-8"))
    records = []
    for chunk_name in manifest["chunks"]:
        records.extend(json.loads(Path("data/catalogue", chunk_name).read_text(encoding="utf-8")))
    return manifest, records


def test_catalogue_is_complete_and_safe():
    manifest, records = load_chunked_records()
    assert manifest["record_count"] == 1104
    assert len(records) == 1104
    assert manifest["summary"]["unique_feature_numbers"] == 745
    assert manifest["summary"]["maximum_feature_number"] == 1002
    assert all("description" not in record for record in records)
    assert all("source_file" not in record for record in records)
    assert all("source_reference" not in record for record in records)
    assert all(record["public_description"] for record in records)
    assert all(record["public_value"] for record in records)
    assert all(record["capability_tags"] for record in records)


def test_catalogue_preserves_provenance():
    _, records = load_chunked_records()
    first = records[0]
    assert first["public_record_id"]
    assert first["public_scope_note"]
    assert first["title"]


def test_chunked_public_catalogue_is_complete():
    manifest, records = load_chunked_records()
    assert len(records) == manifest["record_count"] == 1104
    assert len({record["public_record_id"] for record in records}) == 1104


def test_recovered_delta_is_preserved_without_forced_number_merge():
    manifest, records = load_chunked_records()
    recovered = [record for record in records if record.get("source_family") == "Historical recovery"]
    assert manifest["summary"]["recovered_delta_records"] == 37
    assert manifest["summary"]["recovered_delta_unique_feature_numbers"] == 35
    assert len(recovered) == 37
    assert len({record["feature_id"] for record in recovered}) == 35
    assert min(record["feature_id"] for record in recovered) == 837
    assert max(record["feature_id"] for record in recovered) == 1002
    assert {record["public_record_id"] for record in recovered if record["feature_id"] == 897} == {"REC-897-C1", "REC-897-C2"}
    assert {record["public_record_id"] for record in recovered if record["feature_id"] == 899} == {"REC-899-C1", "REC-899-C2"}
