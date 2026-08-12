import json
from pathlib import Path


def load_recovery_records():
    manifest = json.loads(Path("data/historical_recovery_manifest.json").read_text(encoding="utf-8"))
    records = []
    for chunk_name in manifest["chunks"]:
        records.extend(json.loads(Path("data/historical-recovery", chunk_name).read_text(encoding="utf-8")))
    return manifest, records


def test_historical_recovery_manifest_matches_chunks():
    manifest, records = load_recovery_records()
    assert manifest["record_count"] == 256
    assert manifest["summary"]["records"] == 256
    assert len(records) == 256
    assert len(manifest["chunks"]) == 6


def test_historical_recovery_high_water_and_unique_numbers():
    manifest, records = load_recovery_records()
    numeric_ids = {int(record["id"]) for record in records}
    assert manifest["summary"]["maximum_numeric_feature_number"] == 1025
    assert max(numeric_ids) == 1025
    assert len(numeric_ids) == manifest["summary"]["unique_numeric_feature_numbers"] == 233


def test_historical_records_preserve_provenance_and_public_boundary():
    _, records = load_recovery_records()
    allowed_evidence = {"A", "B", "C", "D"}
    required = {"n", "id", "ar", "en", "e", "dt", "b", "d"}
    assert all(required <= set(record) for record in records)
    assert all(record["e"] in allowed_evidence for record in records)
    assert all(record["n"] and record["b"] and record["dt"] for record in records)
    forbidden = {"code", "source_file", "source_reference", "contact", "valuation", "email", "phone"}
    assert all(not (forbidden & set(record)) for record in records)


def test_historical_number_reuse_is_preserved():
    _, records = load_recovery_records()
    variants_897 = [record for record in records if int(record["id"]) == 897]
    variants_899 = [record for record in records if int(record["id"]) == 899]
    variants_649 = [record for record in records if int(record["id"]) == 649]
    assert len(variants_897) >= 3
    assert len(variants_899) >= 2
    assert len(variants_649) >= 2
    assert len({record["b"] for record in variants_897}) >= 3
