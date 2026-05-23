import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
mkdirSync(root, { recursive: true })

const W = 1600
const H = 1000

const screens = [
  {
    file: '01-brand-system',
    title: 'Brand System',
    subtitle: 'Blue-first tokens, logo direction, reusable controls, and light/dark UI rules.',
    html: brandSystem,
  },
  {
    file: '02-landing-page',
    title: 'Fan Landing',
    subtitle: 'Booking-style discovery with a premium SaaS shell and mobile hero state.',
    html: landingPage,
  },
  {
    file: '03-pricing-page',
    title: 'Organizer Pricing',
    subtitle: 'Modern SaaS pricing, usage visibility, metered fees, and dark mobile conversion.',
    html: pricingPage,
  },
  {
    file: '04-login-page',
    title: 'Secure Login',
    subtitle: 'Role-aware authentication for fans, organizers, admins, and scanner staff.',
    html: loginPage,
  },
  {
    file: '05-fan-discovery',
    title: 'Fan Discovery',
    subtitle: 'Search, filters, featured events, dense list scanning, and responsive cards.',
    html: discoveryPage,
  },
  {
    file: '06-event-detail-seat-map',
    title: 'Event Detail And Seat Map',
    subtitle: 'Dark-mode event detail with realtime seat availability and hold intent.',
    html: eventDetailSeatMap,
  },
  {
    file: '07-checkout-ticket',
    title: 'Checkout And Ticket Wallet',
    subtitle: 'Reservation TTL, payment, order review, issued QR ticket, and wallet state.',
    html: checkoutTicket,
  },
  {
    file: '08-organizer-dashboard',
    title: 'Organizer Dashboard',
    subtitle: 'Dense SaaS analytics, reservation health, refunds, and event-day operations.',
    html: organizerDashboard,
  },
  {
    file: '09-seat-map-builder',
    title: 'Seat Map Builder',
    subtitle: 'Venue canvas, section tools, tier inspector, staff holds, and publish workflow.',
    html: seatMapBuilder,
  },
  {
    file: '10-admin-ops-scanner',
    title: 'Admin Ops And Scanner',
    subtitle: 'Platform risk, audit stream, reconciliation, RBAC, and gate scanner workflow.',
    html: adminOpsScanner,
  },
]

const css = `
:root {
  --blue-950: #07111f;
  --blue-900: #0b1b33;
  --blue-800: #0f2f5f;
  --blue-700: #174ea6;
  --blue-600: #2563eb;
  --blue-500: #3b82f6;
  --blue-400: #60a5fa;
  --cyan-500: #06b6d4;
  --green-500: #16a34a;
  --amber-500: #f59e0b;
  --rose-500: #f43f5e;
  --violet-500: #7c3aed;
  --ink: #0f172a;
  --ink-2: #1e293b;
  --muted: #64748b;
  --muted-2: #94a3b8;
  --line: #dbe4f0;
  --line-2: #cbd5e1;
  --paper: #f6f8fb;
  --paper-2: #eef4ff;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --dark: #060b14;
  --dark-2: #0b1220;
  --dark-3: #111827;
  --dark-4: #172033;
  --dark-line: #25334a;
  --shadow: 0 26px 80px rgba(15, 23, 42, 0.16);
  --shadow-soft: 0 16px 44px rgba(30, 64, 175, 0.12);
  --shadow-dark: 0 28px 90px rgba(0, 0, 0, 0.42);
}
* { box-sizing: border-box; }
html, body { margin: 0; width: ${W}px; min-height: ${H}px; }
body {
  background: #050812;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
}
.screen {
  width: ${W}px;
  height: ${H}px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 34%),
    radial-gradient(circle at 84% 10%, rgba(96,165,250,0.2), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
}
.screen.dark {
  color: #eef5ff;
  background:
    radial-gradient(circle at 82% 12%, rgba(37,99,235,0.32), transparent 26%),
    radial-gradient(circle at 14% 86%, rgba(6,182,212,0.16), transparent 24%),
    linear-gradient(180deg, #06101f 0%, #0b1220 100%);
}
.screen::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-size: 40px 40px;
  background-image: linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px);
}
.screen.dark::before {
  background-image: linear-gradient(rgba(96,165,250,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.11) 1px, transparent 1px);
}
.title-bar {
  position: absolute;
  left: 58px;
  right: 58px;
  top: 36px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ink);
}
.dark .title-bar { color: #eaf2ff; }
.canvas-note {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(37,99,235,0.16);
  background: rgba(255,255,255,0.7);
  color: #1d4ed8;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
}
.dark .canvas-note {
  color: #bfdbfe;
  background: rgba(15,23,42,0.7);
  border-color: rgba(96,165,250,0.22);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 860;
  color: var(--ink);
}
.dark .brand, .brand.dark { color: #eff6ff; }
.brand-mark {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  filter: drop-shadow(0 12px 20px rgba(37,99,235,0.25));
}
.brand strong { font-size: 19px; letter-spacing: 0; }
.icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}
.browser {
  position: absolute;
  z-index: 2;
  overflow: hidden;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid rgba(15,23,42,0.1);
  box-shadow: var(--shadow);
}
.browser.dark {
  background: var(--dark-2);
  border-color: var(--dark-line);
  box-shadow: var(--shadow-dark);
}
.browser-bar {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(15,23,42,0.08);
  background: rgba(248,250,252,0.82);
}
.browser.dark .browser-bar {
  background: #09111f;
  border-bottom-color: var(--dark-line);
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #fb7185; }
.dot.yellow { background: #fbbf24; }
.dot.green { background: #34d399; }
.browser-content { height: calc(100% - 44px); position: relative; }
.phone {
  position: absolute;
  z-index: 4;
  border-radius: 34px;
  background: #050812;
  padding: 10px;
  box-shadow: var(--shadow-dark);
  border: 1px solid rgba(255,255,255,0.09);
}
.phone-screen {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  background: #0b1220;
  color: #eef5ff;
  border: 1px solid #24334a;
}
.phone.light .phone-screen {
  background: #f8fbff;
  color: var(--ink);
  border-color: #dbe4f0;
}
.notch {
  position: absolute;
  z-index: 6;
  top: 18px;
  left: 50%;
  width: 86px;
  height: 6px;
  margin-left: -43px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
}
.phone.light .notch { background: rgba(15,23,42,0.12); }
.h1 { font-size: 70px; line-height: 0.94; letter-spacing: 0; font-weight: 900; }
.h2 { font-size: 42px; line-height: 1.05; letter-spacing: 0; font-weight: 870; }
.h3 { font-size: 26px; line-height: 1.14; letter-spacing: 0; font-weight: 840; }
.body { font-size: 16px; line-height: 1.5; color: var(--muted); font-weight: 520; }
.small { font-size: 13px; line-height: 1.42; color: var(--muted); font-weight: 560; }
.tiny { font-size: 11px; line-height: 1.35; font-weight: 780; text-transform: uppercase; color: var(--muted); letter-spacing: 0; }
.dark .body, .browser.dark .body { color: #9fb2cf; }
.dark .small, .browser.dark .small { color: #9fb2cf; }
.dark .tiny, .browser.dark .tiny { color: #8ea3c4; }
.dark .h1,
.dark .h2,
.dark .h3,
.browser.dark .h1,
.browser.dark .h2,
.browser.dark .h3,
.dark-card .h1,
.dark-card .h2,
.dark-card .h3 {
  color: #eef5ff;
}
.card {
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  box-shadow: 0 14px 36px rgba(15,23,42,0.07);
}
.card.flat { box-shadow: none; }
.dark-card {
  border-radius: 8px;
  border: 1px solid var(--dark-line);
  background: linear-gradient(180deg, rgba(23,32,51,0.98), rgba(15,23,42,0.98));
  color: #eef5ff;
  box-shadow: 0 22px 60px rgba(0,0,0,0.25);
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 820;
  white-space: nowrap;
}
.button svg, .searchbar svg, .toolbar-button svg { width: 18px; height: 18px; flex: 0 0 auto; }
.button.primary { background: var(--blue-600); color: white; box-shadow: 0 16px 30px rgba(37,99,235,0.24); }
.button.secondary { background: #e8f1ff; color: #1d4ed8; border-color: #bfd5ff; }
.button.dark { background: #0f172a; color: #f8fbff; border-color: #1e293b; }
.button.light { background: #fff; color: var(--ink); border-color: var(--line); }
.button.ghost { background: rgba(255,255,255,0.08); color: #eef5ff; border-color: rgba(255,255,255,0.16); }
.button.green { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 28px;
  font-weight: 820;
  white-space: nowrap;
}
.label.blue { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
.label.green { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.label.amber { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.label.rose { background: #ffe4e6; color: #be123c; border-color: #fecdd3; }
.label.violet { background: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }
.label.dark { background: #16243a; color: #dbeafe; border-color: #2d4264; }
.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  color: #475569;
  font-size: 14px;
  font-weight: 650;
}
.dark .searchbar, .browser.dark .searchbar {
  background: #101a2d;
  border-color: #263752;
  color: #cbd5e1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 780;
}
.nav-item.active { color: #1d4ed8; background: #e8f1ff; }
.browser.dark .nav-item { color: #9fb2cf; }
.browser.dark .nav-item.active { color: #dbeafe; background: #152440; border: 1px solid #2b4268; }
.stat {
  padding: 18px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
}
.stat .value { font-size: 31px; line-height: 1; font-weight: 900; margin-top: 10px; }
.stat .sub { margin-top: 9px; display: flex; align-items: center; gap: 8px; }
.browser.dark .stat, .dark .stat {
  background: #101a2d;
  border-color: #263752;
  color: #eef5ff;
}
.table { width: 100%; border-collapse: collapse; font-size: 13px; color: inherit; }
.table th {
  text-align: left;
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0;
  padding: 0 0 12px;
}
.table td {
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
  font-weight: 700;
  color: #334155;
}
.browser.dark .table th { color: #8ea3c4; }
.browser.dark .table td { color: #dbe6f7; border-top-color: #263752; }
.toolbar-button {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #93a4bd;
  border: 1px solid transparent;
}
.toolbar-button.active {
  color: #fff;
  background: var(--blue-600);
  box-shadow: 0 16px 30px rgba(37,99,235,0.28);
}
`

function page(title, body, mode = 'light') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=${W}, initial-scale=1" />
  <title>Pulse Seat - ${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="screen ${mode === 'dark' ? 'dark' : ''}">
    <div class="title-bar">
      ${brand(mode === 'dark' ? 'dark' : 'light')}
      <div class="canvas-note">${icon('sparkles')} ${escapeHtml(title)}</div>
    </div>
    ${body}
  </main>
</body>
</html>`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function icon(name) {
  const attrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    ticket: '<path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3Z"/><path d="M13 6v12"/>',
    calendar: '<path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/>',
    seats: '<path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M5 11h14v7H5z"/><path d="M7 18v3M17 18v3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
    scan: '<path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2"/><path d="M7 12h10"/>',
    wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h12v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><path d="M16 14h4"/>',
    bolt: '<path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    sparkles: '<path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z"/>',
    map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    filter: '<path d="M22 3H2l8 9.5V20l4 2v-9.5L22 3Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16v4H4v-4"/>',
  }
  return `<svg class="icon" ${attrs}>${paths[name] || paths.ticket}</svg>`
}

function brand(theme = 'light', size = 40) {
  const textClass = theme === 'dark' ? 'brand dark' : 'brand'
  return `<div class="${textClass}">
    <svg class="brand-mark" style="width:${size}px;height:${size}px" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#2563eb"/>
      <path d="M14 18.5c0-4.2 3.2-7.5 7.8-7.5h4.4c4.6 0 7.8 3.3 7.8 7.5v11" stroke="white" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M12 28h24M16 28v6M32 28v6M19 20h10" stroke="#dbeafe" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="36" cy="14" r="4.5" fill="#06b6d4"/>
    </svg>
    <strong>Pulse Seat</strong>
  </div>`
}

function browser({ x, y, w, h, dark = false, children }) {
  return `<section class="browser ${dark ? 'dark' : ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
    <div class="browser-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
    <div class="browser-content">${children}</div>
  </section>`
}

function phone({ x, y, w = 292, h = 690, light = false, children }) {
  return `<section class="phone ${light ? 'light' : ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
    <div class="notch"></div>
    <div class="phone-screen">${children}</div>
  </section>`
}

function label(text, tone = 'blue') {
  return `<span class="label ${tone}">${escapeHtml(text)}</span>`
}

function button(text, tone = 'primary', iconName = '') {
  return `<span class="button ${tone}">${iconName ? icon(iconName) : ''}${escapeHtml(text)}</span>`
}

function nav(items, active = 0) {
  return items
    .map(([text, iconName], index) => `<div class="nav-item ${index === active ? 'active' : ''}">${icon(iconName)}<span>${escapeHtml(text)}</span></div>`)
    .join('')
}

function stat(labelText, value, sub, tone = 'blue') {
  return `<div class="stat">
    <div class="tiny">${escapeHtml(labelText)}</div>
    <div class="value">${escapeHtml(value)}</div>
    <div class="sub">${label(sub, tone)}</div>
  </div>`
}

function posterArt(title, city, colors = ['#2563eb', '#06b6d4', '#7c3aed']) {
  return `<div style="height:158px;border-radius:8px;overflow:hidden;position:relative;color:white;background:
    radial-gradient(circle at 76% 24%, ${colors[1]} 0 8%, transparent 24%),
    radial-gradient(circle at 20% 86%, ${colors[2]} 0 6%, transparent 24%),
    linear-gradient(135deg, ${colors[0]}, ${colors[1]});">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(2,6,23,0.58));"></div>
      <div style="position:absolute;left:16px;right:16px;bottom:16px">
        <div style="font-size:11px;font-weight:850;text-transform:uppercase;opacity:.86">${escapeHtml(city)}</div>
        <div style="font-size:24px;line-height:1.05;font-weight:900;margin-top:4px">${escapeHtml(title)}</div>
      </div>
      <div style="position:absolute;right:16px;top:16px;width:78px;height:78px;border:1px solid rgba(255,255,255,.36);border-radius:50%"></div>
      <div style="position:absolute;right:44px;top:38px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.7)"></div>
    </div>`
}

function eventCard({ title, city, meta, price, labelText = 'On sale', tone = 'blue', colors }) {
  return `<article class="card" style="overflow:hidden">
    ${posterArt(title, city, colors)}
    <div style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">${label(labelText, tone)}<span class="small" style="font-weight:820">${escapeHtml(price)}</span></div>
      <div style="font-size:18px;font-weight:870;margin-top:13px">${escapeHtml(title)}</div>
      <div class="small" style="margin-top:6px">${escapeHtml(meta)}</div>
    </div>
  </article>`
}

function compactEventCard({ title, city, price, labelText = 'On sale', tone = 'blue', colors }) {
  return `<article class="card" style="overflow:hidden">
    ${posterArt(title, city, colors)}
    <div style="padding:13px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="min-width:0">${label(labelText, tone)}<div style="font-size:18px;line-height:1.08;font-weight:900;margin-top:9px">${escapeHtml(title)}</div></div>
      <div class="small" style="font-weight:850;text-align:right">${escapeHtml(price)}</div>
    </div>
  </article>`
}

function lineChart(color = '#2563eb', fill = 'rgba(37,99,235,0.15)') {
  return `<svg viewBox="0 0 520 190" width="100%" height="100%" preserveAspectRatio="none">
    <path d="M0 155 H520M0 112 H520M0 70 H520" stroke="rgba(148,163,184,.23)" stroke-width="1"/>
    <path d="M10 150 C70 104 108 130 154 93 C204 53 252 82 301 52 C357 18 393 44 438 27 C472 15 493 31 512 20" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
    <path d="M10 150 C70 104 108 130 154 93 C204 53 252 82 301 52 C357 18 393 44 438 27 C472 15 493 31 512 20 L512 190 L10 190 Z" fill="${fill}"/>
  </svg>`
}

function bars(values = [0.38, 0.66, 0.58, 0.86, 0.62, 0.94, 0.74], color = '#2563eb') {
  return `<div style="height:126px;display:flex;align-items:end;gap:14px">
    ${values.map((v, i) => `<div style="height:${Math.round(v * 112)}px;flex:1;border-radius:8px 8px 3px 3px;background:${i % 3 === 0 ? '#06b6d4' : color};box-shadow:0 10px 22px rgba(37,99,235,.16)"></div>`).join('')}
  </div>`
}

function qr() {
  const cells = Array.from({ length: 81 }, (_, i) => (i * 7 + Math.floor(i / 9) * 11) % 5 !== 0)
  return `<div style="display:grid;grid-template-columns:repeat(9,1fr);gap:4px;padding:14px;border-radius:8px;background:#fff">
    ${cells.map(on => `<span style="aspect-ratio:1;border-radius:2px;background:${on ? '#0f172a' : '#fff'}"></span>`).join('')}
  </div>`
}

function seatMap({ compact = false, dark = false } = {}) {
  const rows = 8
  const cols = compact ? 9 : 15
  const cells = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const edge = c < 2 || c > cols - 3
      const sold = (r + c) % 11 === 0
      const held = (r * c) % 17 === 0 && r > 1
      const selected = (r === 3 && c >= 5 && c <= 7) || (r === 4 && c === 7)
      const color = selected ? '#2563eb' : held ? '#f59e0b' : sold ? (dark ? '#334155' : '#cbd5e1') : edge ? '#06b6d4' : '#7dd3fc'
      cells.push(`<span style="width:${compact ? 13 : 18}px;height:${compact ? 13 : 18}px;border-radius:${compact ? 4 : 6}px;background:${color};box-shadow:${selected ? '0 0 0 3px rgba(37,99,235,.18)' : 'none'}"></span>`)
    }
  }
  return `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${compact ? 14 : 22}px">
    <div style="width:${compact ? 150 : 360}px;height:${compact ? 28 : 44}px;border-radius:50% 50% 10px 10px;background:${dark ? '#1e3a8a' : '#dbeafe'};color:${dark ? '#dbeafe' : '#1d4ed8'};display:grid;place-items:center;font-size:${compact ? 10 : 12}px;font-weight:900;text-transform:uppercase">Stage</div>
    <div style="display:grid;grid-template-columns:repeat(${cols},${compact ? 13 : 18}px);gap:${compact ? 6 : 8}px">${cells.join('')}</div>
  </div>`
}

function miniCheckout() {
  return `<div class="dark-card" style="padding:18px">
    <div style="display:flex;align-items:center;justify-content:space-between">${label('Hold 07:42','amber')}<strong>4 seats</strong></div>
    <div style="height:10px;border-radius:999px;background:#23334d;margin-top:16px;overflow:hidden"><div style="height:100%;width:64%;background:#60a5fa"></div></div>
    <div class="small" style="margin-top:12px">VIP A, row 10, seats 15-18</div>
  </div>`
}

function brandSystem() {
  return page(
    'Brand System',
    `
    ${browser({
      x: 58,
      y: 94,
      w: 710,
      h: 820,
      children: `
        <div style="height:100%;padding:54px;background:#fff">
          ${brand('light', 52)}
          <div class="h1" style="margin-top:46px;max-width:530px">Blue booking clarity for live events.</div>
          <p class="body" style="max-width:520px;margin-top:22px">A modern ticketing interface that feels energetic for fans and calm for operators.</p>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:44px">
            ${[
              ['#2563eb', 'Primary'],
              ['#06b6d4', 'Realtime'],
              ['#16a34a', 'Success'],
              ['#f59e0b', 'Hold'],
              ['#f43f5e', 'Risk'],
            ].map(([color, name]) => `<div><div style="height:92px;border-radius:8px;background:${color};box-shadow:0 14px 28px ${color}33"></div><div class="tiny" style="margin-top:10px">${name}</div><div class="small">${color}</div></div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:48px">
            <div class="card flat" style="padding:20px">${button('Reserve seats','primary','ticket')}<div class="small" style="margin-top:15px">Primary CTA uses blue only.</div></div>
            <div class="card flat" style="padding:20px">${label('Payment confirmed','green')} ${label('Hold expiring','amber')}<div class="small" style="margin-top:15px">Status color is semantic.</div></div>
          </div>
        </div>`,
    })}
    ${browser({
      x: 832,
      y: 94,
      w: 458,
      h: 820,
      dark: true,
      children: `
        <div style="height:100%;padding:48px;background:#0b1220">
          ${brand('dark', 48)}
          <div class="h2" style="margin-top:40px">Dark mode for launch night.</div>
          <p class="body" style="margin-top:16px">Designed for control rooms, scanner staff, and event-day operators.</p>
          <div style="display:grid;gap:14px;margin-top:36px">
            ${stat('Gross today','4.82B VND','+18%','green')}
            ${miniCheckout()}
            <div class="dark-card" style="padding:18px">
              <div class="tiny">Operator controls</div>
              <div style="display:flex;gap:10px;margin-top:14px">${button('Publish','primary','upload')}${button('Audit','ghost','shield')}</div>
            </div>
          </div>
        </div>`,
    })}
    ${phone({
      x: 1350,
      y: 184,
      w: 204,
      h: 486,
      light: true,
      children: `
        <div style="padding:56px 18px 18px">
          ${brand('light', 34)}
          <div style="font-size:30px;line-height:1.02;font-weight:900;margin-top:34px">Mobile first cards.</div>
          <div style="display:grid;gap:12px;margin-top:26px">
            ${label('Available now','blue')}
            ${button('Get tickets','primary','arrow')}
          </div>
        </div>`,
    })}
  `,
  )
}

function landingPage() {
  return page(
    'Fan Landing',
    `
    ${browser({
      x: 54,
      y: 82,
      w: 1114,
      h: 880,
      children: `
        <div style="height:100%;display:grid;grid-template-rows:auto 1fr;background:#f8fbff">
          <header style="height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 38px;border-bottom:1px solid #e2e8f0;background:rgba(255,255,255,.86)">
            ${brand('light', 38)}
            <nav style="display:flex;align-items:center;gap:28px;color:#475569;font-size:14px;font-weight:780">
              <span>Events</span><span>Venues</span><span>For organizers</span><span>Help</span>
            </nav>
            ${button('Create event','primary','plus')}
          </header>
          <main style="padding:46px 44px 42px;display:grid;grid-template-columns:1.05fr .95fr;gap:36px">
            <section>
              <div class="h1">Find the seat before the beat drops.</div>
              <p class="body" style="font-size:18px;max-width:560px;margin-top:22px">Search concerts, reserve seats with a live hold timer, pay securely, and scan QR tickets at the gate.</p>
              <div style="height:82px;margin-top:34px;border-radius:8px;background:#fff;border:1px solid #dbe4f0;box-shadow:var(--shadow-soft);display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:12px;align-items:center;padding:14px">
                <div class="searchbar">${icon('search')} Artist, event, venue</div>
                <div class="searchbar">${icon('map')} Ho Chi Minh</div>
                <div class="searchbar">${icon('calendar')} This weekend</div>
                ${button('Search','primary','arrow')}
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px">
                ${compactEventCard({ title:'Neon Summer Fest', city:'District 7', price:'from 790K', labelText:'Hot', tone:'rose', colors:['#1d4ed8','#06b6d4','#f43f5e'] })}
                ${compactEventCard({ title:'Vu Live Concert', city:'Thu Duc', price:'from 1.2M', labelText:'Reserved', tone:'blue', colors:['#2563eb','#7c3aed','#06b6d4'] })}
                ${compactEventCard({ title:'Acoustic Rooftop', city:'District 1', price:'from 450K', labelText:'Few left', tone:'amber', colors:['#0f766e','#06b6d4','#f59e0b'] })}
              </div>
            </section>
            <section style="position:relative">
              <div class="card" style="padding:24px;height:100%;background:linear-gradient(180deg,#fff,#f8fbff)">
                <div style="display:flex;align-items:center;justify-content:space-between">${label('Live availability','blue')}<span class="small">Updated 8 sec ago</span></div>
                <div style="height:300px;margin-top:24px">${seatMap({})}</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px">
                  ${stat('Available','1,284','Open','green')}
                  ${stat('Held now','318','08m avg','amber')}
                  ${stat('Sold','5,842','73%','blue')}
                </div>
              </div>
            </section>
          </main>
        </div>`,
    })}
    ${phone({
      x: 1236,
      y: 134,
      w: 292,
      h: 700,
      children: `
        <div style="padding:56px 22px 22px;background:linear-gradient(180deg,#0b1220,#0f172a);height:100%">
          ${brand('dark', 32)}
          <div style="font-size:32px;line-height:1.02;font-weight:900;margin-top:30px">Tonight in HCM</div>
          <div class="searchbar" style="margin-top:22px">${icon('search')} Search shows</div>
          <div style="margin-top:20px">${posterArt('Neon Summer Fest','District 7',['#2563eb','#06b6d4','#f43f5e'])}</div>
          <div style="display:grid;gap:10px;margin-top:18px">
            <div class="dark-card" style="padding:14px;box-shadow:none"><strong>Vu Live Concert</strong><div class="small">Arena - from 1.2M</div></div>
            <div class="dark-card" style="padding:14px;box-shadow:none"><strong>Indie Market Live</strong><div class="small">District 3 - from 390K</div></div>
          </div>
          <div style="position:absolute;left:22px;right:22px;bottom:24px">${button('Explore events','primary','arrow')}</div>
        </div>`,
    })}
  `,
  )
}

function pricingPage() {
  return page(
    'Organizer Pricing',
    `
    ${browser({
      x: 66,
      y: 88,
      w: 1138,
      h: 810,
      children: `
        <div style="height:100%;padding:42px 48px;background:#fff">
          <header style="display:flex;align-items:center;justify-content:space-between">${brand('light',38)}<div style="display:flex;gap:10px"><span class="button secondary">Monthly</span><span class="button light">Annual - save 18%</span></div></header>
          <div style="display:flex;align-items:end;justify-content:space-between;margin-top:52px">
            <div><div class="h1" style="max-width:620px">Sell out without losing control.</div><p class="body" style="max-width:560px;margin-top:18px">Plans for organizers, venues, and festivals that need reliable reservations and clean operations.</p></div>
            <div class="card flat" style="padding:18px;width:282px">${label('No card data stored','green')}<div class="small" style="margin-top:10px">PSP adapters only store references.</div></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:38px">
            ${priceCard('Launch','2.9%','For first campaigns',['1 active event','Basic seat maps','Email tickets','Standard support'],'light')}
            ${priceCard('Scale','1.9%','For growing organizers',['Unlimited events','Reserved seating','Promo/access codes','Realtime dashboard'],'blue')}
            ${priceCard('Venue','Custom','For large venues',['RBAC and audit log','Scanner fleet','Reconciliation','SLA support'],'light')}
          </div>
          <section class="card flat" style="margin-top:28px;padding:22px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
            <div><div class="tiny">Usage forecast</div><div style="font-size:28px;font-weight:900;margin-top:8px">26M inventory rows/year</div></div>
            <div><div class="tiny">Read path</div><div style="font-size:28px;font-weight:900;margin-top:8px">500-2K peak QPS</div></div>
            <div><div class="tiny">Write path</div><div style="font-size:28px;font-weight:900;margin-top:8px">100 reserve QPS/event</div></div>
          </section>
        </div>`,
    })}
    ${phone({
      x: 1266,
      y: 134,
      w: 266,
      h: 676,
      children: `
        <div style="padding:58px 22px 22px;height:100%">
          <div style="font-size:28px;font-weight:900">Scale plan</div>
          <p class="small" style="margin-top:10px">Best for reserved seating launches.</p>
          <div style="font-size:54px;font-weight:900;margin-top:22px">1.9%</div>
          <div class="small">per confirmed ticket</div>
          <div style="display:grid;gap:12px;margin-top:28px">
            ${['Unlimited events','Live hold timer','Scanner seats','Refund controls'].map(x => `<div class="dark-card" style="box-shadow:none;padding:13px">${label('Included','blue')}<div style="font-weight:800;margin-top:8px">${x}</div></div>`).join('')}
          </div>
          <div style="position:absolute;left:22px;right:22px;bottom:26px">${button('Start selling','primary','arrow')}</div>
        </div>`,
    })}
  `,
  )
}

function priceCard(name, price, desc, features, mode) {
  const dark = mode === 'blue'
  return `<article class="${dark ? 'dark-card' : 'card flat'}" style="padding:24px;background:${dark ? 'linear-gradient(180deg,#1d4ed8,#0f2f5f)' : '#fff'}">
    <div style="display:flex;align-items:center;justify-content:space-between"><div style="font-size:22px;font-weight:900">${name}</div>${dark ? label('Popular','blue') : ''}</div>
    <div style="font-size:54px;line-height:1;font-weight:900;margin-top:24px">${price}</div>
    <p class="${dark ? 'small' : 'body'}" style="margin-top:12px;color:${dark ? '#bfdbfe' : ''}">${desc}</p>
    <div style="display:grid;gap:12px;margin-top:24px">
      ${features.map(feature => `<div style="display:flex;gap:10px;align-items:center;font-weight:760;color:${dark ? '#eef5ff' : '#334155'}">${icon('shield')} ${feature}</div>`).join('')}
    </div>
    <div style="margin-top:26px">${button(dark ? 'Choose Scale' : 'Contact sales', dark ? 'ghost' : 'secondary', 'arrow')}</div>
  </article>`
}

function loginPage() {
  return page(
    'Secure Login',
    `
    ${browser({
      x: 90,
      y: 94,
      w: 1082,
      h: 824,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:.95fr 1.05fr;background:#fff">
          <aside style="padding:54px;background:linear-gradient(180deg,#0b1220,#0f2f5f);color:white;position:relative;overflow:hidden">
            ${brand('dark',44)}
            <div class="h1" style="margin-top:70px;max-width:420px">One login for the whole event team.</div>
            <p class="body" style="color:#bfdbfe;max-width:420px;margin-top:22px">Fans, organizers, admins, and staff land in the right workspace after RBAC checks.</p>
            <div style="display:grid;gap:14px;margin-top:42px">
              ${['JWT session with device signals','MFA for admin operations'].map((text, i) => `<div class="dark-card" style="box-shadow:none;padding:16px;background:rgba(15,23,42,.5)">${label(i === 1 ? 'Required' : 'Secure','blue')}<div style="font-weight:820;margin-top:8px">${text}</div></div>`).join('')}
            </div>
          </aside>
          <main style="padding:72px 86px">
            <div class="h2">Welcome back</div>
            <p class="body" style="margin-top:12px">Continue to Pulse Seat with your event workspace.</p>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:34px">
              ${['Fan','Organizer','Admin','Staff'].map((x, i) => `<div class="button ${i === 1 ? 'primary' : 'light'}">${x}</div>`).join('')}
            </div>
            <div style="display:grid;gap:18px;margin-top:34px">
              <label><div class="tiny" style="margin-bottom:8px">Email</div><div class="searchbar">${icon('mail')} ops@vu-live.vn</div></label>
              <label><div class="tiny" style="margin-bottom:8px">Password</div><div class="searchbar">${icon('lock')} ************</div></label>
              <div style="display:flex;align-items:center;justify-content:space-between"><span class="small">Remember this device</span><span class="small" style="color:#1d4ed8;font-weight:820">Forgot password?</span></div>
              ${button('Sign in to dashboard','primary','arrow')}
            </div>
            <div class="card flat" style="margin-top:34px;padding:20px;display:flex;align-items:center;justify-content:space-between">
              <div><strong>Scanner staff?</strong><div class="small">Use event code and device passkey.</div></div>
              ${button('Gate login','secondary','scan')}
            </div>
          </main>
        </div>`,
    })}
    ${phone({
      x: 1260,
      y: 148,
      w: 268,
      h: 646,
      light: true,
      children: `
        <div style="padding:58px 22px 22px">
          ${brand('light',34)}
          <div style="font-size:32px;line-height:1.05;font-weight:900;margin-top:38px">Sign in</div>
          <div style="display:grid;gap:12px;margin-top:28px">
            <div class="searchbar">${icon('mail')} Email</div>
            <div class="searchbar">${icon('lock')} Password</div>
          </div>
          <div style="display:grid;gap:10px;margin-top:24px">${button('Continue','primary','arrow')}${button('Use passkey','light','shield')}</div>
          <div class="card flat" style="padding:14px;margin-top:30px"><strong>Last workspace</strong><div class="small">Vu Live Concert ops</div></div>
        </div>`,
    })}
  `,
  )
}

function discoveryPage() {
  return page(
    'Fan Discovery',
    `
    ${browser({
      x: 52,
      y: 88,
      w: 1154,
      h: 828,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:258px 1fr;background:#f8fbff">
          <aside style="padding:36px 26px;border-right:1px solid #e2e8f0;background:#fff">
            ${brand('light',36)}
            <div class="searchbar" style="margin-top:38px">${icon('search')} Search events</div>
            <div class="tiny" style="margin-top:30px">Filters</div>
            <div style="display:grid;gap:12px;margin-top:14px">
              ${['Ho Chi Minh','This month','Concert','Available only','450K - 2M'].map((x, i) => `<div class="searchbar">${icon(i === 1 ? 'calendar' : i === 3 ? 'ticket' : 'filter')} ${x}</div>`).join('')}
            </div>
            <div class="card flat" style="padding:16px;margin-top:28px;background:#e8f1ff"><strong>Cached discovery</strong><div class="small" style="margin-top:6px">Availability is a signal. Reserve checks PostgreSQL.</div></div>
          </aside>
          <main style="padding:34px 38px">
            <div style="display:flex;align-items:end;justify-content:space-between"><div><div class="h2">Events in Ho Chi Minh</div><p class="body">24 shows match your filters.</p></div>${button('Map view','secondary','map')}</div>
            <section style="display:grid;grid-template-columns:1.1fr .9fr;gap:18px;margin-top:28px">
              <div class="card flat" style="padding:18px;display:grid;grid-template-columns:260px 1fr;gap:20px">${posterArt('Neon Summer Fest','District 7',['#2563eb','#06b6d4','#f43f5e'])}<div><div style="display:flex;gap:10px">${label('Selling fast','rose')}${label('Reserved seats','blue')}</div><div class="h3" style="margin-top:22px">Neon Summer Fest</div><p class="body">SECC - Sat, Jun 20 - 20:00</p><div style="display:flex;gap:12px;margin-top:18px">${button('Choose seats','primary','ticket')}${button('Details','light','arrow')}</div></div></div>
              <div class="card flat" style="padding:18px"><div class="tiny">Availability by tier</div><div style="display:grid;gap:12px;margin-top:18px">${['VIP A 42 left','Standard 1,204 left','Fanclub code only'].map((x,i)=>`<div style="display:flex;align-items:center;justify-content:space-between"><strong>${x}</strong>${label(i===0?'Few left':i===1?'Open':'Locked',i===0?'amber':i===1?'green':'violet')}</div>`).join('')}</div></div>
            </section>
            <section style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:22px">
              ${eventCard({ title:'Vu Live Concert', city:'Thu Duc', meta:'Sun, Jun 28 - Arena', price:'from 1.2M', labelText:'Open', tone:'green', colors:['#1d4ed8','#7c3aed','#06b6d4'] })}
              ${eventCard({ title:'Acoustic Rooftop', city:'District 1', meta:'Fri, Jul 03 - Rooftop', price:'from 450K', labelText:'Few left', tone:'amber', colors:['#0f766e','#06b6d4','#f59e0b'] })}
              ${eventCard({ title:'Indie Market Live', city:'District 3', meta:'Sat, Jul 11 - Hall B', price:'from 390K', labelText:'New', tone:'blue', colors:['#2563eb','#38bdf8','#16a34a'] })}
            </section>
          </main>
        </div>`,
    })}
    ${phone({
      x: 1268,
      y: 126,
      w: 264,
      h: 704,
      light: true,
      children: `
        <div style="padding:58px 20px 20px">
          <div style="font-size:28px;font-weight:900">Discover</div>
          <div class="searchbar" style="margin-top:18px">${icon('search')} Artists, venues</div>
          <div style="display:flex;gap:8px;margin-top:14px">${label('HCM','blue')}${label('Weekend','green')}</div>
          <div style="display:grid;gap:14px;margin-top:20px">
            ${eventCard({ title:'Neon Summer', city:'District 7', meta:'Sat - SECC', price:'790K+', labelText:'Hot', tone:'rose', colors:['#2563eb','#06b6d4','#f43f5e'] })}
            ${eventCard({ title:'Vu Live', city:'Thu Duc', meta:'Sun - Arena', price:'1.2M+', labelText:'Open', tone:'green', colors:['#1d4ed8','#7c3aed','#06b6d4'] })}
          </div>
        </div>`,
    })}
  `,
  )
}

function eventDetailSeatMap() {
  return page(
    'Event Detail And Seat Map',
    `
    ${browser({
      x: 54,
      y: 76,
      w: 1200,
      h: 900,
      dark: true,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:1fr 342px;background:#0b1220">
          <main style="padding:36px 40px">
            <div style="display:flex;align-items:center;justify-content:space-between">${brand('dark',36)}<div style="display:flex;gap:10px">${label('Live availability','blue')}${label('Hold timer enabled','amber')}</div></div>
            <section style="display:grid;grid-template-columns:1.02fr .98fr;gap:24px;margin-top:34px">
              <div>
                <div class="h1" style="font-size:62px">Vu Live Concert</div>
                <p class="body" style="font-size:17px;margin-top:18px">Arena Thu Duc - Sun, Jun 28 - Doors 18:00</p>
                <div style="display:flex;gap:12px;margin-top:24px">${button('Reserve selected','primary','ticket')}${button('Best available','ghost','sparkles')}</div>
                <div class="dark-card" style="padding:20px;margin-top:28px">${miniCheckout()}</div>
              </div>
              <div class="dark-card" style="padding:22px">${posterArt('Vu Live Concert','Thu Duc Arena',['#2563eb','#7c3aed','#06b6d4'])}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px">${stat('Sold','5,842','73%','blue')}${stat('Held','318','07:42','amber')}${stat('Left','1,284','Open','green')}</div></div>
            </section>
            <section class="dark-card" style="height:290px;margin-top:26px;padding:24px">${seatMap({ dark: true })}</section>
          </main>
          <aside style="border-left:1px solid #25334a;padding:36px 28px;background:#09111f">
            <div class="h3">Ticket tiers</div>
            <div style="display:grid;gap:14px;margin-top:24px">
              ${tierRow('VIP A','2.500.000 VND','42','amber')}
              ${tierRow('Standard','1.200.000 VND','1,204','green')}
              ${tierRow('Fanclub','900.000 VND','Code','violet')}
              ${tierRow('Balcony','650.000 VND','Sold','rose')}
            </div>
            <div class="dark-card" style="padding:18px;margin-top:28px;box-shadow:none"><div class="tiny">Selected seats</div><div style="font-size:28px;font-weight:900;margin-top:8px">A-10-15, A-10-16</div><div class="small" style="margin-top:8px">Reserve will re-check source of truth.</div></div>
            <div style="position:absolute;right:28px;bottom:30px;width:286px">${button('Continue checkout','primary','arrow')}</div>
          </aside>
        </div>`,
    })}
    ${phone({
      x: 1280,
      y: 142,
      w: 250,
      h: 660,
      children: `
        <div style="padding:58px 20px 20px">
          <div style="font-size:29px;font-weight:900">Choose seats</div>
          <div style="height:230px;margin-top:22px">${seatMap({ compact:true, dark:true })}</div>
          <div style="display:grid;gap:10px;margin-top:18px">
            ${tierRow('VIP A','2.5M','42 left','amber')}
            ${tierRow('Standard','1.2M','Open','green')}
          </div>
          <div style="position:absolute;left:20px;right:20px;bottom:22px">${button('Hold 2 seats','primary','ticket')}</div>
        </div>`,
    })}
  `,
    'dark',
  )
}

function tierRow(name, price, sub, tone) {
  return `<div class="dark-card" style="padding:15px;box-shadow:none;display:flex;align-items:center;justify-content:space-between;gap:12px;overflow:hidden">
    <div style="min-width:0"><strong>${name}</strong><div class="small">${price}</div></div>${label(sub, tone)}
  </div>`
}

function checkoutTicket() {
  return page(
    'Checkout And Ticket Wallet',
    `
    ${browser({
      x: 58,
      y: 92,
      w: 1128,
      h: 812,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:1fr 386px;background:#f8fbff">
          <main style="padding:40px 44px">
            ${brand('light',38)}
            <div style="display:flex;align-items:end;justify-content:space-between;margin-top:38px"><div><div class="h2">Checkout</div><p class="body">Complete payment before the reservation expires.</p></div><div class="card flat" style="padding:16px">${label('Hold expires in 07:42','amber')}</div></div>
            <section class="card flat" style="padding:24px;margin-top:30px">
              <div class="h3">Buyer details</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">
                <div class="searchbar">${icon('user')} Nguyen Minh Anh</div>
                <div class="searchbar">${icon('mail')} minh.anh@example.com</div>
                <div class="searchbar">${icon('phone')} +84 900 123 456</div>
                <div class="searchbar">${icon('ticket')} 2 tickets</div>
              </div>
            </section>
            <section class="card flat" style="padding:24px;margin-top:22px">
              <div class="h3">Payment method</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:18px">
                <div class="button secondary">Card</div><div class="button light">MoMo</div><div class="button light">ZaloPay</div>
              </div>
              <div style="display:grid;gap:14px;margin-top:18px">
                <div class="searchbar">${icon('wallet')} **** **** **** 4242</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="searchbar">MM / YY</div><div class="searchbar">CVC</div></div>
              </div>
            </section>
          </main>
          <aside style="padding:40px 30px;background:#fff;border-left:1px solid #e2e8f0">
            <div class="h3">Order summary</div>
            <div style="display:grid;gap:14px;margin-top:24px">
              ${summaryRow('Event','Vu Live Concert')}
              ${summaryRow('Seats','A-10-15, A-10-16')}
              ${summaryRow('Subtotal','5.000.000 VND')}
              ${summaryRow('Service fee','150.000 VND')}
            </div>
            <div style="height:1px;background:#e2e8f0;margin:24px 0"></div>
            <div style="display:flex;align-items:center;justify-content:space-between"><strong>Total</strong><span style="font-size:28px;font-weight:900">5.150.000</span></div>
            <div class="card flat" style="padding:16px;margin-top:24px;background:#e8f1ff">${label('Idempotency protected','blue')}<div class="small" style="margin-top:8px">Payment success confirms the booking once.</div></div>
            <div style="position:absolute;right:30px;bottom:34px;width:326px">${button('Pay and issue tickets','primary','arrow')}</div>
          </aside>
        </div>`,
    })}
    ${phone({
      x: 1260,
      y: 124,
      w: 270,
      h: 704,
      children: `
        <div style="padding:58px 22px 22px;height:100%">
          <div style="font-size:28px;font-weight:900">Ticket wallet</div>
          <div class="dark-card" style="padding:18px;margin-top:24px;background:linear-gradient(180deg,#1d4ed8,#0f2f5f)">
            ${qr()}
            <div style="font-size:22px;font-weight:900;margin-top:18px">Vu Live Concert</div>
            <div class="small" style="color:#bfdbfe">A / Row 10 / Seat 15</div>
          </div>
          <div style="display:grid;gap:12px;margin-top:18px">
            <div class="dark-card" style="padding:14px;box-shadow:none">${label('Issued','green')}<div class="small">ticket_9d92 confirmed</div></div>
            <div class="dark-card" style="padding:14px;box-shadow:none">${label('Signed QR','blue')}<div class="small">Replay protected at gate</div></div>
          </div>
          <div style="position:absolute;left:22px;right:22px;bottom:24px">${button('Open QR','primary','scan')}</div>
        </div>`,
    })}
  `,
  )
}

function summaryRow(k, v) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:18px"><span class="small">${k}</span><strong style="text-align:right">${v}</strong></div>`
}

function organizerDashboard() {
  return page(
    'Organizer Dashboard',
    `
    ${browser({
      x: 54,
      y: 76,
      w: 1186,
      h: 900,
      dark: true,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:246px 1fr;background:#0b1220">
          <aside style="padding:34px 24px;border-right:1px solid #25334a;background:#09111f">
            ${brand('dark',36)}
            <nav style="display:grid;gap:8px;margin-top:42px">${nav([['Overview','chart'],['Events','calendar'],['Seat maps','seats'],['Reservations','ticket'],['Payments','wallet'],['Scanners','scan'],['Settings','settings']],0)}</nav>
          </aside>
          <main style="padding:34px 40px">
            <div style="display:flex;align-items:end;justify-content:space-between"><div><div class="h2">Organizer dashboard</div><p class="body">Vu Live Concert - performance Jul 20</p></div>${button('Open scanner','primary','scan')}</div>
            <section style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px">
              ${stat('Gross sales','4.82B VND','+18%','green')}
              ${stat('Sold','5,842','73%','blue')}
              ${stat('Held now','318','06m avg','amber')}
              ${stat('Check-ins','1,224','Gate A hot','violet')}
            </section>
            <section style="display:grid;grid-template-columns:1.35fr .85fr;gap:18px;margin-top:22px">
              <div class="dark-card" style="padding:22px"><div class="h3">Sales velocity</div><div style="height:145px;margin-top:16px">${lineChart('#60a5fa','rgba(37,99,235,.18)')}</div></div>
              <div class="dark-card" style="padding:22px"><div class="h3">Channel mix</div><div style="margin-top:24px">${bars([.44,.68,.55,.84,.62,.94,.74],'#3b82f6')}</div></div>
            </section>
            <section class="dark-card" style="padding:20px;margin-top:22px">
              <div style="display:flex;align-items:center;justify-content:space-between"><div class="h3">Reservation health</div>${label('Source of truth','blue')}</div>
              <table class="table" style="margin-top:20px">
                <thead><tr><th>ID</th><th>Status</th><th>Inventory</th><th style="text-align:right">TTL</th></tr></thead>
                <tbody>
                  <tr><td>rsv_123</td><td>${label('Held','amber')}</td><td>2 VIP A seats</td><td style="text-align:right">06:42</td></tr>
                  <tr><td>rsv_124</td><td>${label('Confirmed','green')}</td><td>4 Standard tickets</td><td style="text-align:right">paid</td></tr>
                  <tr><td>rsv_125</td><td>${label('Conflict','rose')}</td><td>A-10-17 - suggested A-10-18</td><td style="text-align:right">retry</td></tr>
                </tbody>
              </table>
            </section>
          </main>
        </div>`,
    })}
    ${phone({
      x: 1302,
      y: 132,
      w: 238,
      h: 650,
      light: true,
      children: `
        <div style="padding:58px 20px 20px">
          <div style="font-size:28px;font-weight:900">Today</div>
          <div style="display:grid;gap:12px;margin-top:24px">${stat('Gross','4.82B','+18%','green')}${stat('Check-ins','1,224','Gate A','blue')}</div>
          <div style="height:128px;margin-top:30px">${lineChart('#2563eb','rgba(37,99,235,.13)')}</div>
          <div style="position:absolute;left:20px;right:20px;bottom:24px">${button('Scanner','primary','scan')}</div>
        </div>`,
    })}
  `,
    'dark',
  )
}

function seatMapBuilder() {
  return page(
    'Seat Map Builder',
    `
    ${browser({
      x: 58,
      y: 90,
      w: 1198,
      h: 822,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:82px 1fr 306px;background:#f8fbff">
          <aside style="background:#0b1220;padding:38px 18px;display:grid;gap:14px;align-content:start">
            ${['search','seats','plus','calendar','ticket','settings'].map((name, i) => `<div class="toolbar-button ${i === 1 ? 'active' : ''}">${icon(name)}</div>`).join('')}
          </aside>
          <main style="padding:36px 32px">
            <div style="display:flex;align-items:end;justify-content:space-between"><div>${brand('light',36)}<div class="h2" style="margin-top:34px">Seat map builder</div><p class="body">Create sections, rows, seats, holds, and tier assignment.</p></div>${button('Publish map v4','primary','upload')}</div>
            <section class="card flat" style="height:534px;margin-top:26px;padding:28px;background:#fff">
              <div style="height:100%;border:1px solid #dbe4f0;border-radius:8px;background:#f8fbff;padding:28px;position:relative">
                ${seatMap({})}
                <div style="position:absolute;left:24px;bottom:22px;display:flex;gap:10px">${label('VIP A selected','blue')}${label('Sponsor hold','amber')}${label('Unsaved changes','rose')}</div>
              </div>
            </section>
          </main>
          <aside style="border-left:1px solid #e2e8f0;background:#fff;padding:36px 28px">
            <div class="h3">Inspector</div>
            <div style="margin-top:12px">${label('Section selected','blue')}</div>
            ${[
              ['Name','VIP A'],
              ['Type','Reserved seating'],
              ['Tier','VIP - 2.5M VND'],
              ['Capacity','186 seats'],
              ['Hold rule','Sponsor + Staff'],
            ].map(([k,v])=>`<label style="display:block;margin-top:22px"><div class="tiny" style="margin-bottom:8px">${k}</div><div class="searchbar">${v}</div></label>`).join('')}
            <div style="position:absolute;right:28px;bottom:30px;width:250px">${button('Save changes','primary')}</div>
          </aside>
        </div>`,
    })}
    ${phone({
      x: 1320,
      y: 156,
      w: 218,
      h: 536,
      children: `
        <div style="padding:56px 18px 18px">
          <div style="font-size:24px;font-weight:900">Map v4</div>
          <div style="margin-top:20px;height:190px">${seatMap({ compact:true, dark:true })}</div>
          <div style="display:grid;gap:10px;margin-top:18px">
            <div class="dark-card" style="padding:12px;box-shadow:none"><strong>VIP A</strong><div class="small">186 seats</div></div>
            <div class="dark-card" style="padding:12px;box-shadow:none"><strong>Hold rule</strong><div class="small">Sponsor + Staff</div></div>
          </div>
          <div style="position:absolute;left:18px;right:18px;bottom:20px">${button('Publish','primary','upload')}</div>
        </div>`,
    })}
  `,
  )
}

function adminOpsScanner() {
  return page(
    'Admin Ops And Scanner',
    `
    ${browser({
      x: 56,
      y: 76,
      w: 1102,
      h: 900,
      children: `
        <div style="height:100%;display:grid;grid-template-columns:226px 1fr;background:#f8fbff">
          <aside style="background:#fff;border-right:1px solid #e2e8f0;padding:34px 24px">
            ${brand('light',36)}
            <nav style="display:grid;gap:8px;margin-top:42px">${nav([['Platform','shield'],['Organizers','ticket'],['Events','calendar'],['Payments','wallet'],['Risk rules','bolt'],['Audit log','settings']],0)}</nav>
          </aside>
          <main style="padding:34px 38px">
            <div style="display:flex;align-items:end;justify-content:space-between"><div><div class="h2">Admin operations</div><p class="body">RBAC, audit, reconciliation, and incident visibility.</p></div>${button('Create rule','primary','plus')}</div>
            <section class="card flat" style="padding:20px;margin-top:28px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
              ${stat('Checkout degraded','No','Healthy','green')}
              ${stat('Outbox lag','1.8s','Normal','blue')}
              ${stat('Refund queue','12','Watch','amber')}
              ${stat('Risk blocks','48','Spike','rose')}
            </section>
            <section class="card flat" style="padding:24px;margin-top:22px">
              <div class="h3">Events requiring attention</div>
              <table class="table" style="margin-top:20px">
                <thead><tr><th>ID</th><th>Event</th><th>Signal</th><th style="text-align:right">Action</th></tr></thead>
                <tbody>
                  <tr><td>evt_123</td><td>Vu Live Concert</td><td>${label('High contention','amber')}</td><td style="text-align:right">Rate limit normal</td></tr>
                  <tr><td>evt_204</td><td>Neon Summer Fest</td><td>${label('PSP spike','rose')}</td><td style="text-align:right">Reconcile</td></tr>
                  <tr><td>evt_310</td><td>Acoustic Rooftop</td><td>${label('Media sync','blue')}</td><td style="text-align:right">Retry queued</td></tr>
                  <tr><td>evt_418</td><td>Indie Market</td><td>${label('Duplicate scans','rose')}</td><td style="text-align:right">Watch Gate B</td></tr>
                </tbody>
              </table>
            </section>
            <section class="dark-card" style="padding:22px;margin-top:22px">
              <div class="h3">Audit stream</div>
              <div class="small" style="margin-top:14px">price_tier.updated -> seat_map.v4.published -> ticket.voided -> payout.changed</div>
            </section>
          </main>
        </div>`,
    })}
    ${phone({
      x: 1248,
      y: 116,
      w: 294,
      h: 712,
      children: `
        <div style="padding:58px 24px 24px">
          <div style="font-size:28px;font-weight:900">Gate scanner</div>
          <div style="width:196px;margin:30px auto 0">${qr()}</div>
          <div style="margin-top:24px;border-radius:8px;background:#083d2c;border:1px solid #0f7a55;padding:16px">
            <div style="font-size:13px;font-weight:900;color:#86efac">ACCEPTED</div>
            <div style="font-weight:800;margin-top:7px">A / Row 10 / Seat 15</div>
          </div>
          <div style="margin-top:12px;border-radius:8px;background:#4a1520;border:1px solid #7f1d1d;padding:16px">
            <div style="font-size:13px;font-weight:900;color:#fecdd3">DUPLICATE</div>
            <div class="small" style="color:#fecdd3;margin-top:7px">First scan 18:10 - Gate A</div>
          </div>
          <div style="position:absolute;left:24px;right:24px;bottom:28px">${button('Manual lookup','primary','search')}</div>
        </div>`,
    })}
  `,
  )
}

function renderMarkdown() {
  return `# Pulse Seat UI Mockups

Source design: [docs/pulse-seat-system-design.md](../pulse-seat-system-design.md)

This folder contains the regenerated Pulse Seat UI mockups. The direction is blue-first, modern SaaS, and booking-oriented: fast discovery for fans, strong reservation feedback, calm operator dashboards, and dark-mode surfaces for event-day workflows.

## Design Direction

- Brand: primary blue with cyan, green, amber, rose, and violet accents for semantic states.
- UI system: Inter/system typography, 8px component radius, compact tables, clear status chips, and high-contrast light/dark modes.
- Responsive coverage: each major flow includes a desktop surface plus a mobile or dark-mode companion state.
- Product scope: landing, pricing, auth, discovery, event detail, seat selection, checkout, ticket wallet, organizer analytics, seat-map building, admin operations, and scanner workflows.

## Suggested Next.js Route Map

| Area | Route |
|---|---|
| Landing | \`app/(marketing)/page.tsx\` |
| Pricing | \`app/(marketing)/pricing/page.tsx\` |
| Login | \`app/(auth)/login/page.tsx\` |
| Fan discovery | \`app/(fan)/events/page.tsx\` |
| Event detail + seat map | \`app/(fan)/events/[eventId]/page.tsx\` |
| Checkout | \`app/(fan)/checkout/[reservationId]/page.tsx\` |
| Ticket wallet | \`app/(fan)/tickets/page.tsx\` |
| Organizer dashboard | \`app/(organizer)/dashboard/page.tsx\` |
| Seat map builder | \`app/(organizer)/seat-maps/[seatMapId]/page.tsx\` |
| Admin operations | \`app/(admin)/page.tsx\` |
| Staff scanner | \`app/(staff)/scanner/page.tsx\` |

## Generated Screens

${screens
  .map(
    (screen, index) => `### ${index + 1}. ${screen.title}

${screen.subtitle}

![Pulse Seat ${screen.title}](pulse-seat-ui-mockups/${screen.file}.png)
`,
  )
  .join('\n')}

## Reference Patterns

- Booking apps: event discovery, search-first layout, reserved seating context, ticket wallet, and QR check-in.
- Stripe, Linear, Vercel, and Retool-style SaaS: compact navigation, dense dashboards, restrained surfaces, status clarity, and dark-mode operations.
- Ticketing systems: TTL reservation holds, conflict-aware seat selection, payment confirmation, QR issuance, duplicate scan handling, and auditability.
`
}

for (const screen of screens) {
  writeFileSync(join(root, `${screen.file}.html`), screen.html(), 'utf8')
}

writeFileSync(join(root, '..', 'pulse-seat-ui-mockups.md'), renderMarkdown(), 'utf8')
