// Screen 4: Captions — split view (list + editor panel) + batch modal

function Captions({ withBatch }) {
  const rows = [
    { date: '05-26', asset: 'Ai Chatbots Cost Millions.mp4', style: 'business', cap: 'final' },
    { date: '05-27', asset: 'Future Self Vision.mp4', style: 'meditation', cap: 'final' },
    { date: '05-28', asset: 'Joe Dispenza Meditation.mp4', style: 'business', cap: 'draft', active: true },
    { date: '05-29', asset: 'Community Unlock.mp4', style: 'meditation', cap: 'empty' },
    { date: '05-30', asset: 'Mother\u2019s Smile.mp4', style: 'business', cap: 'final' },
    { date: '05-31', asset: 'Brand Implementation.mp4', style: 'meditation', cap: 'final' },
    { date: '06-01', asset: 'Motherhood Sacrifice.mp4', style: 'business', cap: 'draft' },
    { date: '06-02', asset: 'AI Creates Books.mp4', style: 'meditation', cap: 'empty' },
    { date: '06-03', asset: 'Nature\u2019s Beauty.mp4', style: 'business', cap: 'draft' },
    { date: '06-04', asset: 'Niche Publishing.mp4', style: 'meditation', cap: 'empty' },
    { date: '06-05', asset: 'Rishikesh Wisdom.mp4', style: 'business', cap: 'final' },
    { date: '06-06', asset: 'Heygen Custom Video.mp4', style: 'meditation', cap: 'draft' },
    { date: '06-07', asset: 'Rishikesh Yoga.mp4', style: 'business', cap: 'final' },
    { date: '06-08', asset: 'Community Bertoni.jpg', style: 'meditation', cap: 'empty' },
  ];

  return (
    <WFShell style={{ position: 'relative' }}>
      <WFTopNav active="Captions" />
      <ScreenHeader title="Captions" sub="42 posts · 7 empty · 8 draft · 27 final">
        <Btn ghost sm>⤴ Open prompt template</Btn>
        <Btn primary sm icon={<span>✨</span>}>Generate all empty (7)</Btn>
      </ScreenHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', flex: 1, minHeight: 0 }}>
        {/* LEFT: list */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${WF.line}` }}>
          <Toolbar style={{ padding: '8px 14px' }}>
            <Field placeholder="Search asset…" w={140} prefix={<span style={{ color: WF.muted }}>⌕</span>} />
            <Pill subtle>Date ▾</Pill>
            <Pill subtle>Type ▾</Pill>
            <Pill accent>Caption: not final ▾</Pill>
          </Toolbar>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rows.map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '50px 32px minmax(0,1fr) 90px 70px',
                gap: 10, padding: '7px 14px', alignItems: 'center',
                borderBottom: `1px solid ${WF.line2}`,
                background: r.active ? WF.accentBg : WF.bg,
                borderLeft: r.active ? `3px solid ${WF.accent}` : '3px solid transparent',
                paddingLeft: r.active ? 11 : 14,
                fontSize: 11.5,
              }}>
                <div style={{ fontFamily: WF.mono, color: WF.muted }}>{r.date}</div>
                <MediaIcon kind={r.asset.endsWith('.jpg') ? 'image' : 'video'} size={26} />
                <div style={{ fontFamily: WF.mono, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 11 }}>{r.asset}</div>
                <div>{r.style === 'business' ? <Pill>business</Pill> : <Pill subtle>meditation</Pill>}</div>
                <div>
                  {r.cap === 'final' && <Pill ok>✓ final</Pill>}
                  {r.cap === 'draft' && <Pill>draft</Pill>}
                  {r.cap === 'empty' && <Pill accent>empty</Pill>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: editor panel */}
        <div style={{ display: 'flex', flexDirection: 'column', background: WF.bg2 }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${WF.line}`, background: WF.bg, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono }}>May 28, 2026 · 09:00</div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: WF.mono, marginTop: 1 }}>Joe Dispenza Meditation.mp4</div>
            </div>
            <Pill>business</Pill>
            <Pill>draft</Pill>
          </div>

          <div style={{ padding: 18, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* preview */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 112, aspectRatio: '9/16', background: WF.bg3, border: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MediaIcon kind="video" size={40} />
              </div>
              <div style={{ flex: 1, fontSize: 11.5, color: WF.ink2, lineHeight: 1.5 }}>
                <div style={{ color: WF.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Asset title</div>
                <div style={{ fontFamily: WF.mono, fontSize: 11 }}>Joe Dispenza Meditation Change Your Life With Science</div>
                <div style={{ color: WF.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 4 }}>Style guidance</div>
                <div>Crisp, leadership voice. Quote → insight → CTA. ≤ 220 chars. End on hashtag set #business.</div>
              </div>
            </div>

            {/* caption editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Caption</div>
                <span style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono }}>187 / 2200</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: WF.muted }}>last edited 2m ago · auto-saved</span>
              </div>
              <div style={{
                flex: 1, minHeight: 120, border: `1px solid ${WF.line}`, background: WF.bg,
                padding: 12, fontSize: 12.5, lineHeight: 1.55, color: WF.ink2,
                fontFamily: WF.font, position: 'relative',
              }}>
                Dr. Joe Dispenza merges meditation with neuroscience. Change your brain, change your life. The most successful people I know rewire their thinking before breakfast.<br/><br/>
                <span style={{ color: WF.muted }}>#mindset #neuroscience #leadership</span>
                <span style={{ position: 'absolute', right: 12, bottom: 10, width: 1, height: 14, background: WF.ink, animation: 'wf-blink 1.1s infinite' }} />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Btn icon={<span>✨</span>}>Generate</Btn>
                <Btn icon={<span>↻</span>}>Regenerate</Btn>
                <Btn ghost sm>longer</Btn>
                <Btn ghost sm>shorter</Btn>
                <Btn ghost sm>+ hashtags</Btn>
                <div style={{ flex: 1 }} />
                <Btn>Mark draft</Btn>
                <Btn primary>Mark final ✓</Btn>
              </div>
            </div>

            {/* history */}
            <div style={{ borderTop: `1px dashed ${WF.line}`, paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: WF.muted, marginBottom: 4 }}>2 previous generations</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Pill subtle>v3 · current</Pill>
                <Pill subtle>v2 · 14:22</Pill>
                <Pill subtle>v1 · 14:18</Pill>
              </div>
            </div>
          </div>

          {/* footer nav */}
          <div style={{ padding: '8px 18px', borderTop: `1px solid ${WF.line}`, background: WF.bg, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <Btn ghost sm>← Prev empty</Btn>
            <Btn ghost sm>Next empty →</Btn>
            <div style={{ flex: 1 }} />
            <span style={{ color: WF.muted, fontFamily: WF.mono }}>3 of 14</span>
          </div>
        </div>
      </div>

      {withBatch && <BatchGenerateModal />}

      <style>{`@keyframes wf-blink{50%{opacity:0}}`}</style>
    </WFShell>
  );
}

function BatchGenerateModal() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.28)', zIndex: 8 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 540, background: WF.bg, border: `1px solid ${WF.line}`, zIndex: 9,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${WF.line2}`, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Generating captions</div>
          <div style={{ flex: 1 }} />
          <Pill ok>4 done · 3 to go</Pill>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ height: 8, background: WF.bg2, border: `1px solid ${WF.line}`, marginBottom: 14 }}>
            <div style={{ width: '57%', height: '100%', background: WF.ink }} />
          </div>

          {[
            { d: '05-29', a: 'Community Unlock.mp4', s: 'meditation', st: 'done' },
            { d: '06-02', a: 'AI Creates Books.mp4', s: 'meditation', st: 'done' },
            { d: '06-04', a: 'Niche Publishing.mp4', s: 'meditation', st: 'done' },
            { d: '06-08', a: 'Community Bertoni.jpg', s: 'meditation', st: 'done' },
            { d: '06-10', a: 'AI Screen Script.mp4', s: 'business', st: 'running' },
            { d: '06-12', a: 'Self Compassion.mp4', s: 'meditation', st: 'queued' },
            { d: '06-14', a: 'Money Reflection.jpg', s: 'business', st: 'queued' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '20px 50px 28px minmax(0,1fr) 80px 70px',
              gap: 8, padding: '6px 4px', alignItems: 'center',
              borderBottom: i < 6 ? `1px solid ${WF.line2}` : 'none', fontSize: 11.5,
            }}>
              <div style={{ color: r.st === 'done' ? WF.ok : r.st === 'running' ? WF.accent : WF.faint }}>
                {r.st === 'done' ? '✓' : r.st === 'running' ? '◐' : '○'}
              </div>
              <div style={{ fontFamily: WF.mono, color: WF.muted }}>{r.d}</div>
              <MediaIcon kind={r.a.endsWith('.jpg') ? 'image' : 'video'} size={22} />
              <div style={{ fontFamily: WF.mono, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.a}</div>
              <div>{r.s === 'business' ? <Pill style={{ fontSize: 10 }}>business</Pill> : <Pill subtle style={{ fontSize: 10 }}>meditation</Pill>}</div>
              <div style={{ fontSize: 10.5, color: r.st === 'running' ? WF.accent : WF.muted }}>
                {r.st === 'running' ? 'generating…' : r.st === 'done' ? '✓ as draft' : 'queued'}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14, padding: 10, background: WF.bg2, border: `1px dashed ${WF.line}`, fontSize: 11, color: WF.muted }}>
            Each result is marked <b style={{ color: WF.ink }}>draft</b> for review. You'll bulk-approve next.
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: `1px solid ${WF.line2}`, background: WF.bg2, display: 'flex', gap: 8 }}>
          <Btn ghost>Pause</Btn>
          <Btn ghost style={{ color: WF.accent }}>Stop &amp; keep done</Btn>
          <div style={{ flex: 1 }} />
          <Btn>Run in background</Btn>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Captions, BatchGenerateModal });
