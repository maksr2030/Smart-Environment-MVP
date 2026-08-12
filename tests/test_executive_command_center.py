import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def test_command_center_public_model():
    data = load_json("data/executive_command_center.json")
    assert data["data_classification"] == "synthetic_public_demo"
    assert len(data["strategic_priorities"]) >= 6
    assert len(data["executive_pipeline"]) == 8
    assert "اصطناعية" in data["disclaimer_ar"]
    assert "حكومية" in data["disclaimer_ar"]
    for priority in data["strategic_priorities"]:
        assert 0 <= priority["score"] <= 100
        assert priority["ar"] and priority["en"] and priority["focus_ar"]


def test_public_entry_routes_to_command_center():
    root_index = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "./command/" in root_index
    assert "./app/" not in root_index


def test_command_center_surface_dependencies():
    command = (ROOT / "command/index.html").read_text(encoding="utf-8")
    assert "../app/styles.css" in command
    assert "../app/command-center.css" in command
    assert "../app/command-center.js" in command
    assert "../app/" in command
    assert "بيانات حكومية" in command


def test_command_center_runtime_uses_verified_project_counts():
    runtime = (ROOT / "app/command-center.js").read_text(encoding="utf-8")
    for resource in [
        "../data/feature_catalog_manifest.json",
        "../data/capability_architecture.json",
        "../data/mission_runtime.json",
        "../data/executive_command_center.json",
    ]:
        assert resource in runtime
    assert "commandRecordCount" in runtime
    assert "commandUniqueCount" in runtime
    assert "commandCapabilityCount" in runtime
    assert "commandMissionCount" in runtime


def test_pages_workflow_is_restricted_to_main_for_push_deployments():
    workflow = (ROOT / ".github/workflows/pages-deploy.yml").read_text(encoding="utf-8")
    assert "branches:" in workflow and "- main" in workflow
    assert "pages: write" in workflow
    assert "id-token: write" in workflow
    assert "actions/configure-pages@v5" in workflow
    assert "actions/upload-pages-artifact@v4" in workflow
    assert "actions/deploy-pages@v4" in workflow
