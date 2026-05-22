// Screen 1: Dashboard / overview

function Dashboard() {
  return (
    <WFShell>
      <WFTopNav active="Dashboard" />
      <ScreenHeader title="Today" sub="Tuesday · May 26, 2026">
        <Btn ghost sm icon={<span>↻</span>}>Refresh</Btn>
        <Btn primary sm>+ New planner row</Btn>
      </ScreenHeader>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '16px 20px' }}>
        {[
          { l: 'Assets in library', v: '128', sub: '42 scheduled · 86 unused' },
          { l: 'Planned posts', v: '31', sub: 'next 30 days' },
          { l: 'Missing captions', v: '7', sub: 'across 3 dates', accent: true },
          { l: 'Ready to export', v: '24', sub: 'May 26 → Jun 24' },
        ].map((k, i) => (
          <div key={i} style={{ border: `1px solid ${WF.line}`, background: WF.bg, padding: '12px 14px' }}>
            <div style={{ fontSize: 10.5, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.l}</div>
            <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4, letterSpacing: -0.5, color: k.accent ? WF.accent : WF.ink }}>{k.v}</div>
            <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns: next up / quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, padding: '0 20px 16px', flex: 1, minHeight: 0 }}>
        {/* Next 7 days strip */}
        <div style={{ border: `1px solid ${WF.line}`, background: WF.bg, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WF.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Next 7 days</div>
            <Pill subtle>5 of 7 days have a post</Pill>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: WF.muted }}>Open planner →</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {[
              { d: 'Tue 26', t: '09:00', a: 'Ai Chatbots Cost Millions.mp4', s: 'business', c: 'final' },
              { d: 'Wed 27', t: '09:00', a: 'Future Self Vision.mp4', s: 'meditation', c: 'final' },
              { d: 'Thu 28', t: '09:00', a: 'Joe Dispenza Meditation.mp4', s: 'business', c: 'draft' },
              { d: 'Fri 29', t: '09:00', a: 'Community Unlock.mp4', s: 'meditation', c: 'empty', warn: true },
              { d: 'Sat 30', t: '09:00', a: '— no asset linked —', s: '—', c: 'empty', warn: true },
              { d: 'Sun 31', t: '09:00', a: 'AI Creates Logos.mp4', s: 'business', c: 'draft' },
              { d: 'Mon 01', t: '—', a: '— empty slot —', s: '—', c: '—', empty: true },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '70px 50px 36px 1fr 90px 70px',
                gap: 10, alignItems: 'center', padding: '6px 14px',
                borderBottom: `1px solid ${WF.line2}`,
                fontSize: 11.5, color: r.empty ? WF.faint : WF.ink,
              }}>
                <div style={{ fontFamily: WF.mono }}>{r.d}</div>
                <div style={{ fontFamily: WF.mono, color: WF.muted }}>{r.t}</div>
                {r.empty ? <div /> : <MediaIcon kind="video" size={24} />}
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.a}</div>
                <div style={{ color: WF.muted }}>{r.s}</div>
                <div>
                  {r.c === 'final' && <Pill ok>✓ final</Pill>}
                  {r.c === 'draft' && <Pill>draft</Pill>}
                  {r.c === 'empty' && <Pill accent>missing</Pill>}
                  {r.c === '—' && <span style={{ color: WF.faint }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: pipeline + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ border: `1px solid ${WF.line}`, background: WF.bg, padding: '10px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Pipeline</div>
            {[
              { l: 'Uploaded', v: 86, pct: 100 },
              { l: 'Planned', v: 42, pct: 49 },
              { l: 'Captioned', v: 35, pct: 41 },
              { l: 'Exported', v: 24, pct: 28 },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 70, fontSize: 11, color: WF.muted }}>{s.l}</div>
                <div style={{ flex: 1, height: 8, background: WF.bg2, border: `1px solid ${WF.line}` }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: WF.ink }} />
                </div>
                <div style={{ width: 26, textAlign: 'right', fontFamily: WF.mono, fontSize: 11 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ border: `1px solid ${WF.line}`, background: WF.bg, padding: '10px 14px', flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Recent activity</div>
            {[
              ['10:42', 'Uploaded 6 videos → Drive/Videos'],
              ['10:18', 'Generated 4 captions (business)'],
              ['09:55', 'Exported planable_may26-jun24.csv'],
              ['Yesterday', 'Linked asset to May 30 slot'],
              ['Yesterday', 'Renamed 12 files (date format)'],
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: i < 4 ? `1px solid ${WF.line2}` : 'none', fontSize: 11.5 }}>
                <div style={{ width: 60, color: WF.muted, fontFamily: WF.mono }}>{a[0]}</div>
                <div style={{ color: WF.ink2 }}>{a[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WFShell>
  );
}

Object.assign(window, { Dashboard });
