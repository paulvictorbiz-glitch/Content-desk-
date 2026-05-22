// App shell — workspace strip, top tabs, alerts, content router.

function Shell({ children }) {
  const { route } = useRoute();
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: UI.bg, overflow: 'hidden' }}>
      <TopBar />
      <NavBar active={route.tab} />
      <AlertsStrip />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <Toast />
    </div>
  );
}

function TopBar() {
  const { state } = useStore();
  return (
    <div style={{
      flexShrink: 0, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 14,
      background: UI.panel, borderBottom: `1px solid ${UI.line2}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Logo />
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.3 }}>contentdesk</div>
      </div>
      <div style={{ width: 1, height: 18, background: UI.line }} />
      <button className="clickable" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 6, fontSize: 12.5 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 11, background: '#3a3733', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
        }}>NK</div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Nikky Kho</div>
          <div style={{ fontSize: 10, color: UI.muted, marginTop: -1 }}>Real AI Dynamics</div>
        </div>
        <Icon name="chevdown" size={12} color={UI.muted} />
      </button>
      <div style={{ flex: 1 }} />
      <Field placeholder="Search assets, posts, captions…" w={280} sm
        prefix={<Icon name="search" size={13} color={UI.muted} />}
        suffix={<span className="mono" style={{ fontSize: 10, color: UI.faint, background: UI.panel3, padding: '1px 5px', borderRadius: 3 }}>⌘K</span>} />
      <DriveStatus />
      <button className="clickable" style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="bell" size={15} color={UI.ink2} />
      </button>
      <div style={{
        width: 28, height: 28, borderRadius: 14, background: '#5a5550', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
      }}>PB</div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 6, background: UI.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <div style={{ width: 11, height: 11, borderRadius: 2, background: UI.accent, transform: 'rotate(45deg)' }} />
    </div>
  );
}

function DriveStatus() {
  const { state } = useStore();
  const pending = state.assets.filter(a => a.driveStatus === 'pending').length;
  const ok = pending === 0;
  return (
    <div data-tip={ok ? 'Google Drive · all synced' : `${pending} file${pending === 1 ? '' : 's'} pending`} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
      background: ok ? UI.okBg : UI.warnBg, color: ok ? UI.ok : UI.warn,
      borderRadius: 6, fontSize: 11.5, fontWeight: 500,
    }}>
      <Icon name="drive" size={13} />
      {ok ? 'Drive · synced' : `Drive · ${pending} pending`}
    </div>
  );
}

function NavBar({ active }) {
  const { go } = useRoute();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'assets',    label: 'Assets',    icon: 'assets' },
    { id: 'planner',   label: 'Planner',   icon: 'planner' },
    { id: 'captions',  label: 'Captions',  icon: 'captions' },
    { id: 'export',    label: 'Export',    icon: 'exporticon' },
    { id: 'settings',  label: 'Settings',  icon: 'settings' },
  ];
  return (
    <div style={{ flexShrink: 0, padding: '0 12px', background: UI.panel, borderBottom: `1px solid ${UI.line}`, display: 'flex', alignItems: 'flex-end', gap: 0 }}>
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => go({ tab: it.id })}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '11px 14px',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? UI.ink : UI.muted,
              borderBottom: `2px solid ${isActive ? UI.accent : 'transparent'}`,
              marginBottom: -1, transition: 'color .12s',
            }}>
            <Icon name={it.icon} size={14} stroke={1.5} />
            {it.label}
            <NavBadge tab={it.id} active={isActive} />
          </button>
        );
      })}
    </div>
  );
}

// Empty caption cells across the planner.
function emptyCaptionCount(planner) {
  return planner.reduce((n, r) => {
    let c = 0;
    const v = r.video || {}, p = r.picture || {};
    if ((v.title || '').trim() && !(v.text || '').trim()) c++;
    const hasPic = (p.description || '').trim() || (p.quote || '').trim() || (p.attachment || '').trim();
    if (hasPic && !(p.description || '').trim()) c++;
    if (hasPic && !(p.quote || '').trim()) c++;
    return n + c;
  }, 0);
}
function pendingExportCount(planner) {
  return planner.filter(r => !r.posted && (r.postedRaw || '').toLowerCase() !== 'na').length;
}

function NavBadge({ tab, active }) {
  const { state } = useStore();
  let count = 0, tone = 'neutral';
  if (tab === 'captions') {
    count = emptyCaptionCount(state.planner);
    tone = 'accent';
  } else if (tab === 'export') {
    count = pendingExportCount(state.planner);
    tone = 'neutral';
  }
  if (!count) return null;
  const bg = tone === 'accent' ? UI.accentBg : tone === 'warn' ? UI.warnBg : UI.panel3;
  const fg = tone === 'accent' ? UI.accentInk : tone === 'warn' ? UI.warn : UI.muted;
  return (
    <span style={{
      background: active ? UI.ink : bg, color: active ? '#fff' : fg,
      fontSize: 10.5, padding: '1px 6px', borderRadius: 999, fontWeight: 600, lineHeight: 1.4,
      fontVariantNumeric: 'tabular-nums',
    }}>{count}</span>
  );
}

function AlertsStrip() {
  const { state } = useStore();
  const { go } = useRoute();

  // Compute alerts from the planner.
  const alerts = [];
  const emptyCaps = emptyCaptionCount(state.planner);
  if (emptyCaps > 0) {
    alerts.push({
      tone: 'accent',
      icon: <Icon name="sparkles" size={13} />,
      text: <><b style={{ color: UI.accentInk, fontWeight: 600 }}>{emptyCaps} caption cell{emptyCaps === 1 ? '' : 's'}</b> empty — the LLM can fill them</>,
      cta: 'Open in Captions',
      onClick: () => go({ tab: 'captions' }),
    });
  }

  const pendingExport = pendingExportCount(state.planner);
  if (pendingExport > 0) {
    alerts.push({
      tone: 'warn',
      icon: <Icon name="exporticon" size={13} />,
      text: <><b style={{ color: UI.warn, fontWeight: 600 }}>{pendingExport} row{pendingExport === 1 ? '' : 's'}</b> not yet on Planable</>,
      cta: 'Open in Export',
      onClick: () => go({ tab: 'export' }),
    });
  }

  const toTag = state.assets.filter(a => a.topic === 'neutral' && !a.posted).length;
  if (toTag > 0) {
    alerts.push({
      tone: 'info',
      icon: <Icon name="assets" size={13} />,
      text: <><b style={{ color: UI.info, fontWeight: 600 }}>{toTag.toLocaleString()}</b> asset{toTag === 1 ? '' : 's'} need a topic tag</>,
      cta: 'Open in Assets',
      onClick: () => go({ tab: 'assets' }),
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div style={{
      flexShrink: 0, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10,
      background: UI.panel2, borderBottom: `1px solid ${UI.line2}`, fontSize: 12, overflow: 'auto',
    }}>
      {alerts.map((a, i) => (
        <button key={i} onClick={a.onClick} className="clickable" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          background: a.tone === 'accent' ? UI.accentBg : a.tone === 'warn' ? UI.warnBg : UI.infoBg,
          color: a.tone === 'accent' ? UI.accentInk : a.tone === 'warn' ? UI.warn : UI.info,
          whiteSpace: 'nowrap', fontSize: 12,
        }}>
          {a.icon}
          <span style={{ color: UI.ink2 }}>{a.text}</span>
          <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
            {a.cta} <Icon name="arrowright" size={11} />
          </span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ color: UI.muted, fontSize: 11 }}>{alerts.length} active alert{alerts.length === 1 ? '' : 's'}</span>
    </div>
  );
}

Object.assign(window, { Shell });
