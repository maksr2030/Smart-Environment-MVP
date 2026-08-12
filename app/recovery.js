(() => {
  const evidenceLabels = {
    A: "A · مسترد مباشرة",
    B: "B · مسترد جزئياً",
    C: "C · وجود/تسلسل مثبت",
    D: "D · مرجع ثانوي",
  };
  const recovery = { records: [], filtered: [], page: 1, pageSize: 25, manifest: null, selected: null };
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const h = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function injectStyles() {
    if (q("#historicalRecoveryStyles")) return;
    const style = document.createElement("style");
    style.id = "historicalRecoveryStyles";
    style.textContent = `
      .recovery-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:18px}
      .recovery-summary .metric-card strong{font-size:25px}
      .recovery-filter{display:grid;grid-template-columns:minmax(220px,2fr) minmax(150px,1fr) minmax(180px,1fr) auto;gap:12px;align-items:end;margin-bottom:14px}
      .recovery-filter label{display:grid;gap:4px;color:var(--muted);font-size:10px}
      .recovery-filter input,.recovery-filter select{height:39px;padding:8px 10px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--text);font:inherit;font-size:12px}
      .recovery-filter input:focus,.recovery-filter select:focus{outline:0;border-color:var(--teal);box-shadow:0 0 0 3px rgba(7,138,130,.1)}
      .evidence-chip{display:inline-flex;padding:4px 8px;border-radius:99px;background:#eef8f5;color:var(--teal);font-weight:700;white-space:nowrap}
      .recovery-warning{padding:12px 14px;border:1px solid #e7d7b8;border-radius:9px;background:#fff9ee;color:#74531b;font-size:11px;margin-bottom:14px}
      .recovery-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,.8fr);gap:14px}
      .recovery-detail{position:sticky;top:16px;align-self:start;max-height:76vh;overflow:auto}
      .recovery-detail h3{color:var(--navy);font-size:18px}
      .recovery-detail-item{padding:10px 0;border-bottom:1px solid var(--line)}
      .recovery-detail-item b,.recovery-detail-item span{display:block}
      .recovery-detail-item b{font-size:10px;color:var(--teal);margin-bottom:2px}.recovery-detail-item span{font-size:11px;color:var(--muted)}
      .recovery-table td:nth-child(1),.recovery-table td:nth-child(2){white-space:nowrap}
      @media(max-width:900px){.recovery-summary{grid-template-columns:repeat(2,1fr)}.recovery-filter{grid-template-columns:1fr 1fr}.recovery-grid{grid-template-columns:1fr}.recovery-detail{position:static;max-height:none}}
      @media(max-width:620px){.recovery-summary,.recovery-filter{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function injectShell() {
    injectStyles();
    const nav = q(".sidebar nav");
    if (nav && !q('[data-view="recovery"]')) {
      nav.insertAdjacentHTML("beforeend", '<button class="nav-item" data-view="recovery">السجل التاريخي المسترد</button>');
    }
    const content = q(".content");
    if (content && !q("#view-recovery")) {
      content.insertAdjacentHTML("beforeend", `
        <section class="view" id="view-recovery">
          <div class="view-heading"><div><p class="section-kicker">HISTORICAL RECOVERY REGISTRY</p><h2>السجل التاريخي المسترد</h2><p>طبقة مستقلة مستردة من محادثات التطوير التاريخية، مع حفظ الرقم والتاريخ والفرع ودرجة الإثبات.</p></div><span id="recoveryStatus" class="status-label">جاري تحميل السجل</span></div>
          <div class="recovery-warning">هذا السجل يوثق الأثر التاريخي للميزات المستردة، ولا يعني أن كل رقم يمثل ميزة مستقلة نهائية؛ بعض الأرقام أُعيد استخدامها تاريخياً في فروع مختلفة. ولا يثبت السجل وحده التشغيل الإنتاجي أو التكامل الحكومي أو الإيرادات.</div>
          <div class="recovery-summary" id="recoverySummary">
            <div class="metric-card"><span class="metric-label">السجلات التاريخية</span><strong id="recoveryRecords">—</strong><span class="metric-foot">سجلات مستردة حالياً</span></div>
            <div class="metric-card"><span class="metric-label">الأرقام الرقمية الفريدة</span><strong id="recoveryUnique">—</strong><span class="metric-foot">مع حفظ الفروع المتعارضة</span></div>
            <div class="metric-card"><span class="metric-label">أعلى رقم مسترد</span><strong id="recoveryHighWater">—</strong><span class="metric-foot">حد تاريخي مثبت في هذه النسخة</span></div>
            <div class="metric-card"><span class="metric-label">فروع الاسترداد</span><strong id="recoveryBranches">—</strong><span class="metric-foot">التاريخ + الفرع + الرقم</span></div>
          </div>
          <div class="panel recovery-filter">
            <label><span>بحث</span><input id="recoverySearch" type="search" placeholder="رقم، عنوان، فرع، مجال..." /></label>
            <label><span>درجة الإثبات</span><select id="recoveryEvidence"><option value="">كل الدرجات</option><option value="A">A · مباشر</option><option value="B">B · جزئي</option><option value="C">C · وجود/تسلسل</option><option value="D">D · ثانوي</option></select></label>
            <label><span>المجال</span><select id="recoveryDomain"><option value="">كل المجالات</option></select></label>
            <button id="recoveryClear" class="secondary-button">مسح التصفية</button>
          </div>
          <div class="registry-meta"><span id="recoveryResultCount">0 سجل</span><span>الصفحة <b id="recoveryPage">1</b> من <b id="recoveryPages">1</b></span><div class="pagination"><button id="recoveryPrev" class="icon-button">السابق</button><button id="recoveryNext" class="icon-button">التالي</button></div></div>
          <div class="recovery-grid">
            <div class="table-wrap panel"><table class="recovery-table"><thead><tr><th>الرقم</th><th>درجة الإثبات</th><th>اسم الميزة</th><th>المجال</th><th>التاريخ</th><th>الفرع</th></tr></thead><tbody id="recoveryTable"></tbody></table></div>
            <article id="recoveryDetail" class="panel recovery-detail"><p>اختر سجلاً لعرض تفاصيله التاريخية.</p></article>
          </div>
        </section>`);
    }
  }

  function domains() {
    const set = new Set();
    recovery.records.forEach((r) => String(r.d || "").split("؛").map((x) => x.trim()).filter(Boolean).forEach((x) => set.add(x)));
    return [...set].sort((a,b) => a.localeCompare(b,"ar"));
  }

  function apply() {
    const text = (q("#recoverySearch")?.value || "").trim().toLocaleLowerCase("ar");
    const evidence = q("#recoveryEvidence")?.value || "";
    const domain = q("#recoveryDomain")?.value || "";
    recovery.filtered = recovery.records.filter((r) => {
      const hay = [r.n,r.id,r.ar,r.en,r.dt,r.b,r.d].join(" ").toLocaleLowerCase("ar");
      const ds = String(r.d || "").split("؛").map((x) => x.trim());
      return (!text || hay.includes(text)) && (!evidence || r.e === evidence) && (!domain || ds.includes(domain));
    });
    recovery.page = 1;
    renderTable();
  }

  function renderTable() {
    const pages = Math.max(1, Math.ceil(recovery.filtered.length / recovery.pageSize));
    recovery.page = Math.max(1, Math.min(recovery.page, pages));
    const start = (recovery.page - 1) * recovery.pageSize;
    const rows = recovery.filtered.slice(start, start + recovery.pageSize);
    q("#recoveryResultCount").textContent = `${recovery.filtered.length.toLocaleString("ar-SA")} سجل`;
    q("#recoveryPage").textContent = recovery.page;
    q("#recoveryPages").textContent = pages;
    q("#recoveryPrev").disabled = recovery.page <= 1;
    q("#recoveryNext").disabled = recovery.page >= pages;
    q("#recoveryTable").innerHTML = rows.map((r) => `<tr data-recovery-key="${h(r._k)}" class="${recovery.selected?._k === r._k ? "selected" : ""}"><td>${h(r.n)}</td><td><span class="evidence-chip">${h(r.e)}</span></td><td class="feature-title">${h(r.ar || r.en || "العنوان غير مسترد")}</td><td>${h(r.d || "غير مصنف")}</td><td>${h(r.dt || "غير مكتمل")}</td><td>${h(r.b || "غير محدد")}</td></tr>`).join("") || '<tr><td colspan="6">لا توجد سجلات مطابقة.</td></tr>';
    qa("#recoveryTable tr[data-recovery-key]").forEach((row) => row.addEventListener("click", () => {
      recovery.selected = recovery.records.find((r) => r._k === row.dataset.recoveryKey);
      renderTable();
      renderDetail();
    }));
  }

  function renderDetail() {
    const r = recovery.selected;
    if (!r) { q("#recoveryDetail").innerHTML = "<p>اختر سجلاً لعرض تفاصيله التاريخية.</p>"; return; }
    const fields = [
      ["الرقم التاريخي", r.n], ["الرقم الرقمي", r.id], ["درجة الإثبات", evidenceLabels[r.e] || r.e],
      ["العنوان الإنجليزي", r.en], ["المجال", r.d], ["التاريخ/الوقت", r.dt], ["فرع الاسترداد", r.b],
      ["حدود الإثبات", r.e === "A" ? "نص/عنوان مسترد مباشرة من المحادثة التاريخية." : r.e === "B" ? "استرداد تاريخي جزئي أو مباشر يحتاج استكمالاً." : r.e === "C" ? "وجود الرقم أو تسلسله مثبت، والعنوان الكامل غير مسترد." : "مرجع استرداد ثانوي بانتظار تأكيد أقوى من المحادثة الأصلية."],
    ];
    q("#recoveryDetail").innerHTML = `<p class="section-kicker">HISTORICAL FEATURE PROFILE</p><h3>${h(r.ar || r.en || "العنوان غير مسترد")}</h3>${fields.map(([a,b]) => `<div class="recovery-detail-item"><b>${h(a)}</b><span>${h(b || "غير متوفر")}</span></div>`).join("")}`;
  }

  function renderOverviewMetrics() {
    if (!recovery.manifest) return;
    const s = recovery.manifest.summary;
    const metrics = q("#overviewMetrics");
    if (metrics && !q("#historicalMetric")) {
      metrics.insertAdjacentHTML("beforeend", `<div class="metric-card"><span class="metric-label">السجل التاريخي المسترد</span><strong id="historicalMetric">${Number(s.records).toLocaleString("ar-SA")}</strong><span class="metric-foot">سجل مستقل عن الكتالوج الوصفي</span></div><div class="metric-card"><span class="metric-label">أعلى رقم تاريخي مسترد</span><strong>${Number(s.maximum_numeric_feature_number).toLocaleString("ar-SA")}</strong><span class="metric-foot">الحالي: ${h(s.source || "Historical Recovery")}</span></div>`);
    }
  }

  function bind() {
    ["#recoverySearch", "#recoveryEvidence", "#recoveryDomain"].forEach((s) => q(s)?.addEventListener("input", apply));
    q("#recoveryClear")?.addEventListener("click", () => { q("#recoverySearch").value=""; q("#recoveryEvidence").value=""; q("#recoveryDomain").value=""; apply(); });
    q("#recoveryPrev")?.addEventListener("click", () => { recovery.page -= 1; renderTable(); });
    q("#recoveryNext")?.addEventListener("click", () => { recovery.page += 1; renderTable(); });
  }

  async function load() {
    const mr = await fetch("../data/historical_recovery_manifest.json");
    if (!mr.ok) throw new Error("historical recovery manifest unavailable");
    recovery.manifest = await mr.json();
    const parts = await Promise.all(recovery.manifest.chunks.map(async (name) => {
      const r = await fetch(`../data/historical-recovery/${name}`);
      if (!r.ok) throw new Error(`historical recovery chunk unavailable: ${name}`);
      return r.json();
    }));
    recovery.records = parts.flat().map((r,i) => ({ ...r, _k:`HR-${String(i+1).padStart(4,"0")}` }));
    recovery.filtered = recovery.records;
    const s = recovery.manifest.summary;
    q("#recoveryRecords").textContent = Number(s.records).toLocaleString("ar-SA");
    q("#recoveryUnique").textContent = Number(s.unique_numeric_feature_numbers).toLocaleString("ar-SA");
    q("#recoveryHighWater").textContent = Number(s.maximum_numeric_feature_number).toLocaleString("ar-SA");
    q("#recoveryBranches").textContent = Number(s.branch_count).toLocaleString("ar-SA");
    q("#recoveryStatus").textContent = `جاهز · ${Number(s.records).toLocaleString("ar-SA")} سجل`;
    q("#recoveryDomain").insertAdjacentHTML("beforeend", domains().map((d) => `<option value="${h(d)}">${h(d)}</option>`).join(""));
    renderOverviewMetrics();
    renderTable();
  }

  injectShell();
  document.addEventListener("DOMContentLoaded", () => {
    bind();
    load().catch((error) => { if(q("#recoveryStatus")) q("#recoveryStatus").textContent = "تعذر تحميل السجل"; console.error(error); });
  });
})();
