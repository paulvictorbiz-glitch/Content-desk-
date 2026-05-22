// Wireframe primitives — boxes, grey, no polish.
// Single accent: muted red/orange for annotations/active states.

const WF = {
  ink: '#1d1b18',
  ink2: '#3a3733',
  muted: '#7a756d',
  faint: '#aaa49a',
  line: '#cfcac1',
  line2: '#e5e1d8',
  bg: '#ffffff',
  bg2: '#f5f3ee',
  bg3: '#ebe7dd',
  accent: '#c4513a',
  accentBg: '#fbe9e4',
  ok: '#3a6f4a',
  okBg: '#dde9de',
  warn: '#a47326',
  warnBg: '#f1e6cd',
  font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace',
};

// Shell — fills the artboard with WF bg + base typography.
function WFShell({ children, style }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: WF.bg,
      fontFamily: WF.font, color: WF.ink, fontSize: 12, lineHeight: 1.35,
      display: 'flex', flexDirection: 'column', ...style,
    }}>{children}</div>
  );
}

// Top tabs nav with logo + workspace
function WFTopNav({ active = 'Planner' }) {
  const tabs = ['Dashboard', 'Assets', 'Planner', 'Captions', 'Export', 'Settings'];
  return (
    <div style={{ borderBottom: `1px solid ${WF.line}`, background: WF.bg2, flexShrink: 0 }}>
      {/* utility row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 12, borderBottom: `1px solid ${WF.line2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box w={18} h={18} style={{ borderRadius: 3 }} />
          <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: -0.2 }}>contentdesk</span>
        </div>
        <Pill>Workspace: Real AI Dynamics</Pill>
        <Pill>Client: Nikky Kho ▾</Pill>
        <div style={{ flex: 1 }} />
        <DriveDot label="Drive · synced" />
        <Pill subtle>?</Pill>
        <Pill subtle>PB</Pill>
      </div>
      {/* tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 16px', gap: 2 }}>
        {tabs.map(t => (
          <div key={t} style={{
            padding: '10px 14px', fontSize: 12.5, fontWeight: t === active ? 600 : 500,
            color: t === active ? WF.ink : WF.muted,
            borderBottom: `2px solid ${t === active ? WF.accent : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function DriveDot({ label = 'Drive · synced', state = 'ok' }) {
  const color = state === 'ok' ? WF.ok : state === 'warn' ? WF.warn : WF.accent;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: WF.ink2 }}>
      <span style={{ width: 7, height: 7, borderRadius: 4, background: color, display: 'inline-block' }} />
      {label}
    </div>
  );
}

function Box({ w, h, style, children }) {
  return <div style={{ width: w, height: h, border: `1px solid ${WF.line}`, background: WF.bg2, ...style }}>{children}</div>;
}

function Pill({ children, subtle, accent, ok, style }) {
  const bg = accent ? WF.accentBg : ok ? WF.okBg : subtle ? WF.bg2 : WF.bg;
  const fg = accent ? WF.accent : ok ? WF.ok : WF.ink2;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 7px', border: `1px solid ${WF.line}`, borderRadius: 3,
      background: bg, color: fg, fontSize: 11, fontWeight: 500, ...style,
    }}>{children}</span>
  );
}

function Btn({ children, primary, ghost, sm, style, icon }) {
  const pad = sm ? '4px 8px' : '6px 12px';
  const bg = primary ? WF.ink : ghost ? 'transparent' : WF.bg;
  const fg = primary ? '#fff' : WF.ink;
  const border = ghost ? 'transparent' : (primary ? WF.ink : WF.line);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, background: bg, color: fg, border: `1px solid ${border}`,
      borderRadius: 4, fontSize: sm ? 11 : 12, fontWeight: 500, ...style,
    }}>{icon}{children}</span>
  );
}

// Generic field — used in forms, search bars, etc.
function Field({ value, placeholder, w, prefix, suffix, style, focused }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 9px', border: `1px solid ${focused ? WF.ink : WF.line}`,
      borderRadius: 3, background: WF.bg, width: w, fontSize: 12,
      color: value ? WF.ink : WF.faint, ...style,
    }}>
      {prefix}
      <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{value || placeholder}</span>
      {suffix}
    </div>
  );
}

// Caret/chevron — for dropdowns
function Caret() {
  return <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}><path d="M1 3 L4 6 L7 3" stroke={WF.muted} strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>;
}

// Tiny media icon — for table rows where the thumbnail is 40px
function MediaIcon({ kind = 'video', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, background: WF.bg3, border: `1px solid ${WF.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontFamily: WF.mono, fontSize: 9, color: WF.muted, position: 'relative',
    }}>
      {/* simple diagonal lines to imply "image placeholder" */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <line x1="0" y1="0" x2={size} y2={size} stroke={WF.line} strokeWidth="0.5" />
        <line x1={size} y1="0" x2="0" y2={size} stroke={WF.line} strokeWidth="0.5" />
      </svg>
      {kind === 'video' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'relative' }}>
          <polygon points="3,2 10,6 3,10" fill={WF.ink2} />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'relative' }}>
          <circle cx="4" cy="4" r="1.2" fill={WF.ink2} />
          <polyline points="1,10 4,7 7,9 11,4" fill="none" stroke={WF.ink2} strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
}

// Section header inside a screen — label + actions row
function ScreenHeader({ title, sub, children }) {
  return (
    <div style={{
      padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${WF.line2}`, background: WF.bg,
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1 }} />
      {children}
    </div>
  );
}

// Filter/toolbar row — sits above a table
function Toolbar({ children, style }) {
  return (
    <div style={{
      padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: `1px solid ${WF.line2}`, background: WF.bg2, flexWrap: 'wrap', ...style,
    }}>{children}</div>
  );
}

// Annotation callout — used to label important interactions on wireframes.
// Renders an arrow + label that overlays the artboard.
function Callout({ x, y, text, dir = 'right', w = 180, color = WF.accent }) {
  // dir: 'right' (arrow points left, label to the right of target)
  //      'left'  (arrow right, label left)
  //      'up'    (arrow down, label above)
  //      'down'  (arrow up, label below)
  const styleMap = {
    right: { transform: 'translate(0,-50%)' },
    left:  { transform: 'translate(-100%,-50%)', textAlign: 'right' },
    up:    { transform: 'translate(-50%,-100%)' },
    down:  { transform: 'translate(-50%,0)' },
  };
  const arrow = {
    right: 'M0 0 L14 0 M2 -4 L0 0 L2 4',
    left:  'M0 0 L14 0 M12 -4 L14 0 L12 4',
    up:    'M0 0 L0 14 M-4 2 L0 0 L4 2',
    down:  'M0 0 L0 14 M-4 12 L0 14 L4 12',
  };
  const arrowPos = {
    right: { left: -18, top: '50%', transform: 'translateY(-50%)', width: 18, height: 12 },
    left:  { right: -18, top: '50%', transform: 'translateY(-50%)', width: 18, height: 12 },
    up:    { left: '50%', bottom: -18, transform: 'translateX(-50%)', width: 12, height: 18 },
    down:  { left: '50%', top: -18, transform: 'translateX(-50%)', width: 12, height: 18 },
  };
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, ...styleMap[dir],
      fontFamily: '"Caveat", "Comic Sans MS", "Marker Felt", cursive', fontSize: 15,
      color, lineHeight: 1.15, zIndex: 4, pointerEvents: 'none',
    }}>
      <svg style={{ position: 'absolute', ...arrowPos[dir], overflow: 'visible' }}>
        <path d={arrow[dir]} stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </div>
  );
}

// Numbered marker — for sequenced flow annotations
function FlowMark({ n, x, y, color = WF.accent }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: 22, height: 22, borderRadius: 11,
      border: `1.5px solid ${color}`, background: '#fff', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: WF.mono, fontSize: 11, fontWeight: 700, zIndex: 5,
    }}>{n}</div>
  );
}

// Annotation overlay container — absolute layer on top of an artboard.
function Annotate({ children }) {
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>{children}</div>;
}

Object.assign(window, {
  WF, WFShell, WFTopNav, DriveDot, Box, Pill, Btn, Field, Caret, MediaIcon,
  ScreenHeader, Toolbar, Callout, FlowMark, Annotate,
});
