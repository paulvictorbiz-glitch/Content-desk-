// Dashboard — KPIs over the real asset library + the planner schedule.

function Dashboard() {
  const { state } = useStore();
  const { go } = useRoute();
  const today = window.DATA.iso(window.DATA.TODAY);

  const assets = state.assets;
  const planner = state.planner;

  const postedAssets = assets.filter(a => a.posted).length;
  const toTag = assets.filter(a => a.topic === 'neutral' && !a.posted).length;

  const onPlanable = planner.filter(r => r.posted).length;
  const pending = planner.filter(r => !r.posted && (r.postedRaw || '').toLowerCase() !== 'na').length;

  const emptyCaps = planner.reduce((n, r) => {
    let c = 0;
    if (r.video && (r.video.title || '').trim() && !(r.video.text || '').trim()) c++;
    if (r.picture && ((r.picture.description || '').trim() || (r.picture.attachment || '').trim()) && !(r.picture.quote || '').trim()) c++;
    if (r.picture && (r.picture.attachment || '').trim() && !(r.picture.description || '').trim()) c++;
    return n + c;
  }, 0);

  // Next 7 days from the planner.
  const dateOf = (dt) => String(dt || '').slice(0, 10);
  const next7 = [];
  for (let i = 0; i < 7; i++) {
    const date = window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, i));
    const items = [];
    planner.forEach(r => {
      if (r.video && dateOf(r.video.dateTime) === date)
        items.push({ id: r.id + 'v', kind: 'video', time: (r.video.dateTime || '').slice(11, 16),
          title: r.video.title, hasCaption: !!(r.video.text || '').trim(), posted: r.posted });
      if (r.picture && dateOf(r.picture.dateTime) === date)
        items.push({ id: r.id + 'p', kind: 'picture', time: (r.picture.dateTime || '').slice(11, 16),
          title: r.picture.attachment || (r.picture.quote || '').slice(0, 40) || 'Picture post',
          hasCaption: !!(r.picture.description || '').trim(), posted: r.posted });
    });
    items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    next7.push({ date, items });
  }

  const pipeline = [
    { l: 'Assets', v: assets.length, c: UI.ink2 },
    { l: 'In planner', v: planner.length, c: UI.info },
    { l: 'Captioned', v: planner.filter(r => r.video && (r.video.text || '').trim()).length, c: UI.ok },
    { l: 'On Planable', v: onPlanable, c: UI.muted },
  ];

  return (
    <div className="scroll" style={{ flex: 1, overflow: 'auto' }}>
      <ScreenHeader title="Good morning, Paul" sub={fmtDate(today) + ' · Nikky Kho content desk'}>
        <Btn kind="ghost" icon={<Icon name="refresh" size={13} />} onClick={() => window.location.reload()}>Refresh</Btn>
        <Btn kind="primary" icon={<Icon name="planner" size={13} />} onClick={() => go({ tab: 'planner' })}>Open Planner</Btn>
      </ScreenHeader>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Stat label="Assets in library" value={assets.length.toLocaleString()}
            sub={`${postedAssets} posted · ${toTag} to tag`}
            onClick={() => go({ tab: 'assets' })} hint="Library" />
          <Stat label="Planner rows" value={planner.length}
            sub={`${onPlanable} on Planable · ${pending} pending`}
            onClick={() => go({ tab: 'planner' })} hint="Planner" />
          <Stat label="Empty captions" value={emptyCaps} accent={emptyCaps > 0}
            sub="cells the LLM can fill"
            onClick={() => go({ tab: 'captions' })} hint="Captions" />
          <Stat label="Pending export" value={pending} ok={pending === 0}
            sub="rows not yet on Planable"
            onClick={() => go({ tab: 'export' })} hint="Export" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, alignItems: 'start' }}>
          <Next7Days days={next7} go={go} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Pipeline rows={pipeline} />
            <ActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function Next7Days({ days, go }) {
  const total = days.reduce((n, d) => n + d.items.length, 0);
  return (
    <Card padding={0}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Next 7 days</div>
        <Pill tone="soft" size="sm">{total} posts</Pill>
        <div style={{ flex: 1 }} />
        <button onClick={() => go({ tab: 'planner' })} style={{ fontSize: 12, color: UI.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
          Open Planner <Icon name="arrowright" size={11} />
        </button>
      </div>
      <div>
        {days.map((day, i) => (
          <div key={day.date} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', borderBottom: i < 6 ? `1px solid ${UI.line2}` : 'none' }}>
            <div style={{ padding: '12px 14px', borderRight: `1px solid ${UI.line2}`, background: UI.panel2 }}>
              <div style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(day.date + 'T00:00:00').getDay()]}
              </div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>{day.date.slice(8, 10)}</div>
              {i === 0 && <Pill tone="accent" size="sm" style={{ marginTop: 4 }}>today</Pill>}
            </div>
            <div>
              {day.items.length === 0 && (
                <div style={{ padding: '12px 14px', color: UI.faint, fontSize: 12, fontStyle: 'italic' }}>no posts</div>
              )}
              {day.items.map((it, j) => (
                <button key={it.id} onClick={() => go({ tab: 'planner' })} className="row-hover" style={{
                  display: 'grid', gridTemplateColumns: '46px 30px 1fr 86px', gap: 10, padding: '8px 14px',
                  alignItems: 'center', width: '100%', textAlign: 'left',
                  borderTop: j > 0 ? `1px solid ${UI.line2}` : 'none', cursor: 'pointer',
                }}>
                  <div className="mono" style={{ fontSize: 11.5, color: UI.muted }}>{it.time || '—'}</div>
                  <Icon name={it.kind === 'video' ? 'video' : 'image'} size={15} color={UI.muted} />
                  <div className="truncate" style={{ fontSize: 12.5 }}>{it.title || <span style={{ color: UI.faint }}>untitled</span>}</div>
                  {it.hasCaption
                    ? <Pill tone="ok" size="sm">caption</Pill>
                    : <Pill tone="accent" size="sm">empty</Pill>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Pipeline({ rows }) {
  const max = Math.max(...rows.map(r => r.v), 1);
  return (
    <Card padding={0}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${UI.line2}`, fontSize: 13.5, fontWeight: 600 }}>Pipeline</div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map(r => (
          <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 82, fontSize: 12, color: UI.muted }}>{r.l}</div>
            <div style={{ flex: 1, height: 8, background: UI.panel2, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(r.v / max) * 100}%`, height: '100%', background: r.c, borderRadius: 999, transition: 'width .3s' }} />
            </div>
            <div className="mono" style={{ width: 46, textAlign: 'right', fontSize: 12.5, fontWeight: 600 }}>{r.v.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityCard() {
  const { state } = useStore();
  return (
    <Card padding={0}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${UI.line2}`, fontSize: 13.5, fontWeight: 600 }}>Recent activity</div>
      <div>
        {state.activity.slice(0, 6).map((a, i) => (
          <div key={i} style={{ padding: '9px 16px', display: 'flex', gap: 12, fontSize: 12,
            borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none' }}>
            <div className="mono" style={{ width: 80, color: UI.muted, flexShrink: 0 }}>{relativeShort(a.at)}</div>
            <div style={{ color: UI.ink2 }}>{a.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
function relativeShort(at) {
  const d = new Date(at);
  const today = new Date(window.DATA.TODAY);
  if (d.toDateString() === today.toDateString()) return at.slice(11, 16);
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  const diff = Math.round((today - d) / 86400000);
  if (diff > 0 && diff < 7) return `${diff}d ago`;
  return at.slice(5, 10);
}

window.Dashboard = Dashboard;
