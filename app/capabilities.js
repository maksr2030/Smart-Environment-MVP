function capabilityEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function injectCapabilityView() {
  const nav = document.querySelector(".sidebar nav");
  const content = document.querySelector(".content");
  if (!nav || !content || document.querySelector('[data-view="capabilities"]')) return;

  const button = document.createElement("button");
  button.className = "nav-item";
  button.dataset.view = "capabilities";
  button.textContent = "معمارية القدرات";
  const monitoringButton = nav.querySelector('[data-view="monitoring"]');
  nav.insertBefore(button, monitoringButton || null);

  const section = document.createElement("section");
  section.className = "view";
  section.id = "view-capabilities";
  section.innerHTML = `
    <div class="view-heading">
      <div>
        <p class="section-kicker">NATIONAL CAPABILITY ARCHITECTURE</p>
        <h2>معمارية القدرات الوطنية للبيئة</h2>
        <p>تحويل سجل الميزات المستردة والموثقة إلى وحدات تشغيل وطنية مترابطة دون كشف تفاصيل التنفيذ المحمية.</p>
      </div>
      <span id="capabilityStatus" class="status-label">جاري بناء خريطة القدرات</span>
    </div>
    <div class="capability-metrics">
      <div class="capability-metric"><span>وحدات القدرة الوطنية</span><strong id="capabilityModuleCount">--</strong><small>وحدات تشغيل قطاعية ومشتركة</small></div>
      <div class="capability-metric"><span>السجلات المصنفة</span><strong id="capabilityMappedCount">--</strong><small>من الكتالوج العام الحالي</small></div>
      <div class="capability-metric"><span>التطابق المباشر مع قواعد المجال</span><strong id="capabilityDirectCoverage">--</strong><small id="capabilityFallbackText">يتم احتسابها عند التشغيل</small></div>
      <div class="capability-metric"><span>الطبقات الأفقية المشتركة</span><strong id="capabilityHorizontalCount">--</strong><small>قدرات تخدم جميع الوحدات</small></div>
    </div>
    <article class="panel">
      <div class="panel-heading"><div><p class="section-kicker">CAPABILITY SYSTEMS</p><h3>الوحدات الوطنية</h3></div><span class="panel-note">يمكن أن ترتبط الميزة بأكثر من وحدة بحسب مجالها</span></div>
      <div id="capabilityGrid" class="capability-grid"></div>
    </article>
    <article id="capabilityDetail" class="panel capability-detail"><p>اختر وحدة قدرة لعرض نطاقها وعينة من الميزات المرتبطة بها.</p></article>
    <article class="panel capability-section-gap">
      <div class="panel-heading"><div><p class="section-kicker">SHARED HORIZONTAL LAYERS</p><h3>الطبقات المشتركة عبر المنصة</h3></div></div>
      <div id="horizontalLayerGrid" class="horizontal-grid"></div>
    </article>
    <article class="panel capability-section-gap">
      <div class="panel-heading"><div><p class="section-kicker">NATIONAL OPERATING FLOW</p><h3>مسار العمل من الإشارة إلى التعلم المؤسسي</h3></div><span class="panel-note">تجريد عام للنموذج الأولي</span></div>
      <div id="capabilityOperatingFlow" class="operating-flow"></div>
    </article>
    <p class="capability-disclosure">هذه الخريطة تصنيف عام للنموذج الأولي وليست بديلاً عن المعمارية الخاصة الكاملة. الخوارزميات، عقود التكامل، سياسات القرار، تسلسل التنفيذ، وأدلة الإثبات الداخلية غير منشورة هنا.</p>
  `;

  const monitoringView = document.querySelector("#view-monitoring");
  content.insertBefore(section, monitoringView || null);
}

injectCapabilityView();

async function capabilityLoadCatalogue() {
  const manifestResponse = await fetch("../data/feature_catalog_manifest.json");
  if (!manifestResponse.ok) throw new Error("catalogue manifest unavailable");
  const manifest = await manifestResponse.json();
  const chunks = await Promise.all(manifest.chunks.map(async (chunkName) => {
    const response = await fetch(`../data/catalogue/${chunkName}`);
    if (!response.ok) throw new Error(`catalogue chunk unavailable: ${chunkName}`);
    return response.json();
  }));
  return { manifest, features: chunks.flat() };
}

async function capabilityLoadArchitecture() {
  const response = await fetch("../data/capability_architecture.json");
  if (!response.ok) throw new Error("capability architecture unavailable");
  return response.json();
}

function capabilityDirectMatches(feature, module) {
  const domain = String(feature.domain || "").toLocaleLowerCase("ar");
  return (module.domain_patterns || []).some((pattern) => domain.includes(String(pattern).toLocaleLowerCase("ar")));
}

function classifyCapabilityRecords(features, architecture) {
  const byModule = new Map(architecture.modules.map((module) => [module.id, []]));
  const fallbackId = architecture.fallback_module_id;
  let directMapped = 0;
  let fallbackMapped = 0;

  features.forEach((feature) => {
    const matches = architecture.modules.filter((module) => capabilityDirectMatches(feature, module));
    if (matches.length) {
      directMapped += 1;
      matches.forEach((module) => byModule.get(module.id).push(feature));
    } else {
      fallbackMapped += 1;
      byModule.get(fallbackId).push(feature);
    }
  });

  return { byModule, directMapped, fallbackMapped };
}

function renderCapabilityDetail(module, records) {
  const target = document.querySelector("#capabilityDetail");
  if (!target) return;
  const sample = records.slice(0, 8);
  target.innerHTML = `
    <div class="capability-detail-header">
      <div>
        <p class="section-kicker">${capabilityEscape(module.id)} · CAPABILITY PROFILE</p>
        <h3>${capabilityEscape(module.ar)}</h3>
        <p>${capabilityEscape(module.mandate_ar)}</p>
      </div>
      <span class="status-label">${records.length.toLocaleString("ar-SA")} سجل مرتبط</span>
    </div>
    <div class="capability-tag-list">${(module.capability_examples_ar || []).map((item) => `<span class="capability-tag">${capabilityEscape(item)}</span>`).join("")}</div>
    <div class="capability-sample-list">${sample.map((feature) => `<div class="capability-sample"><b>${capabilityEscape(feature.record_key || feature.public_record_id)}</b><span>${capabilityEscape(feature.title || "غير مسمى")}</span></div>`).join("") || '<div class="capability-sample"><span>لا توجد سجلات مرتبطة وفق قواعد التصنيف الحالية.</span></div>'}</div>
  `;
}

function renderCapabilityArchitecture(architecture, catalogue) {
  const { byModule, directMapped, fallbackMapped } = classifyCapabilityRecords(catalogue.features, architecture);
  const total = catalogue.features.length || 1;
  const coverage = Math.round((directMapped / total) * 1000) / 10;

  document.querySelector("#capabilityModuleCount").textContent = architecture.modules.length.toLocaleString("ar-SA");
  document.querySelector("#capabilityMappedCount").textContent = catalogue.features.length.toLocaleString("ar-SA");
  document.querySelector("#capabilityDirectCoverage").textContent = `${coverage}%`;
  document.querySelector("#capabilityFallbackText").textContent = fallbackMapped ? `${fallbackMapped.toLocaleString("ar-SA")} سجل أُسند للطبقة المشتركة كـ fallback معلن` : "لا توجد سجلات احتاجت fallback";
  document.querySelector("#capabilityHorizontalCount").textContent = architecture.horizontal_layers.length.toLocaleString("ar-SA");
  document.querySelector("#capabilityStatus").textContent = `جاهزة · ${catalogue.features.length.toLocaleString("ar-SA")} سجل`;

  const grid = document.querySelector("#capabilityGrid");
  grid.innerHTML = architecture.modules.map((module) => {
    const records = byModule.get(module.id) || [];
    return `<article class="capability-card" data-capability-id="${capabilityEscape(module.id)}">
      <div class="capability-card-top"><span class="capability-id">${capabilityEscape(module.id)}</span><span class="capability-count">${records.length.toLocaleString("ar-SA")}</span></div>
      <h3>${capabilityEscape(module.ar)}</h3>
      <p class="capability-en">${capabilityEscape(module.en)}</p>
      <p class="capability-mandate">${capabilityEscape(module.mandate_ar)}</p>
      <div class="capability-tag-list">${(module.capability_examples_ar || []).slice(0, 3).map((item) => `<span class="capability-tag">${capabilityEscape(item)}</span>`).join("")}</div>
    </article>`;
  }).join("");

  grid.querySelectorAll("[data-capability-id]").forEach((card) => {
    card.addEventListener("click", () => {
      grid.querySelectorAll(".capability-card").forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");
      const module = architecture.modules.find((item) => item.id === card.dataset.capabilityId);
      renderCapabilityDetail(module, byModule.get(module.id) || []);
    });
  });

  document.querySelector("#horizontalLayerGrid").innerHTML = architecture.horizontal_layers.map((layer) => `<div class="horizontal-card"><b>${capabilityEscape(layer.ar)}</b><small>${capabilityEscape(layer.id)} · ${capabilityEscape(layer.en)}</small><p>${capabilityEscape(layer.purpose_ar)}</p></div>`).join("");
  document.querySelector("#capabilityOperatingFlow").innerHTML = architecture.operating_flow.map((step) => `<div class="flow-step"><span>0${step.step}</span><b>${capabilityEscape(step.ar)}</b><small>${capabilityEscape(step.en)}</small></div>`).join("");

  if (architecture.modules[0]) {
    const firstCard = grid.querySelector(".capability-card");
    if (firstCard) firstCard.classList.add("selected");
    renderCapabilityDetail(architecture.modules[0], byModule.get(architecture.modules[0].id) || []);
  }
}

async function initCapabilityArchitecture() {
  try {
    const [architecture, catalogue] = await Promise.all([capabilityLoadArchitecture(), capabilityLoadCatalogue()]);
    renderCapabilityArchitecture(architecture, catalogue);
  } catch (error) {
    const status = document.querySelector("#capabilityStatus");
    if (status) status.textContent = "تعذر تحميل خريطة القدرات";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", initCapabilityArchitecture);
