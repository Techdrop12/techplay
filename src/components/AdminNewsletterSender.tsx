'use client';

import { useState } from 'react';
import { Send, FlaskConical, Layout, Code, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Template = 'custom' | 'promo' | 'news' | 'relance';
type EditorMode = 'visual' | 'html' | 'preview';

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px; margin: 0 auto; background: #ffffff; color: #111827;
`;

const TEMPLATES: Record<Template, { label: string; emoji: string; build: (f: TemplateFields) => string }> = {
  promo: {
    label: 'Promotion',
    emoji: '🏷️',
    build: (f) => `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${f.subject}</title></head>
<body style="background:#f3f4f6;padding:32px 16px;">
<div style="${BASE_STYLE}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#7c3aed;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:28px;margin:0;font-weight:800;">🏷️ ${f.title}</h1>
  </div>
  <div style="padding:32px 24px;">
    <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${f.body}</p>
    ${f.cta && f.ctaUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${f.ctaUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">${f.cta}</a></div>` : ''}
    ${f.code ? `<div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:8px;padding:16px;text-align:center;margin:16px 0;"><p style="margin:0 0 4px;font-size:12px;color:#6b7280;">CODE PROMO</p><span style="font-size:24px;font-weight:800;color:#7c3aed;letter-spacing:4px;">${f.code}</span></div>` : ''}
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">TechPlay — <a href="https://techplay.vercel.app" style="color:#7c3aed;">techplay.vercel.app</a></p>
  </div>
</div></body></html>`,
  },
  news: {
    label: 'Nouveauté',
    emoji: '🆕',
    build: (f) => `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${f.subject}</title></head>
<body style="background:#f3f4f6;padding:32px 16px;">
<div style="${BASE_STYLE}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#111827;padding:32px 24px;text-align:center;">
    <p style="color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">Nouveauté</p>
    <h1 style="color:#fff;font-size:26px;margin:0;font-weight:800;">${f.title}</h1>
  </div>
  <div style="padding:32px 24px;">
    <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${f.body}</p>
    ${f.cta && f.ctaUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${f.ctaUrl}" style="background:#111827;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">${f.cta}</a></div>` : ''}
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">TechPlay — <a href="https://techplay.vercel.app" style="color:#7c3aed;">techplay.vercel.app</a></p>
  </div>
</div></body></html>`,
  },
  relance: {
    label: 'Relance',
    emoji: '👋',
    build: (f) => `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${f.subject}</title></head>
<body style="background:#f3f4f6;padding:32px 16px;">
<div style="${BASE_STYLE}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="padding:40px 24px 32px;text-align:center;">
    <p style="font-size:40px;margin:0 0 16px;">👋</p>
    <h1 style="font-size:24px;margin:0 0 8px;font-weight:800;">${f.title}</h1>
  </div>
  <div style="padding:0 24px 32px;">
    <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${f.body}</p>
    ${f.cta && f.ctaUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${f.ctaUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">${f.cta}</a></div>` : ''}
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">TechPlay — <a href="https://techplay.vercel.app" style="color:#7c3aed;">techplay.vercel.app</a></p>
  </div>
</div></body></html>`,
  },
  custom: {
    label: 'HTML libre',
    emoji: '✏️',
    build: () => '',
  },
};

type TemplateFields = {
  subject: string;
  title: string;
  body: string;
  cta: string;
  ctaUrl: string;
  code: string;
};

export default function AdminNewsletterSender() {
  const [template, setTemplate] = useState<Template>('promo');
  const [mode, setMode] = useState<EditorMode>('visual');
  const [fields, setFields] = useState<TemplateFields>({
    subject: '',
    title: '',
    body: '',
    cta: '',
    ctaUrl: 'https://techplay.vercel.app',
    code: '',
  });
  const [rawHtml, setRawHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  function setField(k: keyof TemplateFields, v: string) {
    setFields((f) => ({ ...f, [k]: v }));
  }

  function getHtml(): string {
    if (template === 'custom') return rawHtml;
    return TEMPLATES[template].build(fields);
  }

  async function send(isTest: boolean) {
    const html = getHtml();
    const subject = template === 'custom' ? fields.subject : fields.subject;
    if (!subject.trim() || !html.trim()) {
      toast.error('Sujet et contenu requis');
      return;
    }
    if (isTest && !testEmail.trim()) { toast.error('Email de test requis'); return; }
    if (!isTest && !confirm('Envoyer à TOUS les abonnés newsletter ?')) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, testEmail: isTest ? testEmail : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erreur');
      toast.success(isTest ? `Test envoyé à ${testEmail}` : `Envoyé à ${data?.sent ?? 0} abonnés`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSending(false);
    }
  }

  const currentHtml = getHtml();

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Template picker */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold text-token-text/60 uppercase tracking-wider mb-3">Template</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TEMPLATES) as Template[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTemplate(key); setMode(key === 'custom' ? 'html' : 'visual'); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                template === key
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] border-transparent'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]'
              }`}
            >
              {TEMPLATES[key].emoji} {TEMPLATES[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Mode tabs */}
        {template !== 'custom' && (
          <div className="flex border-b border-[hsl(var(--border))] px-4 pt-2 gap-1">
            {([['visual', <Layout size={13} key="l" />, 'Visuel'], ['html', <Code size={13} key="c" />, 'HTML'], ['preview', <Eye size={13} key="e" />, 'Aperçu']] as [EditorMode, React.ReactNode, string][]).map(([m, icon, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                  mode === m ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-transparent text-token-text/60 hover:text-[hsl(var(--text))]'
                }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Sujet (toujours visible) */}
          <div>
            <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Sujet de l'email *</label>
            <input
              type="text"
              placeholder="ex: Nouveau produit disponible chez TechPlay !"
              value={fields.subject}
              onChange={(e) => setField('subject', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            />
          </div>

          {/* Visual mode */}
          {mode === 'visual' && template !== 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Titre *</label>
                <input type="text" placeholder="Titre accrocheur" value={fields.title} onChange={(e) => setField('title', e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Corps du message *</label>
                <textarea rows={4} placeholder="Votre message..." value={fields.body} onChange={(e) => setField('body', e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Texte du bouton</label>
                  <input type="text" placeholder="Voir l'offre" value={fields.cta} onChange={(e) => setField('cta', e.target.value)}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-token-text/70 block mb-1.5">URL du bouton</label>
                  <input type="url" placeholder="https://..." value={fields.ctaUrl} onChange={(e) => setField('ctaUrl', e.target.value)}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
                </div>
              </div>
              {template === 'promo' && (
                <div>
                  <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Code promo (optionnel)</label>
                  <input type="text" placeholder="SUMMER20" value={fields.code} onChange={(e) => setField('code', e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm uppercase font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
                </div>
              )}
            </div>
          )}

          {/* HTML mode */}
          {(mode === 'html' || template === 'custom') && (
            <div>
              <label className="text-xs font-semibold text-token-text/70 block mb-1.5">HTML *</label>
              <textarea
                rows={16}
                value={template === 'custom' ? rawHtml : currentHtml}
                onChange={(e) => {
                  if (template === 'custom') setRawHtml(e.target.value);
                }}
                readOnly={template !== 'custom'}
                className={`w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-mono resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${template !== 'custom' ? 'opacity-70 cursor-default' : ''}`}
              />
              {template !== 'custom' && (
                <p className="mt-1 text-xs text-token-text/40">Le HTML est généré automatiquement depuis le mode visuel.</p>
              )}
            </div>
          )}

          {/* Preview mode */}
          {mode === 'preview' && template !== 'custom' && (
            <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              <div className="bg-[hsl(var(--surface-2))] px-3 py-1.5 text-xs text-token-text/50 flex items-center gap-2">
                <Eye size={12} /> Aperçu rendu
              </div>
              <iframe
                srcDoc={currentHtml || '<p style="padding:16px;color:#aaa;">Remplissez les champs pour voir l\'aperçu</p>'}
                className="w-full h-[500px] border-0 bg-white"
                title="Aperçu newsletter"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>

      {/* Test + Send */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)] space-y-3">
        <p className="text-xs font-semibold text-token-text/60 uppercase tracking-wider">Test avant envoi</p>
        <div className="flex gap-2">
          <input type="email" placeholder="votre@email.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" />
          <button type="button" onClick={() => send(true)} disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] disabled:opacity-50">
            <FlaskConical size={14} /> Test
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => send(false)} disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95 disabled:opacity-50">
          <Send size={15} />
          {sending ? 'Envoi en cours...' : 'Envoyer à tous les abonnés'}
        </button>
      </div>
    </div>
  );
}
