# Smart Environment MVP

## منصة البيئة الذكية

منصة البيئة الذكية هي تصور لبنية وطنية رقمية متكاملة لإدارة البيئة والموارد
الطبيعية ودعم القرار. تجمع المنصة بين الرصد، وتنظيم البيانات، والتحليل،
والتنبؤ بالمخاطر، والمحاكاة، والتقارير، والتوصيات، والذاكرة المؤسسية ضمن مسار
واحد قابل للمراجعة.

يشمل نطاقها العام الحياة الفطرية والتنوع الأحيائي، المناطق المحمية، المياه
والمياه الجوفية، الهواء والمناخ والانبعاثات، التلوث والنفايات، الزراعة والتربة،
التصحر والغطاء النباتي، التخطيط والبنية التحتية، والحوكمة والبحث ودعم القرار.

يضم الفهرس العام وصفًا مختصرًا لجميع السجلات الوظيفية المتاحة في نطاق المنصة،
مع اسم كل ميزة ومعرفها ومجالها ونوعها ووصفها العام وقيمتها الوظيفية وتصنيفاتها.
أما الأكواد والتفاصيل التنفيذية ومصادر الإثبات الداخلية فليست جزءًا من الإصدار
العام.

للاطلاع على الشرح العربي الكامل، راجع [الملخص العام للمنصة](docs/public-platform-overview.md).

## National environmental intelligence infrastructure demonstrator

This repository contains a public, executable demonstration of the Smart
Environment platform as a national environmental intelligence infrastructure.
It is intentionally separated from the private source portfolio and is
designed for technical review, architectural discussion, and early validation.

The demonstrator brings together:

- a searchable feature registry covering the documented platform scope. The
  public index is delivered in small catalogue chunks so the complete index can
  be reviewed without publishing protected implementation detail;
- environmental monitoring views for air, water, biodiversity, groundwater,
  waste, climate, and protected areas;
- a transparent risk-scoring layer;
- scenario simulation for environmental pressure and conservation measures;
- decision briefs with recommendations, evidence, and traceable assumptions;
- a provenance-aware presentation of the documented feature records.

The current repository is an MVP demonstrator. The catalogue records documented
functional scope; it must not be interpreted as proof that every function is
already deployed in production or connected to government systems.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/app/
```

No external packages or internet connection are required for the dashboard.

## Public release boundary

The public release includes descriptive feature metadata and the demonstrator
runtime. Proprietary implementation details, private due-diligence records,
valuation files, source documents, and embedded code samples are excluded from
this public repository.

For a fuller public explanation of the platform, its domains, capability layers,
and disclosure boundary, read [the public platform overview](docs/public-platform-overview.md).

## Architecture

```text
Feature catalogue and evidence metadata
                |
                v
National operating view ---- Monitoring signals
                |                      |
                v                      v
        Scenario simulator ---- Risk and impact model
                |
                v
      Decision brief and evidence trace
```

## Rights and limitations

The Smart Environment platform and its documented architecture remain the
property of the rights holder. This repository is published for controlled
public visibility and technical demonstration under the accompanying
proprietary licence.
