import { escapeHtml, slugify, decodeHeadingText } from "@/lib/blog/utils";

export const THEME_BOOT_SCRIPT = `(function () {
  try {
    var key = 'theme';
    var pref = localStorage.getItem(key) || 'system';
    if (pref !== 'light' && pref !== 'dark' && pref !== 'system') pref = 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    var root = document.documentElement;
    root.setAttribute('data-theme-pref', pref);
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
  } catch (e) {}
})();`;

export const THEME_UI_SCRIPT = `(function () {
  var key = 'theme';
  function resolve(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(pref) {
    var resolved = resolve(pref);
    var root = document.documentElement;
    root.setAttribute('data-theme-pref', pref);
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
    document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
      var active = btn.getAttribute('data-theme-set') === pref;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pref = btn.getAttribute('data-theme-set') || 'system';
      try { localStorage.setItem(key, pref); } catch (e) {}
      apply(pref);
    });
  });
  var initial = 'system';
  try { initial = localStorage.getItem(key) || 'system'; } catch (e) {}
  apply(initial);
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      var pref = 'system';
      try { pref = localStorage.getItem(key) || 'system'; } catch (e) {}
      if (pref === 'system') apply('system');
    });
  } catch (e) {}
})();`;

function bezierCurve(p: number) {
  return p * p * (3 - 2 * p);
}

export function renderGradualBlur({
  position = "bottom",
  height = "6rem",
  strength = 2,
  divCount = 5,
  exponential = true,
}: {
  position?: "top" | "bottom" | "left" | "right";
  height?: string;
  strength?: number;
  divCount?: number;
  exponential?: boolean;
} = {}) {
  const increment = 100 / divCount;
  const direction =
    ({ top: "to top", bottom: "to bottom", left: "to left", right: "to right" } as const)[
      position
    ] || "to bottom";
  const layers: string[] = [];
  for (let i = 1; i <= divCount; i++) {
    const progress = bezierCurve(i / divCount);
    const blurValue = exponential
      ? Math.pow(2, progress * 4) * 0.0625 * strength
      : 0.0625 * (progress * divCount + 1) * strength;
    const p1 = Math.round((increment * i - increment) * 10) / 10;
    const p2 = Math.round(increment * i * 10) / 10;
    const p3 = Math.round((increment * i + increment) * 10) / 10;
    const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
    let gradient = `transparent ${p1}%, black ${p2}%`;
    if (p3 <= 100) gradient += `, black ${p3}%`;
    if (p4 <= 100) gradient += `, transparent ${p4}%`;
    layers.push(
      `<div style="mask-image:linear-gradient(${direction}, ${gradient});-webkit-mask-image:linear-gradient(${direction}, ${gradient});backdrop-filter:blur(${blurValue.toFixed(3)}rem);-webkit-backdrop-filter:blur(${blurValue.toFixed(3)}rem);opacity:1"></div>`,
    );
  }
  const edgeClass =
    position === "top" ? "gradual-blur--top" : "gradual-blur--bottom";
  return `<div class="gradual-blur ${edgeClass}" style="height:${height}" aria-hidden="true"><div class="gradual-blur-inner">${layers.join("")}</div></div>`;
}

export function buildArticleOutline(html: string) {
  const headings: { id: string; level: number; text: string }[] = [];
  const occurrences = new Map<string, number>();
  const content = String(html || "").replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_m, level, attributes, inner) => {
      const text = decodeHeadingText(inner);
      if (!text) return _m;
      const baseId = slugify(text) || `topico-${headings.length + 1}`;
      const count = occurrences.get(baseId) || 0;
      occurrences.set(baseId, count + 1);
      const id = count ? `${baseId}-${count + 1}` : baseId;
      const cleanAttributes = String(attributes || "").replace(
        /\s+id=(?:"[^"]*"|'[^']*')/gi,
        "",
      );
      headings.push({ id, level: Number(level), text });
      return `<h${level}${cleanAttributes} id="${escapeHtml(id)}">${inner}</h${level}>`;
    },
  );
  return { content, headings };
}

export function renderThemeSwitch() {
  const icon = (paths: string) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  return `<div class="theme-switch" role="group" aria-label="Tema">
    <button type="button" data-theme-set="light" aria-label="Tema claro" title="Claro">${icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>')}</button>
    <button type="button" data-theme-set="system" aria-label="Tema do sistema" title="Sistema">${icon('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>')}</button>
    <button type="button" data-theme-set="dark" aria-label="Tema escuro" title="Escuro">${icon('<path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/>')}</button>
  </div>`;
}

export const COPY_SCRIPT = `(function () {
  var button = document.querySelector('[data-copy-url]');
  var feedback = document.querySelector('[data-copy-feedback]');
  if (!button) return;
  button.addEventListener('click', async function () {
    var url = button.getAttribute('data-copy-url') || location.href;
    try { await navigator.clipboard.writeText(url); }
    catch (e) {
      var field = document.createElement('textarea');
      field.value = url; field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(field); field.select();
      document.execCommand('copy'); field.remove();
    }
    if (feedback) feedback.textContent = 'Link copiado';
    button.classList.add('copied');
    setTimeout(function () {
      button.classList.remove('copied');
      if (feedback) feedback.textContent = '';
    }, 1600);
  });
})();`;
