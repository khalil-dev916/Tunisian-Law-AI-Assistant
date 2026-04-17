'use client';

import Link from 'next/link';
import { Scale, ChevronRight, AlertTriangle, Globe } from 'lucide-react';
import { useLang } from '@/components/LangProvider';

const content = {
  ar: {
    title: 'من نحن',
    aboutTitle: 'عن المشروع',
    aboutText: 'موقع "القانون التونسي" هو مساعد قانوني ذكي يستخدم الذكاء الاصطناعي لمساعدة المواطنين على فهم قوانين تونس. الموقع يوفر إجابات على الأسئلة القانونية بناءً على النصوص القانونية التونسية.',
    disclaimerTitle: 'تنبيه مهم',
    disclaimerText: 'المعلومات المقدمة على هذا الموقع هي إرشادية عامة فقط. هذا الموقع ليس بديلاً عن استشارة محامي مختص لأي قضية خاصة.',
  },
  fr: {
    title: 'À propos',
    aboutTitle: 'À propos du projet',
    aboutText: '"Tunisian Law AI" est un assistant juridique qui utilise l\'intelligence artificielle pour aider les citoyens à comprendre les lois tunisiennes. Le site répond aux questions juridiques basées sur les textes légaux.',
    disclaimerTitle: 'Avertissement',
    disclaimerText: 'Les informations fournies sont uniquement à titre éducatif. Ce site ne remplace pas une consultation juridique professionnelle.',
  },
};

export default function AboutPage() {
  const { lang, setLang } = useLang();
  const t = content[lang];

  return (
    <div className="flex-1">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5 text-slate-600 rotate-180" />
            </Link>
            <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{t.title}</h1>
          </div>
          <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'FR' : 'AR'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{t.aboutTitle}</h2>
          <p className="text-slate-600 leading-relaxed">{t.aboutText}</p>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">{t.disclaimerTitle}</h3>
              <p className="text-amber-700 text-sm leading-relaxed">{t.disclaimerText}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}