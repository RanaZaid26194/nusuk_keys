"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, KeyRound, Sparkles, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { Language } from "@/lib/types";

interface SeoGuideProps {
  lang: Language;
  onOpenSubmit: () => void;
}

export const SeoGuide: React.FC<SeoGuideProps> = ({ lang, onOpenSubmit }) => {
  const isAr = lang === "ar";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const faqs = isAr
    ? [
        {
          q: "ما هي مفاتيح تحدي نسك (رموز NG)؟",
          a: "مفاتيح تحدي نسك هي رموز إحالة تبدأ بـ 'NG-' تُستخدم داخل تطبيق نسك الرسمي (services.nusuk.sa) للمشاركة في مسابقات وتحديات العمرة اليومية والحصول على فرص إضافية للفوز بباقات العمرة المجانية والجوائز المقدمة لضيوف الرحمن."
        },
        {
          q: "كيف أستخدم الرمز وأفعله في تطبيق نسك؟",
          a: "اختر أي رمز موثوق من القائمة أعلاه واضغط على زر 'نسخ'، ثم اضغط على 'فتح في نسك'. داخل التطبيق، توجه إلى قسم التحديات أو المسابقات، وأدخل الرمز في خانة الإحالة للحصول على المفتاح الإضافي لك ولصاحب الرمز فوراً."
        },
        {
          q: "كيف أشارك رمزي الخاص مع الحجاج والمعتمرين؟",
          a: "يمكنك الضغط على زر 'شارك رمزك' في أعلى الصفحة، وأدخل رمزك الذي يبدأ بـ NG-. سيتم إدراجه فوراً في قاعدة البيانات الحية ليتمكن آلاف المعتمرين حول العالم من استخدامه، وتكسب مفاتيح مجانية عند كل تفعيل."
        },
        {
          q: "هل رموز ومفاتيح نسك مجانية وآمنة؟",
          a: "نعم، موقع keys-nusuk.vercel.app هو منصة خيرية مجانية 100% ومفتوحة المصدر لخدمة ضيوف الرحمن، بدون أي إعلانات أو رسوم. جميع الرموز يتم التحقق منها عبر مجتمع المعتمرين."
        }
      ]
    : [
        {
          q: "What are Nusuk Challenge Referral Keys (NG- codes)?",
          a: "Nusuk Challenge Keys are community referral codes starting with 'NG-' used in the official Saudi Nusuk App (services.nusuk.sa). Entering a valid code unlocks bonus keys for the daily Free Umrah Challenge draws, giving pilgrims extra chances to win Umrah packages."
        },
        {
          q: "How do I redeem a challenge key in the Nusuk App?",
          a: "Tap 'Copy' on any active key in our directory, then tap 'Open in Nusuk'. In the official app, navigate to the Umrah Challenge / Competitions tab, paste the code, and confirm. Both you and the code creator earn a bonus entry key immediately."
        },
        {
          q: "How can I share my own Nusuk referral key?",
          a: "Click 'Share Your Key' at the top of the directory, paste your NG- code, and submit. Your key instantly goes live to thousands of pilgrims visiting daily, maximizing your chances of gaining bonus keys when others redeem it."
        },
        {
          q: "Is keys-nusuk.vercel.app free and safe to use?",
          a: "Yes! Nusuk Keys is a 100% free, non-profit community project built for Umrah pilgrims worldwide. It requires zero login credentials, contains no advertisements, and runs strictly as a verified referral hub."
        }
      ];

  return (
    <section 
      aria-label={isAr ? "دليل ومعلومات مفاتيح نسك" : "Nusuk Challenge Keys Guide & FAQs"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6 border-t border-zinc-200/60 dark:border-zinc-800/60"
    >
      {/* Semantic H2 Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "دليل المسابقة الشامل" : "Official Challenge Guide"}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight ${isAr ? "font-arabic" : ""}`}>
          {isAr ? "دليل مفاتيح ورموز تحدي نسك للعمرة" : "About Nusuk Challenge Referral Keys"}
        </h2>
        <p className={`mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
          {isAr
            ? "دليلك الشامل لمعرفة طريقة الحصول على مفاتيح تطبيق نسك اليومية مجاناً وكيفية استبدالها للفوز برحلات العمرة وزيارة المسجد الحرام."
            : "Your complete guide to discovering, redeeming, and sharing active referral keys for the Saudi Nusuk Free Umrah Challenge & daily draws."}
        </p>
      </div>

      {/* 3 Step Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <article className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base mb-4 border border-emerald-500/20">
            1
          </div>
          <h3 className={`text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "نسخ الرمز بضغطة واحدة" : "1-Tap Instant Copy"}
          </h3>
          <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr
              ? "تصفح أكثر من 15,000 رمز نشط من قاعدة البيانات الحية. يتم التحقق من الرموز باستمرار لضمان عملها بنسبة 100%."
              : "Browse 15,000+ active keys synced real-time from our database. Upvoted by real pilgrims for 100% verification."}
          </p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base mb-4 border border-amber-500/20">
            2
          </div>
          <h3 className={`text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "الفتح في تطبيق نسك" : "Launch Official Nusuk App"}
          </h3>
          <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr
              ? "اضغط على زر 'فتح في نسك' للانتقال مباشرة إلى صفحة التحدي داخل التطبيق الرسمي وتفعيل الرمز فوراً."
              : "Use the direct deep-link button to open services.nusuk.sa or the mobile app straight to the challenge redemption tab."}
          </p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-base mb-4 border border-teal-500/20">
            3
          </div>
          <h3 className={`text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 ${isAr ? "font-arabic" : ""}`}>
            {isAr ? "مشاركة الرمز كصدقة جارية" : "Mutual Referral Rewards"}
          </h3>
          <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
            {isAr
              ? "شارك رمزك مع إخوانك المعتمرين. عندما يستخدم شخص آخر رمزك، يحصل كلاكما على مفاتيح إضافية وفرص فوز مضاعفة."
              : "Whenever another pilgrim uses your shared key, both of you earn extra challenge attempts, doubling your winning chances."}
          </p>
        </article>
      </div>

      {/* Accordion FAQ for Structured Data matching */}
      <div className="max-w-3xl mx-auto">
        <h3 className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 ${isAr ? "font-arabic" : ""}`}>
          <HelpCircle className="w-5 h-5 text-emerald-500" />
          <span>{isAr ? "الأسئلة الشائعة حول مفاتيح نسك" : "Frequently Asked Questions"}</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 text-left rtl:text-right text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={isAr ? "font-arabic text-base" : ""}>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/40">
                    <p className={isAr ? "font-arabic" : ""}>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
