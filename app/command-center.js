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

  const button = document.createElement("button");
  button.className = "nav-item active";
  button.dataset.view = "command";
  button.textContent = "مركز القيادة الوطني";
  nav.insertBefore(button, nav.firstChild);

  document.querySelectorAll(".nav-item").forEach((item) => {
    if (item !== button) item.classList.remove("active");
  });
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));

  const section = document.createElement("section");
  section.className = "view active";
  section.id = "view-command";
  section.innerHTML = `
    <div class="command-hero">
      <div class="command-hero-main">
        <p class="section-kicker">EXECUTIVE NATIONAL COMMAND CENTER</p>
        <h2>مركز القيادة التنفيذي للبيئة والموارد الطبيعية</h2>
        <p>واجهة تنفيذية موحدة تربط السجل الوظيفي، معمارية القدرات الوطنية، المهام التجريبية، المحاكاة، والتتبع المؤسسي ضمن نموذج عام قابل للفحص.</p>
      </div>
      <div class="command-hero-side">
        <div class="command-readiness"><span>حالة النموذج العام</span><strong id="commandStatus">جاري التحميل</strong><small>لا تمثل جاهزية تشغيل حكومي أو اعتماداً إنتاجياً</small></div>
        <div class="command-readiness"><span>المؤشر التجريبي المركب</span><strong id="commandDemoIndex">--</strong><small>محسوب من بيانات اصطناعية منشورة في النموذج فقط</small></div>
      </div>
    </div>

    <div class="command-kpis">
      <div class="command-kpi"><span>السجلات الوظيفية العامة</span><strong id="commandRecordCount">--</strong><small>من الكتالوج الموثق الحالي</small></div>
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

    <article class="panel command-section-gap">
      <div class="panel-heading"><div><p class="section-kicker">EXECUTIVE DECISION PIPELINE</p><h3>من الإشارة البيئية إلى القرار والتعلم</h3></div><span class="panel-note">تجريد عام لا يكشف سياسات التنفيذ المحمية</span></div>
      <div id="commandFlow" class="command-flow"></div>
    </article>

    <article class="panel command-section-gap">
      <div class="panel-heading"><div><p class="section-kicker">PUBLIC EVIDENCE BOUNDARY</p><h3>ما الذي يثبته هذا النموذج؟</h3></div></div>
      <div class="brief-grid">
        <div class="brief-section"><h4>يثبت داخل الإصدار العام</h4><p>وجود سجل وصفي قابل للفحص، معمارية قدرات، مهام عرض مترابطة، محاكاة شفافة، حالات استرداد، واختبارات آلية للمحتوى العام.</p></div>
        <div class="brief-section"><h4>لا يدّعي داخل الإصدار العام</h4><p>لا يدّعي تكاملاً حكومياً حياً، بيانات وطنية فعلية، إيرادات، اعتماد نموذج مخاطر، أو نشر الخوارزميات والعقود وسياسات القرار الخاصة.</p></div>
      </div>
      <p id="commandDisclaimer" class="command-disclaimer"></p>
    </article>
  `;

  const overview = document.querySelector("#view-overview");
  content.insertBefore(section, overview || content.firstChild);
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

function commandOpenMission(missionId) {
  if (typeof showView === "function") showView("missions");
  const select = document.querySelector("#missionSelect");
  if (select && Array.from(select.options).some((option) => option.value === missionId)) {
    select.value = missionId;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function renderCommandCenter(config, manifest, architecture, runtime) {
  const records = commandManifestValue(manifest, ["record_count", "records"]);
  const unique = commandManifestValue(manifest, ["unique_feature_numbers"]);
  const priorities = config.strategic_priorities || [];
  const demoIndex = priorities.length ? Math.round(priorities.reduce((sum, item) => sum + Number(item.score || 0), 0) / priorities.length) : 0;

  document.querySelector("#commandStatus").textContent = "جاهز للعرض";
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
  missionList.querySelectorAll("[data-command-mission]").forEach((button) => button.addEventListener("click", () => commandOpenMission(button.dataset.commandMission)));

  document.querySelector("#commandFlow").innerHTML = (config.executive_pipeline || []).map((step) => `
    <div class="command-flow-step"><span>0${step.step}</span><b>${commandEscape(step.ar)}</b><small>${commandEscape(step.en)}</small></div>
  `).join("");
}

async function initCommandCenter() {
  try {
    const [config, manifest, architecture, runtime] = await Promise.all([
      commandLoadJson("../data/executive_command_center.json"),
      commandLoadJson("../data/feature_catalog_manifest.json"),
      commandLoadJson("../data/capability_architecture.json"),
      commandLoadJson("../data/mission_runtime.json"),
    ]);
    renderCommandCenter(config, manifest, architecture, runtime);
  } catch (error) {
    const status = document.querySelector("#commandStatus");
    if (status) status.textContent = "تعذر تحميل المركز";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initCommandCenter);
