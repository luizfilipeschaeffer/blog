export const BLOG_CSS = `
:root, html[data-theme="light"] {
  color-scheme: light;
  --bg: #fafafa;
  --fg: #171717;
  --muted: #737373;
  --border: #e5e5e5;
  --border-strong: #a3a3a3;
  --card: #ffffff;
  --accent: #171717;
  --link: #171717;
  --prose: #262626;
  --hover: #f0f0f0;
  --shadow: rgba(23, 23, 23, 0.06);
  --blur-fallback: rgba(250, 250, 250, 0.55);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0a0a;
  --fg: #fafafa;
  --muted: #a3a3a3;
  --border: #262626;
  --border-strong: #525252;
  --card: #141414;
  --accent: #fafafa;
  --link: #fafafa;
  --prose: #e5e5e5;
  --hover: #1f1f1f;
  --shadow: rgba(0, 0, 0, 0.35);
  --blur-fallback: rgba(10, 10, 10, 0.55);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
  transition: background-color 0.2s ease, color 0.2s ease;
}
a { color: var(--link); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { opacity: 0.8; }
main { flex: 1 0 auto; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in oklab, var(--card) 90%, transparent);
}
.site-header .inner {
  width: 100%;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.brand {
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--fg);
  font-size: 1.05rem;
  flex: 0 0 auto;
}
.topics-nav {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
}
.topic-link {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid transparent;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.topic-link:hover {
  color: var(--fg);
  background: var(--hover);
  opacity: 1;
}
.topic-link.is-active {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}
.topic-link:focus-visible {
  outline: 2px solid var(--border-strong);
  outline-offset: 2px;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
  margin-left: auto;
}
.theme-switch {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.15rem;
  gap: 0.1rem;
  background: var(--card);
}
.theme-switch button {
  width: 1.85rem;
  height: 1.85rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.theme-switch button.is-active,
.theme-switch button[aria-pressed="true"] {
  background: var(--fg);
  color: var(--bg);
}
.theme-switch button:focus-visible {
  outline: 2px solid var(--border-strong);
  outline-offset: 2px;
}
.theme-switch svg { width: 0.95rem; height: 0.95rem; }
.site-footer {
  border-top: 1px solid var(--border);
  margin-top: auto;
  padding: 1.5rem 1.25rem;
  color: var(--muted);
  font-size: 0.85rem;
}
.site-footer .inner {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  justify-content: space-between;
  align-items: center;
}
.site-footer a { color: var(--muted); text-decoration: none; }
.site-footer a:hover { color: var(--fg); opacity: 1; }
.blog-index {
  width: 100%;
  padding: 1.25rem 1.25rem 4rem;
}
.featured-section {
  margin: 0 0 3rem;
}
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.section-heading--list {
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--border);
}
.section-heading h2 {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  letter-spacing: -0.025em;
}
.section-kicker {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.carousel-controls {
  display: flex;
  gap: 0.45rem;
}
.carousel-controls button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  font-size: 1.05rem;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.carousel-controls button:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.carousel-controls button:focus-visible,
.featured-carousel:focus-visible {
  outline: 2px solid var(--border-strong);
  outline-offset: 3px;
}
.featured-carousel {
  display: flex;
  gap: 1rem;
  width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-behavior: smooth;
  scroll-snap-type: inline mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
  padding: 0.1rem 0 0.75rem;
}
.featured-slide {
  position: relative;
  flex: 0 0 clamp(22rem, 58vw, 58rem);
  aspect-ratio: 16 / 8;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--hover);
  color: #fff;
  text-decoration: none;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.featured-slide:only-child {
  flex-basis: 100%;
}
.featured-slide:hover {
  opacity: 1;
  border-color: var(--border-strong);
}
.featured-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.featured-slide:hover .featured-image {
  transform: scale(1.025);
}
.featured-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.2) 55%,
    transparent 100%
  );
}
.featured-slide.no-cover .featured-overlay {
  background: #262626;
}
.featured-slide h2 {
  max-width: 20ch;
  margin: 0;
  font-size: clamp(1.45rem, 2.5vw, 2.15rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #fff;
  text-wrap: balance;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
}
.latest-section {
  width: 100%;
}
.post-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}
.card {
  display: block;
  min-width: 0;
  height: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  opacity: 1;
}
.card.has-cover {
  display: flex;
  flex-direction: column;
}
.card-cover {
  width: 100%;
  height: auto;
  min-height: 0;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  background: var(--hover);
}
.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.3rem;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 0.55rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.75rem;
}
.card h2 {
  margin: 0 0 0.45rem;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  line-height: 1.3;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.excerpt {
  margin: 0 0 0.85rem;
  color: var(--muted);
  font-size: 0.95rem;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.byline-inline {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: auto;
  color: var(--muted);
  font-size: 0.85rem;
}
.author-avatars { display: inline-flex; align-items: center; }
.author-avatars > * {
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 999px;
  border: 2px solid var(--card);
  margin-left: -0.4rem;
  overflow: hidden;
  background: var(--hover);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--fg);
}
.author-avatars > *:first-child { margin-left: 0; }
.author-avatars img { width: 100%; height: 100%; object-fit: cover; }
.byline .author-avatars > * { width: 2.35rem; height: 2.35rem; font-size: 0.7rem; }
.author-footer .author-avatars > * { width: 3rem; height: 3rem; font-size: 0.8rem; }
.empty {
  grid-column: 1 / -1;
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 2rem;
  color: var(--muted);
  text-align: center;
}
.preview-banner {
  position: sticky;
  top: 3.4rem;
  z-index: 39;
  background: var(--fg);
  color: var(--bg);
  text-align: center;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
}
.article-page {
  padding: 0 1.25rem 5rem;
}
.article-cover-shell {
  width: 100%;
  margin: 0 0 clamp(1.25rem, 3vw, 2rem);
}
.article-cover {
  width: 100%;
  aspect-ratio: 3.2 / 1;
  object-fit: cover;
  display: block;
  border: 1px solid var(--border);
  border-top: 0;
  border-radius: 0 0 14px 14px;
  background: var(--hover);
}
.article-layout {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) minmax(0, 900px) minmax(9rem, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.article-layout.no-toc {
  grid-template-columns: minmax(9rem, 1fr) minmax(0, 900px) minmax(9rem, 1fr);
}
.article-layout.no-toc .article-toc { display: none; }
.article-card {
  grid-column: 2;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  padding: clamp(1.25rem, 4vw, 3rem);
}
.article-toc {
  position: sticky;
  top: 6rem;
  font-size: 0.82rem;
}
.article-toc h2 {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.article-toc a {
  display: block;
  padding: 0.35rem 0 0.35rem 0.75rem;
  border-left: 2px solid var(--border);
  color: var(--muted);
  text-decoration: none;
}
.article-toc a:hover { color: var(--fg); border-left-color: var(--fg); opacity: 1; }
.article-toc a.level-3 { padding-left: 1.35rem; }
.article-header h1 {
  margin: 0.35rem 0 0.75rem;
  font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}
.article-header .lead {
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 1.05rem;
}
.byline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}
.byline-text { font-size: 0.9rem; color: var(--muted); }
.prose {
  color: var(--prose);
  font-size: 1.05rem;
}
.prose > *:first-child { margin-top: 0; }
.prose h2, .prose h3 {
  letter-spacing: -0.02em;
  scroll-margin-top: 6rem;
  color: var(--fg);
}
.prose h2 { font-size: 1.4rem; margin: 2rem 0 0.75rem; }
.prose h3 { font-size: 1.15rem; margin: 1.5rem 0 0.55rem; }
.prose p, .prose ul, .prose ol { margin: 0 0 1rem; }
.prose a { color: var(--link); }
.prose pre {
  background: #111;
  color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
}
.prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.92em;
}
.prose :not(pre) > code {
  background: var(--hover);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
.prose blockquote {
  margin: 0 0 1rem;
  padding-left: 1rem;
  border-left: 3px solid var(--muted);
  color: var(--muted);
}
.prose img { max-width: 100%; border-radius: 8px; }
.author-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 1rem;
}
.author-footer-item {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}
.author-footer-meta { font-size: 0.9rem; }
.author-footer-meta .role { color: var(--muted); font-size: 0.8rem; }
.syndication-footer {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.9rem;
}
.share-tools {
  position: sticky;
  top: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}
.share-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.share-bubble {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  box-shadow: 0 6px 18px var(--shadow);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--fg);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.share-bubble:hover { transform: translateY(-2px); opacity: 1; }
.share-bubble:focus-visible {
  outline: 2px solid var(--border-strong);
  outline-offset: 2px;
}
.share-bubble img {
  width: 1.05rem;
  height: 1.05rem;
}
html[data-theme="dark"] .share-bubble img { filter: invert(1); }
.share-bubble .li {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: -0.04em;
}
.share-bubble.copied { background: var(--fg); color: var(--bg); }
.copy-feedback {
  font-size: 0.75rem;
  color: var(--muted);
  min-height: 1rem;
  text-align: center;
}
.reading-progress {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 3px;
  z-index: 50;
  pointer-events: none;
}
.reading-progress span {
  display: block;
  height: 100%;
  width: 100%;
  background: var(--fg);
  transform: scaleX(0);
  transform-origin: left center;
  animation: reading-progress linear;
  animation-timeline: scroll(root block);
}
@keyframes reading-progress { to { transform: scaleX(1); } }
.gradual-blur {
  isolation: isolate;
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 35;
}
.gradual-blur--top { top: 0; height: 5rem; }
.gradual-blur--bottom { bottom: 0; height: 6rem; }
.gradual-blur-inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.gradual-blur-inner > div {
  position: absolute;
  inset: 0;
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .gradual-blur-inner > div { background: var(--blur-fallback); }
}
.not-found {
  max-width: 760px;
  margin: 4rem auto;
  padding: 0 1.25rem;
  text-align: center;
}
.not-found h1 {
  letter-spacing: -0.03em;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}
@media (min-width: 1600px) {
  .post-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 1100px) {
  .post-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .topics-nav {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.15rem;
    scrollbar-width: thin;
  }
  .article-layout,
  .article-layout.no-toc {
    grid-template-columns: 1fr;
  }
  .article-toc { position: static; order: 1; }
  .share-tools {
    position: static;
    order: 2;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .share-label {
    writing-mode: horizontal-tb;
    transform: none;
    width: 100%;
  }
  .article-card { grid-column: auto; order: 3; }
  .copy-feedback { width: 100%; text-align: left; }
}
@media (max-width: 640px) {
  .site-header .inner { align-items: center; }
  .nav-actions { margin-left: 0; }
  .post-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 560px) {
  .featured-slide {
    flex-basis: calc(100vw - 2rem);
    aspect-ratio: 16 / 10;
  }
  .article-cover { aspect-ratio: 16 / 7; }
  .blog-index, .article-page { padding-left: 1rem; padding-right: 1rem; }
}
`.trim();
