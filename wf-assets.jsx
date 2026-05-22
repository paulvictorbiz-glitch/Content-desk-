// Screen 2: Assets library — table + upload modal + detail drawer

function AssetsLibrary({ withDrawer, withModal }) {
  const rows = [
    { f: 'Ai Chatbots Cost Millions.mp4', t: 'video', s: 'business', d: '2026-05-22', sched: 'May 26', drive: 'synced' },
    { f: 'Future Self Vision.mp4', t: 'video', s: 'business', d: '2026-05-22', sched: 'May 26', drive: 'synced' },
    { f: 'Joe Dispenza Meditation.mp4', t: 'video', s: 'meditation', d: '2026-05-22', sched: 'May 28', drive: 'synced' },
    { f: 'Community Unlock.mp4', t: 'video', s: 'business', d: '2026-05-21', sched: '—', drive: 'synced' },
    { f: 'Mother\u2019s Smile First Connection.mp4', t: 'video', s: 'meditation', d: '2026-05-21', sched: 'May 30', drive: 'synced' },
    { f: 'Brand Implementation.mp4', t: 'video', s: 'business', d: '2026-05-20', sched: 'May 31', drive: 'synced' },
    { f: 'Nikky@math.bertoni-0879.jpg', t: 'image', s: 'business', d: '2026-05-20', sched: '—', drive: 'synced' },
    { f: 'IMG_7937.jpg', t: 'image', s: 'meditation', d: '2026-05-20', sched: 'May 10', drive: 'synced' },
    { f: 'Nikky@math.bertoni-1350.jpg', t: 'image', s: 'meditation', d: '2026-05-20', sched: '—', drive: 'synced' },
    { f: 'IMG_5155.HEIC', t: 'image', s: 'meditation', d: '2026-05-19', sched: 'May 12', drive: 'synced' },
    { f: 'AI Art Courtroom.mp4', t: 'video', s: 'business', d: '2026-05-19', sched: 'May 15', drive: 'pending' },
    { f: 'Doppelganger Life Message.mp4', t: 'video', s: 'meditation', d: '2026-05-19', sched: 'May 16', drive: 'synced' },
    { f: 'Mitra Reschedule.mp4', t: 'video', s: 'business', d: '2026-05-18', sched: '—', drive: 'synced' },
    { f: 'Discover True Self.mp4', t: 'video', s: 'meditation', d: '2026-05-18', sched: 'May 14', drive: 'synced' },
  ];

  return (
    <WFShell>
      <WFTopNav active="Assets" />
      <ScreenHeader title="Asset library" sub="128 assets · 42 scheduled · 86 unused">
        <Field placeholder="Search filename, style..." w={220} prefix={<span style={{ color: WF.muted }}>⌕</span>} />
        <Btn primary icon={<span>↑</span>}>Upload</Btn>
      </ScreenHeader>

      <Toolbar>
        <Pill subtle>Type: all ▾</Pill>
        <Pill subtle>Style: all ▾</Pill>
        <Pill subtle>Scheduled: all ▾</Pill>
        <Pill subtle>Date: last 30 days ▾</Pill>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: WF.muted }}>Showing 14 of 128</span>
        <Pill subtle>⤓ CSV</Pill>
      </Toolbar>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px 50px minmax(0,1.4fr) 70px 110px 100px 110px 50px',
          gap: 12, padding: '8px 20px', background: WF.bg2,
          borderBottom: `1px solid ${WF.line}`, fontSize: 10.5,
          textTransform: 'uppercase', letterSpacing: 0.5, color: WF.muted, fontWeight: 600,
        }}>
          <div><input type="checkbox" readOnly style={{ pointerEvents: 'none' }} /></div>
          <div>Thumb</div>
          <div>Filename</div>
          <div>Type</div>
          <div>Style</div>
          <div>Uploaded ▾</div>
          <div>Scheduled</div>
          <div>Drive</div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '28px 50px minmax(0,1.4fr) 70px 110px 100px 110px 50px',
              gap: 12, padding: '6px 20px', alignItems: 'center',
              borderBottom: `1px solid ${WF.line2}`,
              background: i === 2 ? WF.bg2 : WF.bg, fontSize: 12,
            }}>
              <div><input type="checkbox" readOnly style={{ pointerEvents: 'none' }} /></div>
              <MediaIcon kind={r.t} size={36} />
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: WF.mono, fontSize: 11.5 }}>{r.f}</div>
              <div style={{ color: WF.ink2 }}>{r.t}</div>
              <div>{r.s === 'business' ? <Pill>business</Pill> : <Pill subtle>meditation</Pill>}</div>
              <div style={{ color: WF.muted, fontFamily: WF.mono, fontSize: 11 }}>{r.d}</div>
              <div>{r.sched === '—' ? <span style={{ color: WF.faint }}>— unused</span> : <Pill ok>{r.sched}</Pill>}</div>
              <div>
                <DriveDot label="" state={r.drive === 'pending' ? 'warn' : 'ok'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer pagination */}
      <div style={{ padding: '8px 20px', borderTop: `1px solid ${WF.line}`, background: WF.bg2, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: WF.muted }}>
        <span>Page 1 of 10</span>
        <Pill subtle>‹</Pill>
        <Pill subtle>›</Pill>
        <div style={{ flex: 1 }} />
        <span>Rows: 50 ▾</span>
      </div>

      {withDrawer && <AssetDrawer />}
      {withModal && <UploadModal />}
    </WFShell>
  );
}

function AssetDrawer() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.18)', zIndex: 8 }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
        background: WF.bg, borderLeft: `1px solid ${WF.line}`, zIndex: 9,
        display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${WF.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Asset detail</div>
          <div style={{ flex: 1 }} />
          <span style={{ color: WF.muted, fontSize: 16 }}>×</span>
        </div>
        <div style={{ padding: 18, flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: WF.bg3, border: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <MediaIcon kind="video" size={48} />
          </div>
          <div style={{ fontFamily: WF.mono, fontSize: 12, marginBottom: 2 }}>Joe Dispenza Meditation.mp4</div>
          <div style={{ fontSize: 11, color: WF.muted, marginBottom: 14 }}>drive_id · 1xK7p…meditation/Joe-Dispenza.mp4</div>

          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 8, fontSize: 11.5 }}>
            <div style={{ color: WF.muted }}>Client</div><div>Nikky Kho</div>
            <div style={{ color: WF.muted }}>Type</div><div><Pill>video</Pill></div>
            <div style={{ color: WF.muted }}>Style</div><div><Pill subtle>meditation</Pill> <span style={{ color: WF.muted }}>(editable)</span></div>
            <div style={{ color: WF.muted }}>Uploaded</div><div>May 22, 2026 · 10:42</div>
            <div style={{ color: WF.muted }}>Size</div><div>14.2 MB · 0:48</div>
            <div style={{ color: WF.muted }}>Drive folder</div><div style={{ fontFamily: WF.mono, fontSize: 10.5 }}>Nikky/Videos/meditation</div>
            <div style={{ color: WF.muted }}>Scheduled</div><div><Pill ok>May 28 · 09:00</Pill></div>
          </div>

          <div style={{ marginTop: 16, padding: 10, border: `1px dashed ${WF.line}`, fontSize: 11, color: WF.muted }}>
            <div style={{ color: WF.ink, fontWeight: 600, marginBottom: 4 }}>Caption (final)</div>
            "Discipline is returning to what supports you — even when feeling pulled away. The most successful…"
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            <Btn>Open in Drive ↗</Btn>
            <Btn>Replace file</Btn>
            <div style={{ flex: 1 }} />
            <Btn style={{ color: WF.accent, borderColor: WF.accent }}>Delete</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

function UploadModal() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.32)', zIndex: 8 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 560, background: WF.bg, border: `1px solid ${WF.line}`, zIndex: 9,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${WF.line2}`, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Upload assets</div>
          <div style={{ flex: 1 }} />
          <span style={{ color: WF.muted, fontSize: 16 }}>×</span>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ border: `1.5px dashed ${WF.line}`, padding: '24px 16px', background: WF.bg2, textAlign: 'center' }}>
            <div style={{ fontSize: 22, color: WF.muted, marginBottom: 4 }}>⤓</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Drop videos &amp; images, or click to browse</div>
            <div style={{ fontSize: 11, color: WF.muted, marginTop: 4 }}>mp4 · mov · jpg · png · heic — up to 200MB each</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: WF.muted, marginBottom: 6 }}>3 files queued — set defaults for all:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11.5, color: WF.muted, width: 50 }}>Client</span>
            <Field value="Nikky Kho" w={140} suffix={<Caret />} />
            <span style={{ fontSize: 11.5, color: WF.muted, width: 40, marginLeft: 8 }}>Type</span>
            <Pill accent>auto-detect</Pill>
            <span style={{ fontSize: 11.5, color: WF.muted, width: 36, marginLeft: 8 }}>Style</span>
            <Pill>business</Pill>
            <Pill subtle>meditation</Pill>
          </div>

          {/* file rows */}
          <div style={{ border: `1px solid ${WF.line}` }}>
            {[
              { n: 'video_april_1_2026_nikky.mp4', t: 'video', s: 'business' },
              { n: 'IMG_5232.HEIC', t: 'image', s: 'meditation' },
              { n: 'Sword_pose_blue.mov', t: 'video', s: 'business' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '32px minmax(0,1fr) 70px 110px 60px',
                gap: 10, padding: '8px 10px', alignItems: 'center',
                borderBottom: i < 2 ? `1px solid ${WF.line2}` : 'none', fontSize: 11.5,
              }}>
                <MediaIcon kind={f.t} size={28} />
                <div style={{ fontFamily: WF.mono, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.n}</div>
                <Field value={f.t} w={66} suffix={<Caret />} style={{ padding: '3px 6px' }} />
                <Field value={f.s} w={102} suffix={<Caret />} style={{ padding: '3px 6px' }} />
                <span style={{ color: WF.muted }}>×</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: WF.muted, display: 'flex', gap: 6 }}>
            <span>→</span>
            <span>Files will land in <code style={{ fontFamily: WF.mono }}>Drive/Nikky/Videos/business</code> and <code style={{ fontFamily: WF.mono }}>…/Pictures/meditation</code>.</span>
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: `1px solid ${WF.line2}`, background: WF.bg2, display: 'flex', gap: 8 }}>
          <Btn ghost>Cancel</Btn>
          <div style={{ flex: 1 }} />
          <Btn>+ Add more</Btn>
          <Btn primary>Upload 3 to Drive</Btn>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { AssetsLibrary, AssetDrawer, UploadModal });
