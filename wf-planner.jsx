// Screen 3: Planner — spreadsheet-tight table

function Planner({ withAssetPicker, withAnnotations }) {
  const data = [
    { date: '2026-05-26', time: '09:00', asset: 'Ai Chatbots Cost Millions.mp4', type: 'video', style: 'business', cap: 'final', exp: 'exported' },
    { date: '2026-05-27', time: '09:00', asset: 'Future Self Vision.mp4', type: 'video', style: 'meditation', cap: 'final', exp: 'exported' },
    { date: '2026-05-28', time: '09:00', asset: 'Joe Dispenza Meditation.mp4', type: 'video', style: 'business', cap: 'draft', exp: 'not' },
    { date: '2026-05-29', time: '09:00', asset: 'Community Unlock.mp4', type: 'video', style: 'meditation', cap: 'empty', exp: 'not' },
    { date: '2026-05-30', time: '09:00', asset: 'Mother\u2019s Smile.mp4', type: 'video', style: 'business', cap: 'final', exp: 'not' },
    { date: '2026-05-31', time: '09:00', asset: 'Brand Implementation.mp4', type: 'video', style: 'meditation', cap: 'final', exp: 'not' },
    { date: '2026-06-01', time: '09:00', asset: 'Motherhood Sacrifice.mp4', type: 'video', style: 'business', cap: 'draft', exp: 'not' },
    { date: '2026-06-02', time: '09:00', asset: 'AI Creates Books.mp4', type: 'video', style: 'meditation', cap: 'empty', exp: 'not' },
    { date: '2026-06-03', time: '09:00', asset: 'Nature\u2019s Beauty.mp4', type: 'video', style: 'business', cap: 'draft', exp: 'not' },
    { date: '2026-06-04', time: '09:00', asset: 'Niche Publishing.mp4', type: 'video', style: 'meditation', cap: 'empty', exp: 'not' },
    { date: '2026-06-05', time: '09:00', asset: 'Rishikesh Wisdom Shop.mp4', type: 'video', style: 'business', cap: 'final', exp: 'not' },
    { date: '2026-06-06', time: '09:00', asset: 'Heygen Custom Video.mp4', type: 'video', style: 'meditation', cap: 'draft', exp: 'not' },
    { date: '2026-06-07', time: '09:00', asset: 'Rishikesh Yoga.mp4', type: 'video', style: 'business', cap: 'final', exp: 'not' },
    { date: '2026-06-08', time: '09:00', asset: '', type: '', style: 'meditation', cap: 'empty', exp: 'not' }, // empty - needs asset
    { date: '2026-06-09', time: '09:00', asset: 'AI Viral Sales Video.mp4', type: 'video', style: 'business', cap: 'draft', exp: 'not' },
  ];

  const editingRow = 3; // row currently being inline-edited (asset cell)

  return (
    <WFShell style={{ position: 'relative' }}>
      <WFTopNav active="Planner" />
      <ScreenHeader title="Planner" sub="42 planned posts · alternating business / meditation">
        <Btn ghost sm>⋯ Bulk</Btn>
        <Btn ghost sm>⤓ Export selected</Btn>
        <Btn primary sm>+ Add row</Btn>
      </ScreenHeader>

      <Toolbar>
        <Pill subtle>Date: May 26 – Jun 30 ▾</Pill>
        <Pill subtle>Style: all ▾</Pill>
        <Pill subtle>Caption: all ▾</Pill>
        <Pill subtle>Export: not exported ▾</Pill>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: WF.muted }}>Sort: date ↑</span>
        <Pill subtle>↻ Reset</Pill>
      </Toolbar>

      {/* spreadsheet header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 28px 92px 56px minmax(0,1.6fr) 58px 100px 96px 96px 28px',
        background: WF.bg2, borderBottom: `1px solid ${WF.line}`,
        fontSize: 10.5, color: WF.muted, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {['', '#', 'Date', 'Time', 'Asset', 'Type', 'Style', 'Caption', 'Export', ''].map((h, i) => (
          <div key={i} style={{ padding: '7px 8px', borderRight: i < 9 ? `1px solid ${WF.line2}` : 'none' }}>
            {i === 0 ? <input type="checkbox" readOnly style={{ pointerEvents: 'none' }} /> : h}
          </div>
        ))}
      </div>

      {/* rows */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {data.map((r, i) => {
          const editing = withAssetPicker && i === editingRow;
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '28px 28px 92px 56px minmax(0,1.6fr) 58px 100px 96px 96px 28px',
              borderBottom: `1px solid ${WF.line2}`,
              fontSize: 11.5,
              background: editing ? WF.bg2 : (i % 2 ? WF.bg : WF.bg),
              fontFamily: WF.mono,
            }}>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line2}` }}>
                <input type="checkbox" readOnly style={{ pointerEvents: 'none' }} />
              </div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line2}`, color: WF.faint }}>{i + 1}</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line2}` }}>{r.date}</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line2}`, color: WF.ink2 }}>{r.time}</div>
              <div style={{
                padding: '4px 8px', borderRight: `1px solid ${WF.line2}`,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                display: 'flex', alignItems: 'center', gap: 6,
                background: editing ? WF.bg : 'transparent',
                outline: editing ? `2px solid ${WF.accent}` : 'none', outlineOffset: -2,
                position: 'relative',
              }}>
                {r.asset ? (
                  <>
                    <MediaIcon kind={r.type} size={20} />
                    <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.asset}</span>
                  </>
                ) : (
                  <span style={{ color: WF.accent, fontStyle: 'italic', fontFamily: WF.font }}>⌕ Click to link asset…</span>
                )}
              </div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${WF.line2}`, color: WF.ink2, fontFamily: WF.font }}>
                {r.type && <Pill subtle style={{ fontSize: 10 }}>{r.type}</Pill>}
              </div>
              <div style={{ padding: '4px 8px', borderRight: `1px solid ${WF.line2}`, fontFamily: WF.font }}>
                {r.style === 'business'
                  ? <Pill>business</Pill>
                  : <Pill subtle>meditation</Pill>}
              </div>
              <div style={{ padding: '4px 8px', borderRight: `1px solid ${WF.line2}`, fontFamily: WF.font }}>
                {r.cap === 'final' && <Pill ok>✓ final</Pill>}
                {r.cap === 'draft' && <Pill>draft</Pill>}
                {r.cap === 'empty' && <Pill accent>empty</Pill>}
              </div>
              <div style={{ padding: '4px 8px', borderRight: `1px solid ${WF.line2}`, fontFamily: WF.font }}>
                {r.exp === 'exported' ? <Pill ok>exported</Pill> : <span style={{ color: WF.faint, fontSize: 11 }}>—</span>}
              </div>
              <div style={{ padding: '6px 8px', color: WF.faint, textAlign: 'center' }}>⋯</div>
            </div>
          );
        })}

        {/* add-row affordance */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px 28px 92px 56px minmax(0,1.6fr) 58px 100px 96px 96px 28px',
          borderBottom: `1px solid ${WF.line2}`, background: WF.bg2,
          fontSize: 11.5, color: WF.muted, fontFamily: WF.font,
        }}>
          <div style={{ padding: '8px 8px', gridColumn: '1 / -1' }}>+ Add row · auto-fills date (next slot) and alternates style</div>
        </div>

        {/* Asset picker popover - shown when withAssetPicker is true */}
        {withAssetPicker && <AssetPickerPopover />}
      </div>

      {/* status bar */}
      <div style={{
        padding: '6px 20px', borderTop: `1px solid ${WF.line}`, background: WF.bg2,
        display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: WF.muted, fontFamily: WF.mono,
      }}>
        <span>15 rows · 2 exported · 5 empty captions · 1 missing asset</span>
        <div style={{ flex: 1 }} />
        <span>↹ Tab to next · Cmd+Enter saves · Cmd+D duplicates row</span>
      </div>

      {withAnnotations && <PlannerAnnotations />}
    </WFShell>
  );
}

function PlannerAnnotations() {
  return (
    <Annotate>
      <FlowMark n={1} x={-12} y={232} />
      <Callout x={-200} y={244} dir="left" w={170} text={"Date auto-fills as next free slot — typing overrides"} />

      <FlowMark n={2} x={398} y={304} />
      <Callout x={1000} y={316} dir="right" w={200} text={"Click any cell to inline-edit. Asset cell opens picker."} />

      <FlowMark n={3} x={628} y={232} />
      <Callout x={1000} y={172} dir="right" w={200} text={"Style auto-alternates from previous row — click pill to flip"} />

      <FlowMark n={4} x={750} y={376} />
      <Callout x={1000} y={388} dir="right" w={210} text={"Empty caption blocks export. Click to jump to Captions tab pre-filtered."} />

      <FlowMark n={5} x={398} y={628} />
      <Callout x={1000} y={628} dir="right" w={200} text={"Missing asset row glows red until linked"} />
    </Annotate>
  );
}

function AssetPickerPopover() {
  // Positioned absolutely under the editing row's asset cell
  return (
    <div style={{
      position: 'absolute', top: 286, left: 226, width: 380,
      background: WF.bg, border: `1px solid ${WF.ink}`, zIndex: 6,
      boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
    }}>
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${WF.line2}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: WF.muted }}>⌕</span>
        <span style={{ fontFamily: WF.mono, fontSize: 11.5 }}>community|</span>
        <div style={{ flex: 1 }} />
        <Pill subtle style={{ fontSize: 10 }}>filter: unused</Pill>
        <Pill subtle style={{ fontSize: 10 }}>style: meditation</Pill>
      </div>
      {[
        { f: 'Community Unlock.mp4', t: 'video', s: 'meditation', used: false, hi: true },
        { f: 'Community Yoga Class.mp4', t: 'video', s: 'meditation', used: false },
        { f: 'Community Bertoni Group.jpg', t: 'image', s: 'meditation', used: true },
        { f: 'Communities Share Tools.mp4', t: 'video', s: 'meditation', used: false },
      ].map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '32px minmax(0,1fr) 70px 70px',
          gap: 8, padding: '6px 10px', alignItems: 'center',
          background: r.hi ? WF.accentBg : (r.used ? WF.bg2 : WF.bg),
          borderBottom: i < 3 ? `1px solid ${WF.line2}` : 'none',
          fontSize: 11.5, opacity: r.used ? 0.6 : 1,
        }}>
          <MediaIcon kind={r.t} size={28} />
          <div style={{ fontFamily: WF.mono, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.f}</div>
          <Pill subtle style={{ fontSize: 10 }}>{r.s}</Pill>
          {r.used
            ? <span style={{ fontSize: 10, color: WF.muted }}>used May 12</span>
            : <span style={{ fontSize: 10, color: WF.ok }}>available</span>}
        </div>
      ))}
      <div style={{ padding: '6px 10px', borderTop: `1px solid ${WF.line2}`, background: WF.bg2, fontSize: 10.5, color: WF.muted, display: 'flex', gap: 8 }}>
        <span>↑↓ navigate</span>
        <span>↵ select</span>
        <span>esc cancel</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: WF.accent }}>+ Upload new</span>
      </div>
    </div>
  );
}

Object.assign(window, { Planner, AssetPickerPopover, PlannerAnnotations });
