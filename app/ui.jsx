// Design tokens + UI primitives for the hi-fi prototype.
// Tone: dense internal tool. Off-white surfaces, warm ink, single accent.

const UI = {
  bg:        '#f7f5f0',   // app canvas
  panel:     '#ffffff',   // primary surfaces
  panel2:    '#fbfaf7',   // secondary surfaces / table headers
  panel3:    '#f1ede5',   // tertiary (hovered rows, chip bg)
  ink:       '#1a1816',
  ink2:      '#3d3a35',
  muted:     '#7a756d',
  faint:     '#a8a39a',
  line:      '#e6e1d6',
  line2:     '#efece4',
  lineStrong:'#cfc9bc',
  accent:    '#c4513a',
  accentBg:  '#fbe9e4',
  accentInk: '#8a3525',
  ok:        '#3a6f4a',
  okBg:      '#e2ecdf',
  warn:      '#a47326',
  warnBg:    '#f6ead0',
  info:      '#4a6da7',
  infoBg:    '#e2eaf5',
  // topics
  topic: {
    business:   { c: '#a04020', bg: '#f7e3da' },
    meditation: { c: '#3f5a72', bg: '#dfe7ee' },
    'martial-arts': { c: '#4d6b34', bg: '#e3ecd9' },
  },
  font: '"Inter Tight", "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
  display: '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
};

// CSS reset / globals injected once.
if (!document.getElementById('ui-globals')) {
  const s = document.createElement('style');
  s.id = 'ui-globals';
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;background:${UI.bg};color:${UI.ink};
      font-family:${UI.font};font-size:13px;line-height:1.45;
      -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
      font-feature-settings:"cv11","ss01";}
    input,button,select,textarea{font:inherit;color:inherit}
    button{cursor:pointer;background:none;border:none;padding:0}
    a{color:inherit;text-decoration:none}
    .mono{font-family:${UI.mono};font-variant-numeric:tabular-nums}
    .scroll{overflow:auto}
    .scroll::-webkit-scrollbar{width:10px;height:10px}
    .scroll::-webkit-scrollbar-thumb{background:${UI.line};border-radius:6px;border:2px solid ${UI.bg}}
    .scroll::-webkit-scrollbar-thumb:hover{background:${UI.lineStrong}}
    .row-hover:hover{background:${UI.panel2}}
    .clickable{cursor:pointer;transition:background .12s}
    .clickable:hover{background:${UI.panel3}}
    .focus-ring:focus-visible{outline:2px solid ${UI.accent};outline-offset:2px;border-radius:4px}
    .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pulse{animation:ui-pulse 1.4s ease-in-out infinite}
    @keyframes ui-pulse{0%,100%{opacity:1}50%{opacity:.55}}
    .blink{animation:ui-blink 1.1s steps(1,end) infinite}
    @keyframes ui-blink{50%{opacity:0}}
    .fade-in{animation:ui-fade .2s ease-out}
    @keyframes ui-fade{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:none}}
    .slide-in-right{animation:ui-slide-right .22s cubic-bezier(.2,.7,.3,1)}
    @keyframes ui-slide-right{from{transform:translateX(12px);opacity:0}to{transform:none;opacity:1}}
    .pop-in{animation:ui-pop .18s cubic-bezier(.2,.8,.3,1.05)}
    @keyframes ui-pop{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}
    .spin{animation:ui-spin 1s linear infinite}
    @keyframes ui-spin{to{transform:rotate(360deg)}}
    [data-tip]{position:relative}
    [data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;
      transform:translateX(-50%);background:${UI.ink};color:#fff;font-size:11px;padding:4px 8px;
      border-radius:4px;white-space:nowrap;z-index:50;pointer-events:none}
  `;
  document.head.appendChild(s);
}

// ── Buttons ───────────────────────────────────────────────────
function Btn({ kind = 'default', size = 'md', icon, suffix, children, onClick, disabled, style, title, active }) {
  const pad = size === 'sm' ? '5px 9px' : size === 'lg' ? '9px 16px' : '7px 12px';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;
  const palettes = {
    default:  { bg: UI.panel, fg: UI.ink, br: UI.line, hbg: UI.panel2 },
    primary:  { bg: UI.ink, fg: '#fff', br: UI.ink, hbg: '#2c2823' },
    accent:   { bg: UI.accent, fg: '#fff', br: UI.accent, hbg: '#a8442f' },
    ghost:    { bg: 'transparent', fg: UI.ink, br: 'transparent', hbg: UI.panel3 },
    soft:     { bg: UI.panel3, fg: UI.ink, br: 'transparent', hbg: UI.line },
    danger:   { bg: UI.panel, fg: UI.accent, br: UI.line, hbg: UI.accentBg },
  };
  const p = palettes[kind] || palettes.default;
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const e = () => { el.style.background = p.hbg; };
    const l = () => { el.style.background = active ? p.hbg : p.bg; };
    el.addEventListener('mouseenter', e); el.addEventListener('mouseleave', l);
    return () => { el.removeEventListener('mouseenter', e); el.removeEventListener('mouseleave', l); };
  }, [p.hbg, p.bg, active]);
  return (
    <button ref={ref} onClick={disabled ? undefined : onClick} disabled={disabled} title={title}
      className="focus-ring"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: pad,
        background: active ? p.hbg : p.bg, color: p.fg, border: `1px solid ${p.br}`,
        borderRadius: 6, fontSize: fs, fontWeight: 500, letterSpacing: -0.1,
        opacity: disabled ? 0.5 : 1, transition: 'background .12s, transform .08s',
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(0.5px)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>
      {icon}{children}{suffix}
    </button>
  );
}

// ── Pills / badges ────────────────────────────────────────────
function Pill({ children, tone = 'neutral', size = 'md', icon, style, onClick, title }) {
  const tones = {
    neutral:    { bg: UI.panel2,   fg: UI.ink2,    br: UI.line },
    soft:       { bg: UI.panel3,   fg: UI.ink2,    br: 'transparent' },
    accent:     { bg: UI.accentBg, fg: UI.accentInk, br: 'transparent' },
    ok:         { bg: UI.okBg,     fg: UI.ok,      br: 'transparent' },
    warn:       { bg: UI.warnBg,   fg: UI.warn,    br: 'transparent' },
    info:       { bg: UI.infoBg,   fg: UI.info,    br: 'transparent' },
    ghost:      { bg: 'transparent', fg: UI.muted, br: UI.line },
    contrast:   { bg: UI.ink, fg: '#fff', br: UI.ink },
  };
  const p = tones[tone] || tones.neutral;
  const fs = size === 'sm' ? 10.5 : 11.5;
  const pad = size === 'sm' ? '2px 6px' : '3px 8px';
  return (
    <span onClick={onClick} title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: pad,
      background: p.bg, color: p.fg, border: `1px solid ${p.br}`,
      borderRadius: 999, fontSize: fs, fontWeight: 500, lineHeight: 1.2,
      cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', ...style,
    }}>{icon}{children}</span>
  );
}

// ── Topic chip — uses topic-specific colors ──────────────────
function TopicChip({ topicId, size = 'md', dotOnly, onClick }) {
  const topics = window.DATA?.topics || [];
  const t = topics.find(x => x.id === topicId);
  if (!t) return null;
  const palette = UI.topic[topicId] || { c: UI.ink2, bg: UI.panel3 };
  if (dotOnly) return <span style={{ width: 8, height: 8, borderRadius: 4, background: palette.c, display: 'inline-block' }} />;
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      background: palette.bg, color: palette.c, borderRadius: 4,
      fontSize: size === 'sm' ? 10.5 : 11.5, fontWeight: 500, lineHeight: 1.2,
      cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: palette.c }} />
      {t.name}
    </span>
  );
}

// ── Caption status pill ───────────────────────────────────────
function CaptionPill({ status, size = 'md' }) {
  if (status === 'final') return <Pill tone="ok" size={size} icon={<Icon name="check" size={11} />}>final</Pill>;
  if (status === 'draft') return <Pill tone="warn" size={size}>draft</Pill>;
  return <Pill tone="accent" size={size}>empty</Pill>;
}

function ExportPill({ status, size = 'md' }) {
  if (status === 'exported') return <Pill tone="ok" size={size}>exported</Pill>;
  return <Pill tone="ghost" size={size}>—</Pill>;
}

// ── Field ─────────────────────────────────────────────────────
function Field({ value, onChange, placeholder, prefix, suffix, w, sm, type = 'text', autoFocus, onKeyDown, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: sm ? '3px 8px' : '6px 10px',
      background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 6,
      width: w, transition: 'border-color .12s, box-shadow .12s', ...style,
    }}>
      {prefix}
      <input value={value || ''} onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder} type={type} autoFocus={autoFocus} onKeyDown={onKeyDown}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: sm ? 12 : 13, minWidth: 0, padding: 0, color: UI.ink,
        }} />
      {suffix}
    </span>
  );
}

// ── Card / Panel / Section header ─────────────────────────────
function Card({ children, style, padding = 14 }) {
  return <div style={{ background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 8, padding, ...style }}>{children}</div>;
}

function ScreenHeader({ title, sub, children, style }) {
  return (
    <div style={{
      padding: '16px 24px 14px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: `1px solid ${UI.line}`, background: UI.panel, flexShrink: 0, ...style,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.4 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: UI.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
    </div>
  );
}

function Toolbar({ children, style }) {
  return (
    <div style={{
      padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      borderBottom: `1px solid ${UI.line2}`, background: UI.panel2, flexShrink: 0, ...style,
    }}>{children}</div>
  );
}

// ── Drawer (right side slide-over) ────────────────────────────
function Drawer({ open, onClose, width = 460, children }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div onClick={onClose} className="fade-in"
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.2)' }} />
      <div className="slide-in-right" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width,
        background: UI.panel, borderLeft: `1px solid ${UI.line}`,
        boxShadow: '-16px 0 40px rgba(20,16,12,.12)',
        display: 'flex', flexDirection: 'column',
      }}>{children}</div>
    </div>, document.body
  );
}

function Modal({ open, onClose, width = 560, children }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} className="fade-in"
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.32)', backdropFilter: 'blur(2px)' }} />
      <div className="pop-in" style={{
        position: 'relative', width, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 80px)',
        background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 10,
        boxShadow: '0 32px 64px rgba(20,16,12,.22)', display: 'flex', flexDirection: 'column',
      }}>{children}</div>
    </div>, document.body
  );
}

// ── Media tile / thumbnail placeholder ────────────────────────
function MediaThumb({ asset, size = 40, withIcon = true }) {
  const isVideo = asset?.type === 'video';
  const hashSeed = (asset?.id || 'a000').slice(1);
  const hue = (parseInt(hashSeed, 36) % 60) + 20; // warm range
  const sat = isVideo ? 12 : 22;
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, flexShrink: 0, position: 'relative',
      background: `linear-gradient(135deg, hsl(${hue} ${sat}% 88%), hsl(${(hue + 30) % 360} ${sat - 4}% 78%))`,
      border: `1px solid ${UI.line}`, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* subtle diagonal lines */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <line x1="0" y1={size} x2={size} y2="0" stroke={UI.ink2} strokeWidth="0.5" />
      </svg>
      {withIcon && (
        <div style={{
          width: size * 0.45, height: size * 0.45, borderRadius: 999, background: 'rgba(255,255,255,.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Icon name={isVideo ? 'video' : 'image'} size={Math.max(10, size * 0.26)} color={UI.ink2} stroke={1.4} />
        </div>
      )}
    </div>
  );
}

// ── Tiny separator dot ────────────────────────────────────────
function Sep({ s = 6 }) { return <span style={{ color: UI.faint, fontSize: 10, margin: `0 ${s - 4}px` }}>·</span>; }

// ── Empty state ───────────────────────────────────────────────
function Empty({ icon, title, desc, action }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: UI.muted }}>
      {icon && <div style={{ marginBottom: 10, opacity: 0.5 }}>{icon}</div>}
      <div style={{ fontSize: 14, fontWeight: 600, color: UI.ink, marginBottom: 4 }}>{title}</div>
      {desc && <div style={{ fontSize: 12.5, maxWidth: 360, margin: '0 auto 12px' }}>{desc}</div>}
      {action}
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────
function Stat({ label, value, sub, onClick, accent, ok, warn, hint }) {
  const color = accent ? UI.accent : ok ? UI.ok : warn ? UI.warn : UI.ink;
  return (
    <div onClick={onClick} className={onClick ? 'clickable' : ''} style={{
      background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 8, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 4, position: 'relative',
    }}>
      <div style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500 }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.8, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: UI.muted }}>{sub}</div>}
      {hint && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: UI.faint }}>{hint}</div>}
      {onClick && <Icon name="arrowright" size={12} color={UI.faint} style={{ position: 'absolute', bottom: 12, right: 12 }} />}
    </div>
  );
}

// ── Tabs (in-screen, secondary nav) ──────────────────────────
function Tabs({ value, onChange, items }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${UI.line}`, padding: '0 24px', background: UI.panel }}>
      {items.map(it => {
        const active = value === it.value;
        return (
          <button key={it.value} onClick={() => onChange(it.value)}
            style={{
              padding: '10px 14px', fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? UI.ink : UI.muted, borderBottom: `2px solid ${active ? UI.accent : 'transparent'}`,
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {it.icon}
            {it.label}
            {it.badge !== undefined && (
              <span style={{
                background: active ? UI.accent : UI.panel3, color: active ? '#fff' : UI.muted,
                fontSize: 10.5, padding: '1px 6px', borderRadius: 999, fontWeight: 600,
              }}>{it.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { UI, Btn, Pill, TopicChip, CaptionPill, ExportPill, Field, Card, ScreenHeader, Toolbar, Drawer, Modal, MediaThumb, Sep, Empty, Stat, Tabs });
