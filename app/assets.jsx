// Assets — library table, upload modal, detail drawer with linked planner rows.

function Assets() {
  const { state, dispatch, toast } = useStore();
  const { route, go } = useRoute();
  const [filter, setFilter] = React.useState({ type: 'all', topic: 'all', usage: 'all', q: '' });
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(new Set());

  const drawerAssetId = route.sub[0] || null;
  const drawerAsset = drawerAssetId ? state.assets.find(a => a.id === drawerAssetId) : null;
  const closeDrawer = () => go({ tab: 'assets' });

  const usedAssetIds = React.useMemo(() => new Set(state.posts.filter(p => p.assetId).map(p => p.assetId)), [state.posts]);
  const assetUseCount = React.useMemo(() => {
    const m = {};
    state.posts.forEach(p => { if (p.assetId) m[p.assetId] = (m[p.assetId] || 0) + 1; });
    return m;
  }, [state.posts]);

  // Apply a topic tag to assets and persist it (keyed by Drive ID, survives re-sync).
  const tagAssets = React.useCallback((ids, topic) => {
    if (!ids.length) return;
    dispatch({ type: 'bulkSetTopic', ids, topic });
    const driveIds = ids.map(id => (state.assets.find(a => a.id === id) || {}).driveId).filter(Boolean);
    if (window.CDPrefs) window.CDPrefs.setTopicOverrides(driveIds, topic);
    const tName = (state.topics.find(t => t.id === topic) || {}).name || topic;
    toast(`Tagged ${ids.length} asset${ids.length > 1 ? 's' : ''} as ${tName}`, 'ok');
  }, [state.assets, state.topics, dispatch, toast]);

  const rows = state.assets.filter(a => {
    if (filter.type !== 'all' && a.type !== filter.type) return false;
    if (filter.topic !== 'all' && a.topic !== filter.topic) return false;
    if (filter.usage === 'posted' && !a.posted) return false;
    if (filter.usage === 'unposted' && a.posted) return false;
    if (filter.usage === 'used' && !usedAssetIds.has(a.id)) return false;
    if (filter.usage === 'unused' && usedAssetIds.has(a.id)) return false;
    if (filter.usage === 'new' && !a.isNew) return false;
    if (filter.q && !a.title.toLowerCase().includes(filter.q.toLowerCase()) && !a.filename.toLowerCase().includes(filter.q.toLowerCase())) return false;
    return true;
  });

  const totals = {
    all: state.assets.length,
    posted: state.assets.filter(a => a.posted).length,
    toTag: state.assets.filter(a => a.topic === 'neutral' && !a.posted).length,
    new: state.assets.filter(a => a.isNew).length,
  };

  return (
    <>
      <ScreenHeader title="Asset library"
        sub={`${totals.all} assets · ${totals.posted} posted · ${totals.toTag} to tag · ${totals.new} new this week`}>
        <ScanButton />
        <Btn kind="ghost" icon={<Icon name="download" size={13} />}>Export CSV</Btn>
        <Btn kind="primary" icon={<Icon name="upload" size={13} />} onClick={() => setUploadOpen(true)}>Upload</Btn>
      </ScreenHeader>

      <Toolbar>
        <Field placeholder="Search filename or title…" w={260} sm value={filter.q} onChange={(v) => setFilter({ ...filter, q: v })}
          prefix={<Icon name="search" size={13} color={UI.muted} />} />
        <Select label="Type" value={filter.type} onChange={(v) => setFilter({ ...filter, type: v })}
          options={[['all', 'All'], ['video', 'Video'], ['image', 'Image']]} />
        <Select label="Topic" value={filter.topic} onChange={(v) => setFilter({ ...filter, topic: v })}
          options={[['all', 'All'], ...state.topics.map(t => [t.id, t.name])]} />
        <Select label="Usage" value={filter.usage} onChange={(v) => setFilter({ ...filter, usage: v })}
          options={[['all', 'All'], ['posted', 'Posted'], ['unposted', 'Not posted'], ['used', 'Used in planner'], ['unused', 'Unused'], ['new', 'New this week']]} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: UI.muted }}>{rows.length} of {state.assets.length}</span>
      </Toolbar>

      {selected.size > 0 && (
        <div style={{ padding: '8px 24px', background: UI.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, flexWrap: 'wrap' }}>
          <span><b>{selected.size}</b> selected</span>
          <span style={{ color: 'rgba(255,255,255,.5)' }}>Tag as</span>
          <TopicPicker onDark onPick={(topic) => { tagAssets([...selected], topic); setSelected(new Set()); }} />
          <div style={{ flex: 1 }} />
          <button onClick={() => setSelected(new Set())} style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Clear</button>
        </div>
      )}

      <AssetTable rows={rows} usedAssetIds={usedAssetIds} useCount={assetUseCount}
        selected={selected} setSelected={setSelected}
        onOpen={(id) => go({ tab: 'assets', sub: [id] })} />

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <AssetDrawer asset={drawerAsset} onClose={closeDrawer}
        onTag={(topic) => drawerAsset && tagAssets([drawerAsset.id], topic)} />
    </>
  );
}

// Scan/scrape the Drive folder for asset names, then reload with fresh data.
function ScanButton() {
  const { toast } = useStore();
  const [scanning, setScanning] = React.useState(false);
  const scan = async () => {
    setScanning(true);
    toast('Scanning Google Drive — this can take a minute…', 'accent');
    try {
      const res = await fetch('/api/scan-drive', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        toast(`Found ${data.count != null ? data.count + ' ' : ''}assets — reloading…`, 'ok');
        setTimeout(() => window.location.reload(), 1100);
      } else {
        setScanning(false);
        console.error('Drive scan failed:', data.error);
        toast('Scan failed — check the server window', 'accent');
      }
    } catch (e) {
      setScanning(false);
      toast('Scan failed: ' + e.message, 'accent');
    }
  };
  return (
    <Btn kind="ghost" onClick={scanning ? undefined : scan} disabled={scanning}
      icon={<span className={scanning ? 'spin' : ''} style={{ display: 'inline-flex' }}><Icon name="refresh" size={13} /></span>}>
      {scanning ? 'Scanning…' : 'Scan Drive'}
    </Btn>
  );
}

// Row of topic buttons — click one to tag. Highlights `value` if given.
function TopicPicker({ value, onPick, onDark, style }) {
  const topics = (window.DATA && window.DATA.topics) || [];
  return (
    <div style={{ display: 'inline-flex', gap: 5, flexWrap: 'wrap', ...style }}>
      {topics.map(t => {
        const active = t.id === value;
        const pal = UI.topic[t.id] || { c: UI.ink2, bg: UI.panel3 };
        return (
          <button key={t.id} className="focus-ring"
            onClick={(e) => { e.stopPropagation(); onPick(t.id); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 4, fontSize: 11.5, fontWeight: 500,
              background: active ? pal.bg : (onDark ? 'rgba(255,255,255,.12)' : UI.panel),
              color: active ? pal.c : (onDark ? '#fff' : UI.ink2),
              border: `1px solid ${active ? pal.c : (onDark ? 'transparent' : UI.line)}`,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: pal.c }} />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

function Select({ label, value, options, onChange, sm }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: sm ? '3px 10px' : '5px 10px', background: UI.panel,
      border: `1px solid ${UI.line}`, borderRadius: 6, fontSize: 12,
    }}>
      <span style={{ color: UI.muted }}>{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: UI.ink,
        appearance: 'none', paddingRight: 12, outline: 'none', cursor: 'pointer',
      }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Icon name="chevdown" size={11} color={UI.muted} style={{ marginLeft: -16, pointerEvents: 'none' }} />
    </span>
  );
}

function AssetTable({ rows, usedAssetIds, useCount, selected, setSelected, onOpen }) {
  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id));
  const toggleAll = () => {
    const s = new Set(selected);
    if (allSelected) rows.forEach(r => s.delete(r.id));
    else rows.forEach(r => s.add(r.id));
    setSelected(s);
  };
  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  return (
    <div className="scroll" style={{ flex: 1, overflow: 'auto', background: UI.panel }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 2,
        display: 'grid', gridTemplateColumns: '40px 56px minmax(0, 1.6fr) 60px 110px 100px 80px 100px 40px',
        gap: 12, padding: '10px 24px', background: UI.panel2,
        borderBottom: `1px solid ${UI.line}`,
        fontSize: 11, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        <div><input type="checkbox" checked={allSelected} onChange={toggleAll} /></div>
        <div>Thumb</div>
        <div>Asset</div>
        <div>Type</div>
        <div>Topic</div>
        <div>Uploaded ▾</div>
        <div>Usage</div>
        <div>Status</div>
        <div></div>
      </div>
      {rows.map((a, i) => {
        const used = usedAssetIds.has(a.id);
        const count = useCount[a.id] || 0;
        const isSel = selected.has(a.id);
        return (
          <div key={a.id} className="row-hover" style={{
            display: 'grid', gridTemplateColumns: '40px 56px minmax(0, 1.6fr) 60px 110px 100px 80px 100px 40px',
            gap: 12, padding: '8px 24px', alignItems: 'center',
            borderBottom: `1px solid ${UI.line2}`, fontSize: 12.5,
            background: isSel ? UI.accentBg : 'transparent', cursor: 'pointer',
          }} onClick={() => onOpen(a.id)}>
            <div onClick={(e) => { e.stopPropagation(); toggle(a.id); }}>
              <input type="checkbox" checked={isSel} onChange={() => {}} />
            </div>
            <MediaThumb asset={a} size={44} />
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</div>
              <div className="truncate mono" style={{ fontSize: 11, color: UI.muted, marginTop: 1 }}>{a.filename}</div>
            </div>
            <div style={{ color: UI.ink2 }}>{a.type}</div>
            <div><TopicChip topicId={a.topic} size="sm" /></div>
            <div className="mono" style={{ fontSize: 11.5, color: UI.muted }}>{a.uploadedAt.slice(0, 10)}</div>
            <div>
              {a.posted
                ? <Pill tone="ok" size="sm" title={`Posted ${a.postedDate}`}>posted</Pill>
                : used
                ? <Pill tone="info" size="sm">{count > 1 ? `used ×${count}` : 'used'}</Pill>
                : <Pill tone="ghost" size="sm">unused</Pill>}
            </div>
            <div>
              {a.isNew && !used ? <Pill tone="accent" size="sm">new</Pill> :
                a.driveStatus === 'pending' ? <Pill tone="warn" size="sm">syncing…</Pill> :
                <Pill tone="soft" size="sm" icon={<Icon name="check" size={10} />}>synced</Pill>}
            </div>
            <Icon name="chevright" size={14} color={UI.faint} />
          </div>
        );
      })}
      {rows.length === 0 && <Empty title="No assets match" desc="Try adjusting filters or uploading new files." />}
    </div>
  );
}

// ─── Upload modal ─────────────────────────────────────────────
function UploadModal({ open, onClose }) {
  const { dispatch, toast } = useStore();
  const { state } = useStore();
  const [files, setFiles] = React.useState([
    { id: 'u1', name: 'video_may_22_2026_morning_business.mp4', type: 'video', topic: 'business' },
    { id: 'u2', name: 'IMG_5232.HEIC', type: 'image', topic: 'meditation' },
    { id: 'u3', name: 'sword_pose_blue_outlook.mov', type: 'video', topic: 'martial-arts' },
  ]);
  const [defaultTopic, setDefaultTopic] = React.useState('business');
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  if (!open) return null;
  const handleUpload = () => {
    setUploading(true);
    let p = 0;
    const tick = setInterval(() => {
      p += 18 + Math.random() * 14;
      if (p >= 100) {
        clearInterval(tick);
        const newAssets = files.map((f, i) => ({
          id: 'a' + (Date.now() + i).toString(36),
          title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          filename: f.name, type: f.type, topic: f.topic, client: 'nikky-kho',
          driveId: '1' + Math.random().toString(36).slice(2, 12),
          driveFolder: `Nikky/${f.type === 'video' ? 'Videos' : 'Pictures'}/${f.topic}`,
          sizeBytes: f.type === 'video' ? 14e6 : 2.4e6,
          durationSec: f.type === 'video' ? 48 : null,
          uploadedAt: new Date().toISOString().slice(0, 16),
          driveStatus: 'synced', isNew: true,
        }));
        dispatch({ type: 'addAssets', assets: newAssets });
        dispatch({ type: 'logActivity', text: `Uploaded ${files.length} files to Drive` });
        toast(`${files.length} files uploaded`, 'ok');
        setUploading(false); setProgress(0); onClose();
      } else setProgress(p);
    }, 220);
  };

  return (
    <Modal open={open} onClose={uploading ? () => {} : onClose} width={620}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="upload" size={16} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Upload assets</div>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="clickable">
          <Icon name="close" size={14} color={UI.muted} />
        </button>
      </div>

      <div style={{ padding: 18, overflowY: 'auto', maxHeight: '60vh' }}>
        <div style={{
          border: `1.5px dashed ${UI.line}`, padding: '22px 16px', background: UI.panel2,
          textAlign: 'center', borderRadius: 8, marginBottom: 14,
        }}>
          <Icon name="upload" size={22} color={UI.muted} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Drop files or click to browse</div>
          <div style={{ fontSize: 11.5, color: UI.muted, marginTop: 2 }}>mp4 · mov · jpg · png · heic — up to 200MB each</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, color: UI.muted }}>{files.length} files · Set defaults:</span>
          <Select label="Topic" value={defaultTopic} sm onChange={(v) => {
            setDefaultTopic(v); setFiles(files.map(f => ({ ...f, topic: v })));
          }} options={state.topics.map(t => [t.id, t.name])} />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: UI.faint }}>Type is auto-detected</span>
        </div>

        <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden' }}>
          {files.map((f, i) => (
            <div key={f.id} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 70px 130px 28px',
              gap: 10, padding: '8px 12px', alignItems: 'center',
              borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none', fontSize: 12,
            }}>
              <MediaThumb asset={{ id: f.id, type: f.type }} size={32} />
              <div style={{ minWidth: 0 }}>
                <div className="truncate mono" style={{ fontSize: 11.5 }}>{f.name}</div>
                <div style={{ fontSize: 10.5, color: UI.muted, marginTop: 1 }}>→ <code className="mono">{`Nikky/${f.type === 'video' ? 'Videos' : 'Pictures'}/${f.topic}`}</code></div>
              </div>
              <Select label="" value={f.type} sm onChange={(v) => setFiles(files.map((x, j) => j === i ? { ...x, type: v } : x))}
                options={[['video', 'video'], ['image', 'image']]} />
              <Select label="" value={f.topic} sm onChange={(v) => setFiles(files.map((x, j) => j === i ? { ...x, topic: v } : x))}
                options={state.topics.map(t => [t.id, t.name])} />
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="clickable" style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={12} color={UI.muted} />
              </button>
            </div>
          ))}
        </div>

        {uploading && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
              <Icon name="upload" size={13} className="pulse" />
              <span>Pushing to Drive…</span>
              <div style={{ flex: 1 }} />
              <span className="mono">{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, background: UI.panel2, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: UI.accent, transition: 'width .2s' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 18px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Btn kind="ghost" onClick={onClose} disabled={uploading}>Cancel</Btn>
        <div style={{ flex: 1 }} />
        <Btn kind="ghost" icon={<Icon name="plus" size={12} />}>Add more</Btn>
        <Btn kind="accent" onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? 'Uploading…' : `Upload ${files.length} to Drive`}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Asset detail drawer ──────────────────────────────────────
function AssetDrawer({ asset, onClose, onTag }) {
  const { state } = useStore();
  const { go } = useRoute();
  if (!asset) return null;
  const linkedPosts = state.posts.filter(p => p.assetId === asset.id);

  return (
    <Drawer open={!!asset} onClose={onClose} width={520}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="assets" size={15} color={UI.muted} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Asset detail</div>
        <div style={{ flex: 1 }} />
        <Btn size="sm" kind="ghost" icon={<Icon name="external" size={12} />}>Open in Drive</Btn>
        <button onClick={onClose} className="clickable" style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={14} color={UI.muted} />
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 18 }}>
        <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 14, position: 'relative', aspectRatio: '16/9' }}>
          <MediaThumb asset={asset} size={460} withIcon={false} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={asset.type === 'video' ? 'video' : 'image'} size={22} color={UI.ink} />
            </div>
          </div>
          {asset.isNew && (
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <Pill tone="accent" size="sm">new</Pill>
            </div>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, marginBottom: 2 }}>{asset.title}</div>
        <div className="mono" style={{ fontSize: 11.5, color: UI.muted, marginBottom: 16 }}>{asset.filename}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 8, fontSize: 12.5, alignItems: 'center' }}>
          <Meta label="Client">Nikky Kho</Meta>
          <Meta label="Type"><Pill tone="soft" size="sm">{asset.type}</Pill></Meta>
          <Meta label="Topic"><TopicPicker value={asset.topic} onPick={onTag} /></Meta>
          {asset.posted && <Meta label="Posted"><Pill tone="ok" size="sm">{asset.postedDate}</Pill></Meta>}
          <Meta label="Uploaded">{fmtDate(asset.uploadedAt.slice(0, 10))} · {asset.uploadedAt.slice(11, 16)}</Meta>
          {asset.durationSec && <Meta label="Duration">{(asset.sizeBytes / 1e6).toFixed(1)} MB · {Math.floor(asset.durationSec/60)}:{(asset.durationSec%60).toString().padStart(2,'0')}</Meta>}
          {!asset.durationSec && <Meta label="Size">{(asset.sizeBytes / 1e6).toFixed(2)} MB</Meta>}
          <Meta label="Drive folder"><code className="mono" style={{ fontSize: 11 }}>{asset.driveFolder}</code></Meta>
          <Meta label="Drive ID"><code className="mono" style={{ fontSize: 11, color: UI.muted }}>{asset.driveId}</code></Meta>
        </div>

        {/* Linked planner rows */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${UI.line2}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="link" size={14} color={UI.muted} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Linked planner rows</div>
            <Pill tone="soft" size="sm">{linkedPosts.length}</Pill>
          </div>
          {linkedPosts.length === 0 ? (
            <div style={{ padding: 14, background: UI.panel2, borderRadius: 6, fontSize: 12, color: UI.muted, textAlign: 'center' }}>
              Not yet linked to a planner row.
              <button onClick={() => go({ tab: 'planner', query: { link: asset.id } })} style={{ color: UI.accent, fontWeight: 600, marginLeft: 6 }}>
                Schedule this asset →
              </button>
            </div>
          ) : (
            <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden' }}>
              {linkedPosts.map((p, i) => (
                <button key={p.id} onClick={() => { onClose(); go({ tab: 'planner', query: { highlight: p.id } }); }}
                  className="row-hover"
                  style={{
                    display: 'grid', gridTemplateColumns: '60px 40px 1fr 80px 70px',
                    gap: 10, padding: '8px 12px', alignItems: 'center', width: '100%',
                    borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none', textAlign: 'left', cursor: 'pointer',
                  }}>
                  <div className="mono" style={{ fontSize: 11.5 }}>{p.date.slice(5)}</div>
                  <div className="mono" style={{ fontSize: 11, color: UI.muted }}>{p.time}</div>
                  <div style={{ fontSize: 11.5, color: UI.muted }}>{relativeDay(p.date)}</div>
                  <CaptionPill status={p.captionStatus} size="sm" />
                  <Icon name="arrowright" size={12} color={UI.faint} style={{ justifySelf: 'end' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick caption preview from latest linked post */}
        {linkedPosts.length > 0 && linkedPosts[0].captionText && (
          <div style={{ marginTop: 22, borderTop: `1px solid ${UI.line2}`, paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Caption (from {fmtDate(linkedPosts[0].date, { short: true })})</div>
            <div style={{ padding: 12, background: UI.panel2, borderRadius: 6, fontSize: 12.5, color: UI.ink2, lineHeight: 1.5, fontStyle: 'italic' }}>
              "{linkedPosts[0].captionText.split('\n')[0]}"
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 18px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', gap: 8 }}>
        <Btn kind="ghost" icon={<Icon name="edit" size={12} />}>Replace file</Btn>
        <div style={{ flex: 1 }} />
        <Btn kind="danger" icon={<Icon name="trash" size={12} />}>Delete</Btn>
      </div>
    </Drawer>
  );
}

function Meta({ label, children }) {
  return (
    <>
      <div style={{ color: UI.muted }}>{label}</div>
      <div>{children}</div>
    </>
  );
}

Object.assign(window, { Assets });
