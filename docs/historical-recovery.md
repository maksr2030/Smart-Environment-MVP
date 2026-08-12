# Historical Recovery Layer | طبقة الاسترداد التاريخي

## العربية

تضيف هذه الطبقة إلى نموذج منصة البيئة الذكية سجلاً مستقلاً للميزات التي أُعيد استردادها من محادثات التطوير التاريخية.

الحالة الحالية في هذا الإصدار:

- 256 سجلاً تاريخياً مسترداً.
- 233 رقماً رقمياً فريداً داخل السجلات المستردة.
- أعلى رقم تاريخي مسترد حالياً: 1025.
- 34 فرع استرداد تاريخي.
- درجات الإثبات المستخدمة: A وB وC وD.

لا يُدمج سجلان لمجرد أنهما يحملان الرقم نفسه. المفتاح التاريخي الصحيح هو: تاريخ المحادثة + فرع الاسترداد + الرقم التاريخي + النص المسترد. وهذا يحافظ على حالات إعادة استخدام الأرقام التي ظهرت تاريخياً في فروع مختلفة.

### درجات الإثبات

- A: عنوان أو نص مسترد مباشرة من المحادثة التاريخية الأصلية.
- B: استرداد تاريخي جزئي أو مباشر موثوق يحتاج استكمالاً.
- C: وجود الرقم أو تسلسله مثبت، بينما العنوان الكامل لم يُسترد بعد.
- D: مرجع استرداد ثانوي بانتظار تأكيد أقوى من المحادثة الأصلية.

### علاقتها بالكتالوج العام

الكتالوج الوصفي العام الحالي يحتوي على 1,067 سجلاً وصفياً. طبقة الاسترداد التاريخي لا تستبدله ولا تُضاف إليه حسابياً باعتبار كل سجل ميزة مستقلة جديدة، لأن بعض السجلات قد تتداخل أو تعكس إعادة ترقيم أو فروعاً تاريخية متوازية.

الـMVP يعرض الطبقتين بصورة منفصلة حتى يمكن تقييم النطاق العام من جهة، والأثر التاريخي للاسترداد من جهة أخرى، من دون تضخيم عداد الميزات أو حذف التعارضات التاريخية.

### حدود النشر العام

هذه الطبقة تنشر بيانات وصفية آمنة فقط. لا تتضمن:

- الأكواد البرمجية التاريخية؛
- أسماء ملفات الإثبات الخاصة أو مراجعها الداخلية؛
- بيانات الاتصال؛
- ملفات التقييم أو التسعير؛
- أي ادعاء بأن كل ميزة منشورة تعمل إنتاجياً أو متكاملة مع جهة حكومية.

واجهة العرض: `app/historical-recovery.html`.

## English

This layer adds an independent historical registry to the Smart Environment MVP for features recovered from historical development conversations.

Current release status:

- 256 recovered historical records.
- 233 unique numeric feature numbers within the recovered records.
- Current recovered historical high-water mark: 1025.
- 34 historical recovery branches.
- Evidence grades: A, B, C, and D.

Records are not merged merely because they share the same number. The historical key is conversation date + recovery branch + historical number + recovered text. This preserves historical number reuse across parallel branches.

The existing public descriptive catalogue contains 1,067 records. The historical layer does not replace it and should not be arithmetically added to it as if every recovered record were a new independent production feature, because overlap, renumbering, and historical branching exist.

The public release contains safe descriptive metadata only and excludes embedded historical code, private evidence filenames and references, contact details, valuation material, and production/integration/revenue claims.
