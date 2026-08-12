import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def test_maturity_model_has_exact_public_levels():
    data = load_json("data/evidence_maturity.json")
    assert data["classification"] == "public_mvp_evidence_model"
    levels = {level["id"] for level in data["levels"]}
    assert levels == {"documented", "implemented_mvp", "synthetic_demo", "planned"}
    assert "لا يُستخدم عدد الميزات الموثقة" in data["principle_ar"]


def test_evidence_units_have_explicit_scope_proof_and_boundary():
    data = load_json("data/evidence_maturity.json")
    allowed = {level["id"] for level in data["levels"]}
    units = data["evidence_units"]
    assert len(units) >= 12
    assert len({unit["id"] for unit in units}) == len(units)
    for unit in units:
        assert unit["status"] in allowed
        assert unit["ar"] and unit["en"]
        assert unit["scope_ar"] and unit["proof_ar"] and unit["boundary_ar"]


def test_implemented_and_synthetic_are_not_conflated():
    data = load_json("data/evidence_maturity.json")
    units = data["evidence_units"]
    implemented = [unit for unit in units if unit["status"] == "implemented_mvp"]
    synthetic = [unit for unit in units if unit["status"] == "synthetic_demo"]
    planned = [unit for unit in units if unit["status"] == "planned"]
    assert len(implemented) >= 5
    assert len(synthetic) >= 4
    assert len(planned) >= 4
    assert all("اصطنا" in unit["boundary_ar"] or "معتمد" in unit["boundary_ar"] or "حقيق" in unit["boundary_ar"] for unit in synthetic)
    assert all("غير" in unit["proof_ar"] or "خارج" in unit["proof_ar"] for unit in planned)


def test_command_center_loads_and_renders_maturity_model():
    runtime = (ROOT / "app/command-center.js").read_text(encoding="utf-8")
    assert "../data/evidence_maturity.json" in runtime
    for marker in [
        "maturityDocumentedCount",
        "maturityImplementedCount",
        "maturitySyntheticCount",
        "maturityPlannedCount",
        "evidenceMatrix",
        "evidenceFilters",
    ]:
        assert marker in runtime
    assert "renderEvidenceDashboard" in runtime


def test_documented_count_comes_from_catalogue_manifest_not_evidence_unit_count():
    runtime = (ROOT / "app/command-center.js").read_text(encoding="utf-8")
    assert 'renderEvidenceDashboard(evidence, records)' in runtime
    assert 'maturityDocumentedCount' in runtime
    assert 'Number(records || 0)' in runtime
