// Dashboard — clickable KPIs, next-7-days strip, pipeline, activity.

function Dashboard() {
  const { state } = useStore();
  const { go } = useRoute();

  // Aggregations
  const assetsTotal = state.assets.length;
  const scheduledAssetIds = new Set(state.posts.filter(p => p.assetId).map(p => p.assetId));
  const scheduledAssets = scheduledAssetIds.size;
  const unusedAssets = assetsTotal - scheduledAssets;

  const upcomingPosts = state.posts.filter(p => daysFromToday(p.date) >= 0 && daysFromToday(p.date) <= 30);
  const plannedNext30 = upcomingPosts.length;

  const missingCaptions = state.posts.filter(p => p.captionStatus !== 'final' && daysFromToday(p.date) >= 0 && daysFromToday(p.date) <= 30).length;
  const readyToExport = state.posts.filter(p => p.captionStatus === 'final' && p.exportStatus === 'not' && daysFromToday(p.date) >= 0).length;

  const today = window.DATA.iso(window.DATA.TODAY);
  const next7 = [];
  for (let i = 0; i < 7; i++) {
    const date = window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, i));
    const dayPosts = state.posts.filter(p => p.date === date).sort((a, b) => a.time.localeCompare(b.time));
    next7.push({ date, posts: dayPosts });
  }

  // Pipeline
  const counts = {
    uploaded: assetsTotal,
    planned: state.posts.filter(p => p.assetId).length,
    captioned: state.posts.filter(p => p.captionStatus === 'final').length,
    exported: state.posts.filter(p => p.exportStatus === 'exported').length,
  };

  return (
    <div className="scroll" style={{ flex: 1, overflow: 'auto' }}>
      <ScreenHeader title={"Good morning, Paul"} sub={fmtDate(today)}>
        <Btn kind="ghost" icon={<Icon name="refresh" size={13} />}>Refresh</Btn>
        <Btn kind="primary" icon={<Icon name="plus" size={13} />} onClick={() => go({ tab: 'planner', query: { action: 'add' } })}>New post</Btn>
      </ScreenHeader>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Stat label="Assets in library" value={assetsTotal}
            sub={`${scheduledAssets} used · ${unusedAssets} unused`}
            onClick={() => go({ tab: 'assets' })} hint="Library" />
          <Stat label="Planned posts" value={plannedNext30}
            sub="next 30 days"
            onClick={() => go({ tab: 'planner' })} hint="Planner" />
          <Stat label="Missing captions" value={missingCaptions} accent
            sub={`across ${new Set(state.posts.filter(p => p.captionStatus !== 'final' && daysFromToday(p.date) >= 0 && daysFromToday(p.date) <= 30).map(p => p.date)).size} dates`}
            onClick={() => go({ tab: 'captions', query: { status: 'empty,draft' } })} hint="Fix" />
          <Stat label="Ready to export" value={readyToExport} ok
            sub={`May ${window.DATA.TODAY.getDate()} → next 30d`}
            onClick={() => go({ tab: 'export', query: { from: today, to: window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, 30)) } })} hint="Export" />
        </div>

        {/* Two-column: next 7 days + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, alignItems: 'start' }}>
          <Next7Days days={next7} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Pipeline counts={counts} />
            <ActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function Next7Days({ days }) {
  const { state } = useStore();
  const { go } = useRoute();
  const assetMap = React.useMemo(() => Object.fromEntries(state.assets.map(a => [a.id, a])), [state.assets]);
  const topicMap = React.useMemo(() => Object.fromEntries(state.topics.map(t => [t.id, t])), [state.topics]);

  return (
    <Card padding={0}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Next 7 days</div>
        <Pill tone="soft" size="sm">{days.reduce((n, d) => n + d.posts.length, 0)} posts</Pill>
        <div style={{ flex: 1 }} />
        <button onClick={() => go({ tab: 'planner' })} style={{
          fontSize: 12, color: UI.muted, display: 'flex', alignItems: 'center', gap: 3,
        }}>Open in Planner <Icon name="arrowright" size={11} /></button>
      </div>
      <div>
        {days.map((day, i) => (
          <div key={day.date} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', borderBottom: i < 6 ? `1px solid ${UI.line2}` : 'none' }}>
            <div style={{
              padding: '12px 14px', borderRight: `1px solid ${UI.line2}`, background: UI.panel2,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(day.date + 'T00:00:00').getDay()]}
              </div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>
                {day.date.slice(8, 10)}
              </div>
              {i === 0 && <Pill tone="accent" size="sm" style={{ marginTop: 4 }}>today</Pill>}
            </div>
            <div>
              {day.posts.length === 0 && (
                <div style={{ padding: '12px 14px', color: UI.faint, fontSize: 12, fontStyle: 'italic' }}>no posts</div>
              )}
              {day.posts.map((p, j) => {
                const asset = p.assetId ? assetMap[p.assetId] : null;
                const topic = topicMap[p.topicId];
                return (
                  <button key={p.id} onClick={() => go({ tab: 'captions', query: { post: p.id } })} className="row-hover"
                    style={{
                      display: 'grid', gridTemplateColumns: '50px 36px 1fr 110px 80px',
                      gap: 10, padding: '8px 14px', alignItems: 'center', width: '100%',
                      borderTop: j > 0 ? `1px solid ${UI.line2}` : 'none', textAlign: 'left', cursor: 'pointer',
                    }}>
                    <div className="mono" style={{ fontSize: 11.5, color: UI.muted }}>{p.time}</div>
                    {asset ? <MediaThumb asset={asset} size={30} /> : (
                      <div style={{ width: 30, height: 30, borderRadius: 4, background: UI.accentBg, color: UI.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${UI.accent}` }}>
                        <Icon name="warning" size={14} />
                      </div>
                    )}
                    <div className="truncate" style={{ fontSize: 12.5, color: asset ? UI.ink : UI.accent }}>
                      {asset ? asset.title : '— no asset linked —'}
                    </div>
                    <TopicChip topicId={p.topicId} size="sm" />
                    <CaptionPill status={p.captionStatus} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Pipeline({ counts }) {
  const max = Math.max(counts.uploaded, 1);
  const rows = [
    { l: 'Uploaded',  v: counts.uploaded,  c: UI.ink2 },
    { l: 'Linked',    v: counts.planned,   c: UI.info },
    { l: 'Captioned', v: counts.captioned, c: UI.ok },
    { l: 'Exported',  v: counts.exported,  c: UI.muted },
  ];
  return (
    <Card padding={0}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${UI.line2}`, fontSize: 13.5, fontWeight: 600 }}>Pipeline</div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map(r => (
          <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 76, fontSize: 12, color: UI.muted }}>{r.l}</div>
            <div style={{ flex: 1, height: 8, background: UI.panel2, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(r.v / max) * 100}%`, height: '100%', background: r.c, borderRadius: 999, transition: 'width .3s' }} />
            </div>
            <div className="mono" style={{ width: 28, textAlign: 'right', fontSize: 12.5, fontWeight: 600 }}>{r.v}</div>
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
          <div key={i} style={{
            padding: '9px 16px', display: 'flex', gap: 12, fontSize: 12,
            borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none',
          }}>
            <div className="mono" style={{ width: 80, color: UI.muted, flexShrink: 0 }}>
              {relativeShort(a.at)}
            </div>
            <div style={{ color: UI.ink2 }}>{a.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
function relativeShort(at) {
  // at is YYYY-MM-DDTHH:MM
  const d = new Date(at);
  const today = new Date(window.DATA.TODAY);
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return at.slice(11, 16);
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  const diff = Math.round((today - d) / 86400000);
  if (diff < 7) return `${diff}d ago`;
  return at.slice(5, 10);
}

window.Dashboard = Dashboard;
