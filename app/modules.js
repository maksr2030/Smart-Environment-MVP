function missionEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function injectMissionWorkspace() {
  const nav = document.querySelector(".sidebar nav");
  const content = document.querySelector(".content");
  if (!nav || !content || document.querySelector('[data-view="missions"]')) return;

  const button = document.createElement("button");
  button.className = "nav-item";
  button.dataset.view = "missions";
  button.textContent = "مساحة المهام";
  const simulationButton = nav.querySelector('[data-view="simulation"]');
  nav.insertBefore(button, simulationButton || null);

  const section = document.createElement("section");
  section.className = "view";
  section.id = "view-missions";
  section.innerHTML = `
    <div class="view-heading">
      <div>
        <p class="section-kicker">FUNCTIONAL MISSION WORKSPACE</p>
        <h2>مساحة المهام البيئية التشغيلية</h2>
        <p>تشغيل سيناريوهات عرض تربط الوحدات الوطنية بالسجل الوظيفي ومسار القرار والتتبع.</p>
      </div>
      <span id="missionStatus" class="status-label">جاري تحميل مساحة المهام</span>
    </div>
    <div class="mission-layout">
      <article class="panel mission-control">
        <div class="panel-heading"><div><p class="section-kicker">MISSION INPUT</p><h3>إعداد المهمة</h3></div></div>
        <label class="mission-select-label"><span>المهمة التجريبية</span><select id="missionSelect"></select></label>
        <div id="missionContext" class="mission-context"></div>
        <label class="mission-slider"><span>ضغط الحدث</span><output id="missionPressureValue">0%</output><input id="missionPressure" type="range" min="0" max="100" value="50" /></label>
        <label class="mission-slider"><span>هشاشة البيئة المتأثرة</span><output id="missionVulnerabilityValue">0%</output><input id="missionVulnerability" type="range" min="0" max="100" value="50" /></label>
        <label class="mission-slider"><span>جاهزية التدخل</span><output id="missionReadinessValue">0%</output><input id="missionReadiness" type="range" min="0" max="100" value="50" /></label>
        <button id="runMission" class="primary-button full-button">تشغيل المهمة</button>
        <p id="missionFormula" class="small-note"></p>
      </article>
      <article id="missionRuntimeResult" class="panel mission-runtime-result"><p>اختر مهمة ثم شغّلها لعرض مسار الاستجابة التجريبي.</p></article>
    </div>
  `;

  const simulationView = document.querySelector("#view-simulation");
  content.insertBefore(section, simulationView || null);
}

injectMissionWorkspace();

function missionClamp(value) {
  return Math.max(0, Math.min(100, value));
}

function missionRiskLabel(score) {
  if (score >= 70) return "مرتفع";
  if (score >= 45) return "متوسط";
  return "منخفض";
}

async function missionLoadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`resource unavailable: ${path}`);
  return response.json();
}

async function missionLoadCatalogue() {
  const manifest = await missionLoadJson("../data/feature_catalog_manifest.json");
  const chunks = await Promise.all(manifest.chunks.map((chunk) => missionLoadJson(`../data/catalogue/${chunk}`)));
  return chunks.flat();
}

function missionFeatureMatchesModule(feature, module) {
  const domain = String(feature.domain || "").toLocaleLowerCase("ar");
  return (module.domain_patterns || []).some((pattern) => domain.includes(String(pattern).toLocaleLowerCase("ar")));
}

function missionRelevantFeatures(mission, architecture, features) {
  const modules = architecture.modules.filter((module) => mission.capability_ids.includes(module.id));
  return features.filter((feature) => modules.some((module) => missionFeatureMatchesModule(feature, module)));
}

function missionUpdateSliderLabels() {
  document.querySelector("#missionPressureValue").textContent = `${document.querySelector("#missionPressure").value}%`;
  document.querySelector("#missionVulnerabilityValue").textContent = `${document.querySelector("#missionVulnerability").value}%`;
  document.querySelector("#missionReadinessValue").textContent = `${document.querySelector("#missionReadiness").value}%`;
}

function missionApplyDefaults(mission) {
  document.querySelector("#missionPressure").value = mission.defaults.pressure;
  document.querySelector("#missionVulnerability").value = mission.defaults.vulnerability;
  document.querySelector("#missionReadiness").value = mission.defaults.readiness;
  document.querySelector("#missionContext").innerHTML = `<b>${missionEscape(mission.ar)}</b><small>${missionEscape(mission.region_ar)} · ${missionEscape(mission.en)}</small>`;
  missionUpdateSliderLabels();
}

function renderMissionResult(mission, runtime, architecture, features) {
  const pressure = Number(document.querySelector("#missionPressure").value);
  const vulnerability = Number(document.querySelector("#missionVulnerability").value);
  const readiness = Number(document.querySelector("#missionReadiness").value);
  const f = runtime.formula;
  const risk = Math.round(missionClamp(f.base + pressure * f.pressure_weight + vulnerability * f.vulnerability_weight - readiness * f.readiness_weight));
  const reversibility = Math.round(missionClamp(100 - risk * .55 + readiness * .38));
  const priority = risk >= 70 ? "أولوية 1" : risk >= 45 ? "أولوية 2" : "أولوية 3";
  const relevant = missionRelevantFeatures(mission, architecture, features);
  const participatingModules = architecture.modules.filter((module) => mission.capability_ids.includes(module.id));
  const result = document.querySelector("#missionRuntimeResult");

  result.innerHTML = `
    <div class="mission-runtime-head">
      <div><p class="section-kicker">${missionEscape(mission.id)} · MISSION BRIEF</p><h3>${missionEscape(mission.ar)}</h3><p>${missionEscape(mission.region_ar)} · بيانات اصطناعية للنموذج الأولي</p></div>
      <div class="mission-risk-card"><span>مؤشر المخاطر التجريبي</span><strong>${risk}</strong><small>${missionRiskLabel(risk)} · ${priority}</small></div>
    </div>
    <div class="mission-summary-grid">
      <div><span>الوحدات المشاركة</span><strong>${participatingModules.length.toLocaleString("ar-SA")}</strong></div>
      <div><span>السجلات المرتبطة مباشرة</span><strong>${relevant.length.toLocaleString("ar-SA")}</strong></div>
      <div><span>قابلية عكس الضرر</span><strong>${reversibility}%</strong></div>
      <div><span>جاهزية التدخل</span><strong>${readiness}%</strong></div>
    </div>
    <div class="mission-columns">
      <div class="mission-box"><h4>الإشارات الداخلة</h4><ul>${mission.signals_ar.map((item) => `<li>${missionEscape(item)}</li>`).join("")}</ul></div>
      <div class="mission-box"><h4>الاستجابات المقترحة</h4><ul>${mission.actions_ar.map((item) => `<li>${missionEscape(item)}</li>`).join("")}</ul></div>
    </div>
    <div class="mission-box" style="margin-top:11px"><h4>الوحدات الوطنية المشاركة</h4><div class="mission-module-list">${participatingModules.map((module) => `<span class="mission-module-chip">${missionEscape(module.id)} · ${missionEscape(module.ar)}</span>`).join("")}</div></div>
    <div class="mission-trace">
      <div class="mission-trace-step"><b>01 · إشارة</b><small>ضغط ${pressure}% · هشاشة ${vulnerability}%</small></div>
      <div class="mission-trace-step"><b>02 · تحليل</b><small>${participatingModules.length} وحدات قدرة</small></div>
      <div class="mission-trace-step"><b>03 · محاكاة</b><small>خطر ${risk} · عكس الضرر ${reversibility}%</small></div>
      <div class="mission-trace-step"><b>04 · قرار</b><small>${priority} · جاهزية ${readiness}%</small></div>
    </div>
    <div class="mission-feature-evidence"><div class="panel-heading"><div><p class="section-kicker">FEATURE EVIDENCE</p><h3>عينة من السجلات الداعمة للمهمة</h3></div><span class="panel-note">مطابقة عامة من بيانات المجال</span></div><div class="mission-feature-grid">${relevant.slice(0, 10).map((feature) => `<div class="mission-feature-item"><b>${missionEscape(feature.record_key || feature.public_record_id)}</b><span>${missionEscape(feature.title || "غير مسمى")}</span></div>`).join("")}</div></div>
    <p class="mission-disclaimer">${missionEscape(runtime.disclaimer_ar)}</p>
  `;
}

async function initMissionWorkspace() {
  try {
    const [runtime, architecture, features] = await Promise.all([
      missionLoadJson("../data/mission_runtime.json"),
      missionLoadJson("../data/capability_architecture.json"),
      missionLoadCatalogue(),
    ]);
    const select = document.querySelector("#missionSelect");
    select.innerHTML = runtime.missions.map((mission) => `<option value="${missionEscape(mission.id)}">${missionEscape(mission.ar)}</option>`).join("");
    document.querySelector("#missionFormula").textContent = runtime.formula.description_ar;
    const getMission = () => runtime.missions.find((mission) => mission.id === select.value) || runtime.missions[0];
    select.addEventListener("change", () => missionApplyDefaults(getMission()));
    ["missionPressure", "missionVulnerability", "missionReadiness"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", missionUpdateSliderLabels));
    document.querySelector("#runMission").addEventListener("click", () => renderMissionResult(getMission(), runtime, architecture, features));
    missionApplyDefaults(runtime.missions[0]);
    document.querySelector("#missionStatus").textContent = `جاهزة · ${runtime.missions.length.toLocaleString("ar-SA")} مهام تجريبية`;
  } catch (error) {
    const status = document.querySelector("#missionStatus");
    if (status) status.textContent = "تعذر تحميل مساحة المهام";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initMissionWorkspace);
