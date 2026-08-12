import json
from pathlib import Path


def load_records():
    manifest = json.loads(Path("data/feature_catalog_manifest.json").read_text(encoding="utf-8"))
    records = []
    for chunk_name in manifest["chunks"]:
        records.extend(json.loads(Path("data/catalogue", chunk_name).read_text(encoding="utf-8")))
    return manifest, records


def load_architecture():
    return json.loads(Path("data/capability_architecture.json").read_text(encoding="utf-8"))


def direct_matches(record, module):
    domain = str(record.get("domain", "")).lower()
    return any(str(pattern).lower() in domain for pattern in module["domain_patterns"])


def classify(records, architecture):
    module_ids = {module["id"] for module in architecture["modules"]}
    fallback = architecture["fallback_module_id"]
    assert fallback in module_ids
    classified = {}
    direct_count = 0
    fallback_count = 0
    for record in records:
        matches = [module["id"] for module in architecture["modules"] if direct_matches(record, module)]
        if matches:
            direct_count += 1
        else:
            matches = [fallback]
            fallback_count += 1
        classified[record["public_record_id"]] = matches
    return classified, direct_count, fallback_count


def test_capability_architecture_structure():
    architecture = load_architecture()
    assert architecture["architecture_type"] == "public-capability-architecture"
    assert len(architecture["modules"]) == 12
    assert len(architecture["horizontal_layers"]) == 6
    assert len(architecture["operating_flow"]) == 8
    assert len({module["id"] for module in architecture["modules"]}) == 12
    assert all(module["domain_patterns"] for module in architecture["modules"])
    assert all(module["mandate_ar"] for module in architecture["modules"])


def test_all_public_records_are_classifiable():
    manifest, records = load_records()
    architecture = load_architecture()
    classified, direct_count, fallback_count = classify(records, architecture)
    assert len(records) == manifest["record_count"] == 1104
    assert len(classified) == len(records)
    assert all(classified[record["public_record_id"]] for record in records)
    assert direct_count + fallback_count == len(records)
    assert direct_count > 0


def test_architecture_preserves_public_disclosure_boundary():
    architecture = load_architecture()
    forbidden_keys = {"algorithm", "source_file", "source_reference", "integration_secret", "private_evidence", "contact_details"}
    serialized_keys = set()

    def collect(value):
        if isinstance(value, dict):
            serialized_keys.update(value.keys())
            for child in value.values():
                collect(child)
        elif isinstance(value, list):
            for child in value:
                collect(child)

    collect(architecture)
    assert not forbidden_keys.intersection(serialized_keys)
