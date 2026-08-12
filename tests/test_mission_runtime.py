import json
from pathlib import Path


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def test_mission_runtime_structure():
    runtime = load_json("data/mission_runtime.json")
    architecture = load_json("data/capability_architecture.json")
    module_ids = {module["id"] for module in architecture["modules"]}
    assert runtime["runtime_type"] == "public-synthetic-mission-workspace"
    assert len(runtime["missions"]) == 6
    assert len({mission["id"] for mission in runtime["missions"]}) == 6
    assert runtime["formula"]["base"] == 20
    assert runtime["formula"]["pressure_weight"] > 0
    assert runtime["formula"]["vulnerability_weight"] > 0
    assert runtime["formula"]["readiness_weight"] > 0
    for mission in runtime["missions"]:
        assert mission["capability_ids"]
        assert set(mission["capability_ids"]).issubset(module_ids)
        assert mission["signals_ar"]
        assert mission["actions_ar"]
        assert set(mission["defaults"]) == {"pressure", "vulnerability", "readiness"}
        assert all(0 <= mission["defaults"][key] <= 100 for key in mission["defaults"])


def test_mission_formula_is_bounded_for_defaults():
    runtime = load_json("data/mission_runtime.json")
    f = runtime["formula"]
    for mission in runtime["missions"]:
        d = mission["defaults"]
        raw = f["base"] + d["pressure"] * f["pressure_weight"] + d["vulnerability"] * f["vulnerability_weight"] - d["readiness"] * f["readiness_weight"]
        bounded = max(0, min(100, raw))
        assert 0 <= bounded <= 100


def test_runtime_disclaimer_is_explicit():
    runtime = load_json("data/mission_runtime.json")
    disclaimer = runtime["disclaimer_ar"]
    assert "اصطناعية" in disclaimer
    assert "لا تمثل بيانات حكومية" in disclaimer
    assert "قراراً تشغيلياً" in disclaimer
