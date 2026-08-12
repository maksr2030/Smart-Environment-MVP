function commandEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function injectCommandCenter() {
  const nav = document.querySelector(".sidebar nav");
  const content = document.querySelector(".content");
  if (!nav || !content || document.querySelector('[data-view="command"]')) return;

  nav.innerHTML = `
    <button class="nav-item active" data-command-anchor="commandTop">مركز القيادة الوطني</button>
    <button class="nav-item" data-command-anchor="evidenceMaturity">الأدلة والنضج</button>
    <button class="nav-item" data-command-anchor="executivePipeline">مسار القرار</button>
    <button class="nav-item" data-command-anchor="publicBoundary">حدود الإثبات</button>
  `;

  const section = document.createElement("section");
  section.className = "view active";
  section.id = "view-command";
  section.innerHTML = `
    <div id="commandTop" class="command-hero command-anchor-target">
      <div class="command-hero-main">
        <div class="command-hero-badges"><span>PUBLIC MVP</span><span>EVIDENCE-LED</span><span>NON-PRODUCTION</span></div>
        <p class="section-kicker">EXECUTIVE NATIONAL COMMAND CENTER</p>
        <h2>مركز القيادة التنفيذي للبيئة والموارد الطبيعية</h2>
        <p>واجهة تنفيذية موحدة تربط السجل الوظيفي، معمارية القدرات الوطنية، المهام التجريبية، المحاكاة، والتتبع المؤسسي ضمن نموذج عام قابل للفحص.</p>
        <div class="command-hero-actions">
          <a class="primary-button command-action-link" href="#evidenceMaturity">فحص مستوى الأدلة</a>
          <a class="secondary-button command-action-link" href="../app/">فتح منصة التشغيل</a>
        </div>
      </div>
      <div class="command-hero-side">
        <div class="command-readiness"><span>حالة النموذج العام</span><strong id="commandStatus">جاري التحميل</strong><small>لا تمثل جاهزية تشغيل حكومي أو اعتماداً إنتاجياً</small></div>
        <div class="command-readiness"><span>وضع الإثبات العام</span><strong id="commandEvidencePosture">--</strong><small id="commandEvidencePostureNote">يتم احتسابه من نموذج النضج المنشور</small></div>
        <div class="command-readiness"><span>المؤشر التجريبي المركب</span><strong id="commandDemoIndex">--</strong><small>محسوب من بيانات اصطناعية منشورة في النموذج فقط</small></div>
      </div>
    </div>

    <div class="command-kpis">
      <div class="command-kpi"><span>السجلات الوظيفية العامة</span><strong id="commandRecordCount">--</strong><small>توثيق وصفي قابل للفحص، وليس عداد تنفيذ</small></div>
      <div class="command-kpi"><span>أرقام الميزات التاريخية الفريدة</span><strong id="commandUniqueCount">--</strong><small>مع حفظ اختلافات السجل التاريخي</small></div>
      <div class="command-kpi"><span>وحدات القدرة الوطنية</span><strong id="commandCapabilityCount">--</strong><small id="commandHorizontalCount">طبقات مشتركة قيد التحميل</small></div>
      <div class="command-kpi"><span>المهام الوظيفية التجريبية</span><strong id="commandMissionCount">--</strong><small>سيناريوهات مترابطة متعددة المجالات</small></div>
    </div>

    <div class="command-grid">
      <article class="panel">
        <div class="panel-heading"><div><p class="section-kicker">STRATEGIC ENVIRONMENTAL POSTURE</p><h3>الصورة التنفيذية التجريبية للأولويات</h3></div><span class="panel-note">مؤشرات اصطناعية وليست قياسات وطنية</span></div>
        <div id="commandPriorityGrid" class="priority-grid"></div>
      </article>
      <article class="panel">
        <div class="panel-heading"><div><p class="section-kicker">MISSION ACTIVATION</p><h3>المهام الجاهزة للعرض</h3></div><span class="panel-note">انتقال مباشر إلى مساحة المهام</span></div>
        <div id="commandMissionList" class="command-mission-list"></div>
      </article>
    </div>

    <article id="evidenceMaturity" class="panel command-section-gap command-anchor-target evidence-panel">
      <div class="panel-heading evidence-heading"><div><p class="section-kicker">EVIDENCE & MATURITY DASHBOARD</p><h3>لوحة الأدلة والنضج</h3><p id="evidencePrinciple" class="evidence-principle"></p></div><span class="panel-note">الفصل بين التوثيق والتنفيذ والمحاكاة والخطة</span></div>
      <div class="maturity-summary">
        <div class="maturity-summary-card status-documented"><span>موثق وصفياً</span><strong id="maturityDocumentedCount">--</strong><small>سجل وظيفي في الكتالوج العام</small></div>
        <div class="maturity-summary-card status-implemented_mvp"><span>منفذ في الـMVP</span><strong id="maturityImplementedCount">--</strong><small>وحدات إثبات برمجية قابلة للفحص</small></div>
        <div class="maturity-summary-card status-synthetic_demo"><span>تجريبي / محاكاة</span><strong id="maturitySyntheticCount">--</strong><small>وحدات تستخدم بيانات أو نماذج اصطناعية</small></div>
        <div class="maturity-summary-card status-planned"><span>مخطط لاحقاً</span><strong id="maturityPlannedCount">--</strong><small>قدرات غير مثبتة في الإصدار العام الحالي</small></div>
      </div>
      <div id="maturityDefinitions" class="maturity-definitions"></div>
      <div class="evidence-toolbar">
        <div><b>مصفوفة وحدات الإثبات</b><small id="evidenceResultCount">--</small></div>
        <div id="evidenceFilters" class="evidence-filters"></div>
      </div>
      <div id="evidenceMatrix" class="evidence-matrix"></div>
    </article>

    <article id="executivePipeline" class="panel command-section-gap command-anchor-target">
      <div class="panel-heading"><div><p class="section-kicker">EXECUTIVE DECISION PIPELINE</p><h3>من الإشارة البيئية إلى القرار والتعلم</h3></div><span class="panel-note">تجريد عام لا يكشف سياسات التنفيذ المحمية</span></div>
      <div id="commandFlow" class="command-flow"></div>
    </article>

    <article id="publicBoundary" class="panel command-section-gap command-anchor-target">
      <div class="panel-heading"><div><p class="section-kicker">PUBLIC EVIDENCE BOUNDARY</p><h3>ما الذي يثبته هذا النموذج؟</h3></div></div>
      <div class="brief-grid">
        <div class="brief-section"><h4>يثبت داخل الإصدار العام</h4><p>وجود سجل وصفي قابل للفحص، معمارية قدرات، مهام عرض مترابطة، محاكاة شفافة، حالات استرداد، نشر عام، واختبارات آلية للمحتوى والمسارات الرئيسية.</p></div>
        <div class="brief-section"><h4>لا يدّعي داخل الإصدار العام</h4><p>لا يدّعي تكاملاً حكومياً حياً، بيانات وطنية فعلية، إيرادات، اعتماد نموذج مخاطر، أو نشر الخوارزميات والعقود وسياسات القرار الخاصة.</p></div>
      </div>
      <p id="commandDisclaimer" class="command-disclaimer"></p>
    </article>
  `;

  content.insertBefore(section, content.firstChild);
  nav.querySelectorAll("[data-command-anchor]").forEach((button) => {
    button.addEventListener("click", () => {
      nav.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${button.dataset.commandAnchor}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

injectCommandCenter();

async function commandLoadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`resource unavailable: ${path}`);
  return response.json();
}

function commandManifestValue(manifest, keys) {
  for (const key of keys) {
    if (manifest[key] !== undefined) return manifest[key];
    if (manifest.summary && manifest.summary[key] !== undefined) return manifest.summary[key];
  }
  return null;
}

function commandOpenMission() {
  window.location.href = "../app/";
}

function evidenceLevelMap(evidence) {
  return new Map((evidence.levels || []).map((level) => [level.id, level]));
}

function evidenceCounts(evidence) {
  return (evidence.evidence_units || []).reduce((counts, unit) => {
    counts[unit.status] = (counts[unit.status] || 0) + 1;
    return counts;
  }, {});
}

function renderEvidenceUnit(unit, levels) {
  const level = levels.get(unit.status) || { ar: unit.status, en: unit.status };
  return `
    <article class="evidence-unit status-${commandEscape(unit.status)}" data-evidence-status="${commandEscape(unit.status)}">
      <div class="evidence-unit-head"><span class="evidence-id">${commandEscape(unit.id)}</span><span class="maturity-chip">${commandEscape(level.ar)}</span></div>
      <h4>${commandEscape(unit.ar)}</h4>
      <small>${commandEscape(unit.en)}</small>
      <div class="evidence-unit-body">
        <p><b>النطاق</b>${commandEscape(unit.scope_ar)}</p>
        <p><b>الإثبات العام</b>${commandEscape(unit.proof_ar)}</p>
        <p><b>حد الاعتماد</b>${commandEscape(unit.boundary_ar)}</p>
      </div>
    </article>
  `;
}

function renderEvidenceDashboard(evidence, records) {
  const levels = evidenceLevelMap(evidence);
  const counts = evidenceCounts(evidence);
  const units = evidence.evidence_units || [];

  document.querySelector("#evidencePrinciple").textContent = evidence.principle_ar;
  document.querySelector("#maturityDocumentedCount").textContent = Number(records || 0).toLocaleString("ar-SA");
  document.querySelector("#maturityImplementedCount").textContent = Number(counts.implemented_mvp || 0).toLocaleString("ar-SA");
  document.querySelector("#maturitySyntheticCount").textContent = Number(counts.synthetic_demo || 0).toLocaleString("ar-SA");
  document.querySelector("#maturityPlannedCount").textContent = Number(counts.planned || 0).toLocaleString("ar-SA");
  document.querySelector("#commandEvidencePosture").textContent = `${Number(counts.implemented_mvp || 0).toLocaleString("ar-SA")} وحدات منفذة`;
  document.querySelector("#commandEvidencePostureNote").textContent = `${Number(counts.synthetic_demo || 0).toLocaleString("ar-SA")} تجريبية · ${Number(counts.planned || 0).toLocaleString("ar-SA")} مخططة`;

  document.querySelector("#maturityDefinitions").innerHTML = (evidence.levels || []).map((level) => `
    <div class="maturity-definition status-${commandEscape(level.id)}"><span class="maturity-dot"></span><div><b>${commandEscape(level.ar)}</b><small>${commandEscape(level.en)}</small><p>${commandEscape(level.definition_ar)}</p></div></div>
  `).join("");

  const filters = [{ id: "all", ar: "الكل" }, ...(evidence.levels || [])];
  const filterHost = document.querySelector("#evidenceFilters");
  const matrix = document.querySelector("#evidenceMatrix");
  const resultCount = document.querySelector("#evidenceResultCount");

  function applyFilter(status) {
    const visible = status === "all" ? units : units.filter((unit) => unit.status === status);
    matrix.innerHTML = visible.map((unit) => renderEvidenceUnit(unit, levels)).join("");
    resultCount.textContent = `${visible.length.toLocaleString("ar-SA")} وحدة إثبات`;
    filterHost.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.status === status));
  }

  filterHost.innerHTML = filters.map((item, index) => `<button type="button" class="evidence-filter ${index === 0 ? "active" : ""}" data-status="${commandEscape(item.id)}">${commandEscape(item.ar)}</button>`).join("");
  filterHost.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.status)));
  applyFilter("all");
}

function renderCommandCenter(config, manifest, architecture, runtime, evidence) {
  const records = commandManifestValue(manifest, ["record_count", "records"]);
  const unique = commandManifestValue(manifest, ["unique_feature_numbers"]);
  const priorities = config.strategic_priorities || [];
  const demoIndex = priorities.length ? Math.round(priorities.reduce((sum, item) => sum + Number(item.score || 0), 0) / priorities.length) : 0;

  document.querySelector("#commandStatus").textContent = "منشور وقابل للفحص";
  document.querySelector("#commandDemoIndex").textContent = `${demoIndex}/100`;
  document.querySelector("#commandRecordCount").textContent = Number(records || 0).toLocaleString("ar-SA");
  document.querySelector("#commandUniqueCount").textContent = Number(unique || 0).toLocaleString("ar-SA");
  document.querySelector("#commandCapabilityCount").textContent = architecture.modules.length.toLocaleString("ar-SA");
  document.querySelector("#commandHorizontalCount").textContent = `${architecture.horizontal_layers.length.toLocaleString("ar-SA")} طبقات أفقية مشتركة`;
  document.querySelector("#commandMissionCount").textContent = runtime.missions.length.toLocaleString("ar-SA");
  document.querySelector("#commandDisclaimer").textContent = config.disclaimer_ar;

  document.querySelector("#commandPriorityGrid").innerHTML = priorities.map((item) => `
    <div class="priority-card">
      <div class="priority-top"><b>${commandEscape(item.ar)}</b><span class="priority-score">${Number(item.score).toLocaleString("ar-SA")}</span></div>
      <p>${commandEscape(item.focus_ar)}</p>
      <div class="priority-meter"><span style="width:${Math.max(0, Math.min(100, Number(item.score)))}%"></span></div>
    </div>
  `).join("");

  const missionList = document.querySelector("#commandMissionList");
  missionList.innerHTML = runtime.missions.map((mission) => `
    <div class="command-mission">
      <b>${commandEscape(mission.ar)}</b>
      <small>${commandEscape(mission.region_ar)} · ${commandEscape(mission.id)}</small>
      <button class="secondary-button" type="button" data-command-mission="${commandEscape(mission.id)}">فتح المهمة</button>
    </div>
  `).join("");
  missionList.querySelectorAll("[data-command-mission]").forEach((button) => button.addEventListener("click", commandOpenMission));

  document.querySelector("#commandFlow").innerHTML = (config.executive_pipeline || []).map((step) => `
    <div class="command-flow-step"><span>0${step.step}</span><b>${commandEscape(step.ar)}</b><small>${commandEscape(step.en)}</small></div>
  `).join("");

  renderEvidenceDashboard(evidence, records);
}

async function initCommandCenter() {
  try {
    const [config, manifest, architecture, runtime, evidence] = await Promise.all([
      commandLoadJson("../data/executive_command_center.json"),
      commandLoadJson("../data/feature_catalog_manifest.json"),
      commandLoadJson("../data/capability_architecture.json"),
      commandLoadJson("../data/mission_runtime.json"),
      commandLoadJson("../data/evidence_maturity.json"),
    ]);
    renderCommandCenter(config, manifest, architecture, runtime, evidence);
  } catch (error) {
    const status = document.querySelector("#commandStatus");
    if (status) status.textContent = "تعذر تحميل المركز";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initCommandCenter);
