const state = {
  catalogue: null,
  filteredFeatures: [],
  page: 1,
  pageSize: 25,
  selectedFeature: null,
};

const demoStations = [
  { name: "ساحل جدة", type: "رصد بحري وجودة مياه", air: 42, water: 68, biodiversity: 74, groundwater: 57, waste: 51, climate: 45 },
  { name: "محمية العلا", type: "حياة فطرية وتنوع أحيائي", air: 31, water: 44, biodiversity: 82, groundwater: 63, waste: 28, climate: 39 },
  { name: "محمية الرياض", type: "غطاء نباتي وتصحر", air: 58, water: 61, biodiversity: 52, groundwater: 71, waste: 46, climate: 64 },
  { name: "الساحل الشرقي", type: "تلوث وانبعاثات", air: 72, water: 76, biodiversity: 49, groundwater: 68, waste: 71, climate: 61 },
  { name: "الربع الخالي", type: "مياه جوفية ومخاطر برية", air: 24, water: 78, biodiversity: 55, groundwater: 83, waste: 21, climate: 69 },
  { name: "المدينة المنورة", type: "غطاء نباتي وإدارة نفايات", air: 46, water: 53, biodiversity: 63, groundwater: 59, waste: 65, climate: 48 },
];

const domainAliases = {
  "الحياة البرية والتنوع الحيوي": "الحياة الفطرية والتنوع الحيوي",
  "الأرصاد والمناخ والانبعاثات": "الهواء والمناخ والانبعاثات",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function uniqueDomains(features) {
  const domains = new Set();
  features.forEach((feature) => {
    String(feature.domain || "").split("؛").map((item) => item.trim()).filter(Boolean).forEach((item) => domains.add(domainAliases[item] || item));
  });
  return [...domains].sort((a, b) => a.localeCompare(b, "ar"));
}

function riskScore(station) {
  return Math.round((station.air * .17) + (station.water * .22) + ((100 - station.biodiversity) * .17) + (station.groundwater * .18) + (station.waste * .12) + (station.climate * .14));
}

function riskClass(score) {
  if (score >= 65) return { className: "risk-high", label: "مرتفع" };
  if (score >= 45) return { className: "risk-medium", label: "متوسط" };
  return { className: "risk-low", label: "منخفض" };
}

function showView(viewName) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initNavigation() {
  $$("[data-view]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
  $$("[data-view-target]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.viewTarget)));
}

function renderOverview() {
  const features = state.catalogue.features;
  const domains = uniqueDomains(features);
  const domainCounts = new Map(domains.map((domain) => [domain, 0]));
  features.forEach((feature) => {
    const normalized = new Set(String(feature.domain || "").split("؛").map((item) => domainAliases[item.trim()] || item.trim()).filter(Boolean));
    normalized.forEach((domain) => domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1));
  });
  const topDomains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = topDomains[0]?.[1] || 1;
  $("#metricRecords").textContent = features.length.toLocaleString("ar-SA");
  $("#metricUnique").textContent = state.catalogue.summary.unique_feature_numbers.toLocaleString("ar-SA");
  $("#metricDomains").textContent = domains.length.toLocaleString("ar-SA");
  $("#domainBars").innerHTML = topDomains.map(([domain, count]) => `<div class="domain-bar-row"><span>${escapeHtml(domain)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, (count / max) * 100)}%"></div></div><b>${count}</b></div>`).join("");
}

function renderMonitoring() {
  const signals = [
    ["جودة الهواء", "air", "%", "الانحراف عن خط الأساس"],
    ["جودة المياه", "water", "%", "مؤشر الضغط البيئي"],
    ["التنوع الأحيائي", "biodiversity", "%", "سلامة النظام البيئي"],
    ["المياه الجوفية", "groundwater", "%", "مؤشر الإجهاد"],
    ["النفايات", "waste", "%", "ضغط المخلفات"],
    ["المناخ", "climate", "%", "مؤشر التعرض"],
  ];
  const station = demoStations[0];
  $("#monitoringGrid").innerHTML = signals.map(([label, key, unit, hint]) => {
    const value = station[key];
    const positive = key === "biodiversity" ? value : 100 - value;
    const risk = riskClass(key === "biodiversity" ? 100 - value : value);
    return `<div class="signal-card"><div class="signal-top"><span class="signal-name">${label}</span><span class="${risk.className}">${risk.label}</span></div><span class="signal-value">${value}<span class="signal-unit"> ${unit}</span></span><div class="signal-meter"><span style="width:${value}%;background:${positive > 60 ? '#078a82' : positive > 35 ? '#c77c1d' : '#b75246'}"></span></div><div class="signal-meta"><span>${hint}</span><span>ساحل جدة</span></div></div>`;
  }).join("");
  $("#regionGrid").innerHTML = demoStations.map((item) => {
    const score = riskScore(item);
    const risk = riskClass(score);
    return `<div class="region-card"><b>${item.name}</b><small>${item.type}</small><div class="region-risk"><span>مؤشر الخطر</span><strong class="${risk.className}">${score} · ${risk.label}</strong></div></div>`;
  }).join("");
}

function updateRangeLabels() {
  [["pollutionInput", "pollutionValue"], ["waterInput", "waterValue"], ["conservationInput", "conservationValue"]].forEach(([input, output]) => { $("#" + output).textContent = `${$("#" + input).value}%`; });
}

function runSimulation() {
  const pollution = Number($("#pollutionInput").value);
  const waterStress = Number($("#waterInput").value);
  const conservation = Number($("#conservationInput").value);
  const base = riskScore(demoStations[0]);
  const pressure = (pollution * .48) + (waterStress * .42);
  const risk = Math.round(clamp(base + pressure - conservation * .38));
  const reversibility = Math.round(clamp(82 - pressure * .55 + conservation * .63));
  const intervention = risk >= 70 ? "فوري" : risk >= 50 ? "مرتفع" : "مراقبة";
  const priority = risk >= 70 ? "أولوية 1" : risk >= 50 ? "أولوية 2" : "أولوية 3";
  const riskInfo = riskClass(risk);
  $("#riskOutput").textContent = risk;
  $("#riskOutput").style.color = risk >= 65 ? "#ffb0a4" : risk >= 45 ? "#ffd38a" : "#8bd3c7";
  $("#riskText").textContent = `مستوى الخطر ${riskInfo.label} وفق معلمات السيناريو الحالية`;
  $("#reversibilityOutput").textContent = `${reversibility}%`;
  $("#interventionOutput").textContent = intervention;
  $("#priorityOutput").textContent = priority;
  $("#simulationStatus").textContent = "تم التشغيل";
  const actions = [];
  if (pollution >= 25) actions.push("تعزيز رصد مصادر التلوث وتحديد نقاط التدخل ذات الأولوية.");
  if (waterStress >= 20) actions.push("رفع أولوية متابعة المياه الجوفية وجودة المياه وتحديث خطط الكفاءة.");
  if (conservation >= 20) actions.push("توجيه تدخلات الاستعادة إلى المواقع ذات قابلية عكس الضرر الأعلى.");
  if (!actions.length) actions.push("استمرار الرصد مع مراجعة المؤشرات قبل اتخاذ تدخل إضافي.");
  $("#simulationActions").innerHTML = `<ul>${actions.map((action) => `<li>${action}</li>`).join("")}</ul>`;
  $("#traceList").innerHTML = [
    ["01", "الإشارة", `تلوث ${pollution}% · مياه ${waterStress}%`],
    ["02", "التحليل", `ضغط مركب ${Math.round(pressure)} نقطة`],
    ["03", "المحاكاة", `قابلية عكس الضرر ${reversibility}%`],
    ["04", "التوصية", `${priority} · تدخل ${intervention}`],
  ].map(([number, title, text]) => `<div class="trace-step"><b>${number} · ${title}</b><small>${text}</small></div>`).join("");
  renderDecisionBrief({ risk, reversibility, intervention, priority, pollution, waterStress, conservation });
}

function renderDecisionBrief(result = {}) {
  const risk = result.risk ?? riskScore(demoStations[0]);
  const riskInfo = riskClass(risk);
  const priority = result.priority || (risk >= 70 ? "أولوية 1" : risk >= 50 ? "أولوية 2" : "أولوية 3");
  $("#decisionBrief").innerHTML = `<div class="brief-header"><div><p class="section-kicker">ENVIRONMENTAL DECISION BRIEF</p><h3>مذكرة قرار بيئي تمثيلية</h3><p>نطاق العرض: ساحل جدة · مصدر الإشارة: بيانات اصطناعية للنموذج الأولي</p></div><span class="${riskInfo.className} status-label">${priority} · خطر ${riskInfo.label}</span></div><div class="brief-grid"><div class="brief-section"><h4>القراءة الحالية</h4><p>تظهر الإشارة التمثيلية ضغطًا مركبًا يحتاج إلى ربط جودة المياه والتلوث والتنوع الأحيائي ضمن مسار قرار واحد.</p></div><div class="brief-section"><h4>التوصية الأولية</h4><ul><li>تعزيز الرصد في نقاط التلوث ذات الأثر الأعلى.</li><li>مقارنة أثر التدخل قبل اعتماده ميدانيًا.</li><li>حفظ القرار ومبرراته ضمن السجل المؤسسي.</li></ul></div><div class="brief-section"><h4>الجهات المستفيدة</h4><p>الجهات البيئية، إدارة المناطق المحمية، فرق الرقابة الميدانية، مراكز الأزمات، والجهات البحثية وصناع القرار.</p></div><div class="brief-section"><h4>حدود الاعتماد</h4><p>المخرجات إرشادية في هذه النسخة. لا يجوز استخدامها كقرار تشغيلي قبل اعتماد مصادر البيانات والنموذج والسلطة النظامية.</p></div></div><div class="brief-trace">سلسلة التتبع: إشارة بيئية ← تحليل مركب ← سيناريو قابل للمراجعة ← توصية موثقة ← قرار بشري مسؤول.</div>`;
}

function populateFilters() {
  const domains = uniqueDomains(state.catalogue.features);
  const types = [...new Set(state.catalogue.features.map((feature) => feature.function_type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar"));
  $("#domainFilter").insertAdjacentHTML("beforeend", domains.map((domain) => `<option value="${escapeHtml(domain)}">${escapeHtml(domain)}</option>`).join(""));
  $("#typeFilter").insertAdjacentHTML("beforeend", types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join(""));
}

function applyFeatureFilters() {
  const search = $("#featureSearch").value.trim().toLocaleLowerCase("ar");
  const domain = $("#domainFilter").value;
  const type = $("#typeFilter").value;
  state.filteredFeatures = state.catalogue.features.filter((feature) => {
    const haystack = [feature.title, feature.english_title, feature.description, feature.objectives, feature.benefits, feature.record_key].join(" ").toLocaleLowerCase("ar");
    const featureDomains = String(feature.domain || "").split("؛").map((item) => domainAliases[item.trim()] || item.trim());
    return (!search || haystack.includes(search)) && (!domain || featureDomains.includes(domain)) && (!type || feature.function_type === type);
  });
  state.page = 1;
  renderFeatureTable();
}

function renderFeatureTable() {
  const totalPages = Math.max(1, Math.ceil(state.filteredFeatures.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const pageFeatures = state.filteredFeatures.slice(start, start + state.pageSize);
  $("#resultCount").textContent = `${state.filteredFeatures.length.toLocaleString("ar-SA")} سجل`;
  $("#pageNumber").textContent = state.page;
  $("#pageTotal").textContent = totalPages;
  $("#prevPage").disabled = state.page <= 1;
  $("#nextPage").disabled = state.page >= totalPages;
  $("#featureTable").innerHTML = pageFeatures.map((feature) => `<tr data-record-id="${escapeHtml(feature.public_record_id)}" class="${state.selectedFeature?.public_record_id === feature.public_record_id ? "selected" : ""}"><td>${escapeHtml(feature.record_key || feature.public_record_id)}</td><td class="feature-title">${escapeHtml(feature.title || "غير مسمى")}</td><td>${escapeHtml(feature.domain || "غير محدد")}</td><td>${escapeHtml(feature.function_type || "غير محدد")}</td><td class="feature-status">${escapeHtml(feature.implementation_status || "موثق وصفيًا")}</td><td>${escapeHtml(feature.source_family || "")}</td></tr>`).join("") || `<tr><td colspan="6">لا توجد سجلات مطابقة.</td></tr>`;
  $$("#featureTable tr[data-record-id]").forEach((row) => row.addEventListener("click", () => { state.selectedFeature = state.filteredFeatures.find((feature) => feature.public_record_id === row.dataset.recordId); renderFeatureTable(); renderFeatureDetail(); }));
}

function renderFeatureDetail() {
  const feature = state.selectedFeature;
  if (!feature) { $("#featureDetail").innerHTML = "<p>اختر سجلًا لعرض تفاصيله.</p>"; return; }
  const fields = [["المعرف المصدر", feature.record_key || feature.public_record_id], ["نوع السجل", feature.record_type], ["نوع الوظيفة", feature.function_type], ["الوصف", feature.description], ["الأهداف", feature.objectives], ["الفوائد", feature.benefits], ["الجمهور المستفيد", feature.audience], ["حالة التوثيق", feature.implementation_status], ["قابلية إعادة الاستخدام", feature.reuse_note], ["مرجع المصدر", feature.source_reference]];
  $("#featureDetail").innerHTML = `<p class="section-kicker">FEATURE RECORD</p><h3 class="detail-title">${escapeHtml(feature.title || "غير مسمى")}</h3><div class="detail-grid">${fields.map(([label, value]) => `<div class="detail-item"><b>${label}</b><span>${escapeHtml(value || "غير متوفر في السجل")}</span></div>`).join("")}</div>`;
}

function initRegistry() {
  populateFilters();
  state.filteredFeatures = state.catalogue.features;
  ["featureSearch", "domainFilter", "typeFilter"].forEach((id) => $("#" + id).addEventListener("input", applyFeatureFilters));
  $("#clearFilters").addEventListener("click", () => { $("#featureSearch").value = ""; $("#domainFilter").value = ""; $("#typeFilter").value = ""; applyFeatureFilters(); });
  $("#prevPage").addEventListener("click", () => { state.page -= 1; renderFeatureTable(); });
  $("#nextPage").addEventListener("click", () => { state.page += 1; renderFeatureTable(); });
  renderFeatureTable();
  $("#catalogStatus").textContent = "السجل جاهز · 1,067 سجلًا";
}

function init() {
  $("#runtimeDate").textContent = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date());
  initNavigation();
  renderMonitoring();
  renderDecisionBrief();
  ["pollutionInput", "waterInput", "conservationInput"].forEach((id) => $("#" + id).addEventListener("input", updateRangeLabels));
  $("#runSimulation").addEventListener("click", runSimulation);
  $("#refreshBrief").addEventListener("click", () => renderDecisionBrief());
  updateRangeLabels();
  fetch("../data/feature_catalog.json")
    .then((response) => { if (!response.ok) throw new Error("catalogue unavailable"); return response.json(); })
    .then((catalogue) => { state.catalogue = catalogue; renderOverview(); initRegistry(); })
    .catch((error) => { $("#catalogStatus").textContent = "تعذر تحميل السجل"; console.error(error); });
}

document.addEventListener("DOMContentLoaded", init);

