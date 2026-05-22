// Planner — spreadsheet-tight table + topics manager + pattern editor + auto-generate.

function Planner() {
  const { state, dispatch, toast } = useStore();
  const { route, go } = useRoute();
  const filter = route.query.filter || 'all';
  const highlightId = route.query.highlight || null;

  const [picker, setPicker] = React.useState(null); // {postId, column}
  const [pickerCellRect, setPickerCellRect] = React.useState(null);
  const [editingCell, setEditingCell] = React.useState(null); // {postId, column}
  const [showPatternPanel, setShowPatternPanel] = React.useState(false);
  const [showTopicPanel, setShowTopicPanel] = React.useState(false);
  const [selected, setSelected] = React.useState(new Set());

  const assetMap = React.useMemo(() => Object.fromEntries(state.assets.map(a => [a.id, a])), [state.assets]);

  // Filter rows
  const rows = state.posts.filter(p => {
    if (filter === 'missing-asset' && p.assetId) return false;
    if (filter === 'missing-captions' && p.captionStatus === 'final') return false;
    if (filter === 'ready-to-export' && !(p.captionStatus === 'final' && p.exportStatus === 'not')) return false;
    return true;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Auto-scroll highlight into view
  const rowRefs = React.useRef({});
  React.useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      const el = rowRefs.current[highlightId];
      const parent = el.closest('.scroll');
      if (parent) {
        const top = el.offsetTop - parent.clientHeight / 2 + el.clientHeight / 2;
        parent.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, [highlightId]);

  return (
    <>
      <ScreenHeader title="Planner" sub={`${state.posts.length} planned posts · ${state.pattern.slots.length} slots/day`}>
        <Btn kind="ghost" icon={<Icon name="calendar" size={13} />} onClick={() => setShowPatternPanel(true)}>Pattern</Btn>
        <Btn kind="ghost" icon={<Icon name="dot" size={13} />} onClick={() => setShowTopicPanel(true)}>Topics</Btn>
        <Btn kind="ghost" icon={<Icon name="download" size={13} />}
          onClick={() => go({ tab: 'export' })}>Export</Btn>
        <Btn kind="primary" icon={<Icon name="plus" size={13} />}
          onClick={() => addRow(state, dispatch, toast)}>Add row</Btn>
      </ScreenHeader>

      <Toolbar>
        <FilterChips />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: UI.muted }}>{rows.length} of {state.posts.length} rows</span>
      </Toolbar>

      <PlannerLegend />

      <div className="scroll" style={{ flex: 1, overflow: 'auto', background: UI.panel }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 3,
          display: 'grid', gridTemplateColumns: PLANNER_COLS,
          background: UI.panel2, borderBottom: `1px solid ${UI.line}`,
          fontSize: 11, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {['', '#', 'Date', 'Time', 'Asset', 'Type', 'Topic', 'Caption', 'Export', ''].map((h, i) => (
            <div key={i} style={{ padding: '9px 10px', borderRight: i < 9 ? `1px solid ${UI.line2}` : 'none' }}>
              {i === 0 ? null : h}
            </div>
          ))}
        </div>

        {rows.map((p, i) => {
          const asset = p.assetId ? assetMap[p.assetId] : null;
          const isHighlighted = p.id === highlightId;
          return (
            <PlannerRow key={p.id} post={p} asset={asset} idx={i + 1}
              highlight={isHighlighted}
              selected={selected.has(p.id)}
              onSelect={(v) => {
                const s = new Set(selected);
                if (v) s.add(p.id); else s.delete(p.id);
                setSelected(s);
              }}
              onPick={(column, rect) => { setPicker({ postId: p.id, column }); setPickerCellRect(rect); }}
              onEdit={(column) => setEditingCell({ postId: p.id, column })}
              editingCell={editingCell?.postId === p.id ? editingCell.column : null}
              setEditing={setEditingCell}
              rowRef={(el) => { rowRefs.current[p.id] = el; }}
            />
          );
        })}

        {/* add row */}
        <button onClick={() => addRow(state, dispatch, toast)} className="row-hover" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', width: '100%',
          fontSize: 12.5, color: UI.muted, textAlign: 'left', borderBottom: `1px solid ${UI.line2}`,
        }}>
          <Icon name="plus" size={14} />
          <span>Add row — auto-fills date (next free slot) and applies pattern topic</span>
        </button>
      </div>

      {/* status bar */}
      <div style={{
        padding: '7px 24px', borderTop: `1px solid ${UI.line}`, background: UI.panel2,
        display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: UI.muted, flexShrink: 0,
      }}>
        <span><b style={{ color: UI.ink }}>{rows.length}</b> rows</span>
        <span>· <b style={{ color: UI.ok }}>{rows.filter(r => r.captionStatus === 'final').length}</b> final</span>
        <span>· <b style={{ color: UI.warn }}>{rows.filter(r => r.captionStatus === 'draft').length}</b> draft</span>
        <span>· <b style={{ color: UI.accent }}>{rows.filter(r => r.captionStatus === 'empty').length}</b> empty</span>
        <span>· <b style={{ color: UI.warn }}>{rows.filter(r => !r.assetId).length}</b> missing asset</span>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11 }}>↹ tab next · ⌘D duplicate · ⌫ delete</span>
      </div>

      {picker && (
        <AssetPickerPopover post={state.posts.find(p => p.id === picker.postId)}
          rect={pickerCellRect}
          onPick={(assetId, opts) => {
            const asset = state.assets.find(a => a.id === assetId);
            const patch = { assetId, type: asset.type };
            if (opts?.applyTopic) patch.topicId = asset.topic;
            dispatch({ type: 'updatePost', id: picker.postId, patch });
            setPicker(null);
            toast(`Linked ${asset.filename}`, 'ok');
          }}
          onClose={() => setPicker(null)} />
      )}
      {showPatternPanel && <PatternPanel onClose={() => setShowPatternPanel(false)} />}
      {showTopicPanel && <TopicPanel onClose={() => setShowTopicPanel(false)} />}
    </>
  );
}

const PLANNER_COLS = '40px 38px 110px 70px minmax(0, 1.5fr) 70px 130px 100px 110px 38px';

function FilterChips() {
  const { route, go } = useRoute();
  const { state } = useStore();
  const f = route.query.filter || 'all';
  const counts = {
    all: state.posts.length,
    'missing-asset': state.posts.filter(p => !p.assetId).length,
    'missing-captions': state.posts.filter(p => p.captionStatus !== 'final').length,
    'ready-to-export': state.posts.filter(p => p.captionStatus === 'final' && p.exportStatus === 'not').length,
  };
  const set = (val) => go({ tab: 'planner', query: val === 'all' ? {} : { filter: val } });
  const chips = [
    { id: 'all', label: 'All', tone: 'soft' },
    { id: 'missing-asset', label: 'Missing asset', tone: 'warn' },
    { id: 'missing-captions', label: 'Missing captions', tone: 'accent' },
    { id: 'ready-to-export', label: 'Ready to export', tone: 'ok' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {chips.map(c => {
        const active = f === c.id;
        return (
          <button key={c.id} onClick={() => set(c.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            background: active ? UI.ink : UI.panel,
            color: active ? '#fff' : UI.ink2,
            border: `1px solid ${active ? UI.ink : UI.line}`,
            borderRadius: 999, fontSize: 12, fontWeight: 500,
          }}>
            {c.label}
            <span style={{
              background: active ? 'rgba(255,255,255,.18)' : UI.panel3,
              color: active ? '#fff' : UI.muted,
              fontSize: 10.5, padding: '0px 6px', borderRadius: 999, fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}>{counts[c.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

function PlannerLegend() {
  return (
    <div style={{
      padding: '6px 24px', display: 'flex', alignItems: 'center', gap: 14, fontSize: 11,
      color: UI.muted, background: UI.panel2, borderBottom: `1px solid ${UI.line2}`,
      flexShrink: 0,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 3, height: 12, background: UI.accent, borderRadius: 2 }} />
        Missing asset
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 3, height: 12, background: UI.warn, borderRadius: 2 }} />
        Empty / draft caption
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 3, height: 12, background: UI.ok, borderRadius: 2 }} />
        Ready to export
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 3, height: 12, background: UI.line, borderRadius: 2 }} />
        Already exported
      </span>
    </div>
  );
}

function PlannerRow({ post, asset, idx, highlight, selected, onSelect, onPick, onEdit, editingCell, setEditing, rowRef }) {
  const { state, dispatch } = useStore();
  const { go } = useRoute();
  const isToday = post.date === window.DATA.iso(window.DATA.TODAY);
  const isPast = daysFromToday(post.date) < 0;
  const readyToExport = post.captionStatus === 'final' && post.exportStatus === 'not';

  // Left rail color
  let railColor = 'transparent';
  if (!post.assetId) railColor = UI.accent;
  else if (post.captionStatus !== 'final') railColor = UI.warn;
  else if (post.exportStatus === 'exported') railColor = UI.line;
  else railColor = UI.ok;

  const bg = highlight ? UI.accentBg : selected ? UI.infoBg : (isToday ? UI.panel2 : UI.panel);
  const cellBorderRight = `1px solid ${UI.line2}`;

  const cellRef = React.useRef(null);
  const openPicker = (col) => {
    const rect = cellRef.current?.getBoundingClientRect();
    onPick(col, rect);
  };

  return (
    <div ref={rowRef} className="row-hover" style={{
      display: 'grid', gridTemplateColumns: PLANNER_COLS, alignItems: 'stretch',
      borderBottom: `1px solid ${UI.line2}`, background: bg,
      borderLeft: `3px solid ${railColor}`, marginLeft: -3,
      transition: 'background .15s', position: 'relative',
      opacity: isPast && post.exportStatus === 'exported' ? 0.6 : 1,
    }}>
      <div style={{ padding: '8px 10px', borderRight: cellBorderRight, display: 'flex', alignItems: 'center' }}>
        <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} />
      </div>
      <div style={{ padding: '8px 10px', borderRight: cellBorderRight, fontSize: 11, color: UI.faint, alignSelf: 'center' }} className="mono">{idx}</div>
      <PlannerCell editing={editingCell === 'date'} onClick={() => setEditing({ postId: post.id, column: 'date' })}
        onCommit={(v) => { dispatch({ type: 'updatePost', id: post.id, patch: { date: v } }); setEditing(null); }}
        value={post.date} sm mono />
      <PlannerCell editing={editingCell === 'time'} onClick={() => setEditing({ postId: post.id, column: 'time' })}
        onCommit={(v) => { dispatch({ type: 'updatePost', id: post.id, patch: { time: v } }); setEditing(null); }}
        value={post.time} sm mono color={UI.ink2} />
      <div ref={cellRef} onClick={() => openPicker('asset')}
        className="clickable" style={{
          padding: '6px 10px', borderRight: cellBorderRight, display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', minWidth: 0,
        }}>
        {asset ? (
          <>
            <MediaThumb asset={asset} size={24} />
            <div style={{ minWidth: 0 }}>
              <div className="truncate mono" style={{ fontSize: 11.5 }}>{asset.filename}</div>
            </div>
          </>
        ) : (
          <span style={{ color: UI.accent, fontStyle: 'italic', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="search" size={12} /> Click to link asset…
          </span>
        )}
      </div>
      <div style={{ padding: '8px 10px', borderRight: cellBorderRight, fontSize: 12, color: UI.ink2 }}>
        {post.type && <Pill tone="soft" size="sm">{post.type}</Pill>}
      </div>
      <PlannerTopicCell post={post} dispatch={dispatch} topics={state.topics} />
      <div style={{ padding: '8px 10px', borderRight: cellBorderRight, display: 'flex', alignItems: 'center' }}>
        <button onClick={() => go({ tab: 'captions', query: { post: post.id } })}>
          <CaptionPill status={post.captionStatus} size="sm" />
        </button>
      </div>
      <div style={{ padding: '8px 10px', borderRight: cellBorderRight, display: 'flex', alignItems: 'center', gap: 6 }}>
        {post.exportStatus === 'exported'
          ? <Pill tone="ok" size="sm">exported</Pill>
          : readyToExport
            ? <Pill tone="soft" size="sm" style={{ color: UI.ok, background: UI.okBg }}>ready</Pill>
            : <span style={{ color: UI.faint, fontSize: 11 }}>—</span>}
      </div>
      <div style={{ padding: '6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => dispatch({ type: 'deletePost', id: post.id })}
          className="clickable" style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete row">
          <Icon name="more" size={13} color={UI.faint} />
        </button>
      </div>
    </div>
  );
}

function PlannerCell({ value, onCommit, editing, onClick, sm, mono, color, w }) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value, editing]);
  if (editing) {
    return (
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)}
        onBlur={() => onCommit(v)}
        onKeyDown={(e) => { if (e.key === 'Enter') onCommit(v); if (e.key === 'Escape') onCommit(value); }}
        style={{
          padding: '4px 8px', border: `1.5px solid ${UI.accent}`, outline: 'none', background: UI.panel,
          fontSize: sm ? 12 : 13, fontFamily: mono ? UI.mono : UI.font,
          borderRight: `1px solid ${UI.line2}`, width: '100%',
        }} />
    );
  }
  return (
    <div onClick={onClick} className="clickable" style={{
      padding: '8px 10px', borderRight: `1px solid ${UI.line2}`,
      fontSize: sm ? 12 : 13, fontFamily: mono ? UI.mono : UI.font, color: color || UI.ink,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
    }}>{value}</div>
  );
}

function PlannerTopicCell({ post, topics, dispatch }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [open]);
  return (
    <div ref={ref} style={{ padding: '6px 10px', borderRight: `1px solid ${UI.line2}`, position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <TopicChip topicId={post.topicId} size="sm" />
        <Icon name="chevdown" size={10} color={UI.faint} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 8, zIndex: 5, marginTop: 4,
          background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 4, minWidth: 160,
        }}>
          {topics.map(t => (
            <button key={t.id} onClick={() => { dispatch({ type: 'updatePost', id: post.id, patch: { topicId: t.id } }); setOpen(false); }}
              className="clickable"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', width: '100%', borderRadius: 4, fontSize: 12.5, textAlign: 'left' }}>
              <TopicChip topicId={t.id} size="sm" />
              {post.topicId === t.id && <Icon name="check" size={12} color={UI.ok} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Asset picker popover ─────────────────────────────────────
function AssetPickerPopover({ post, rect, onPick, onClose }) {
  const { state } = useStore();
  const [q, setQ] = React.useState('');
  const [filterUnused, setFilterUnused] = React.useState(true);
  const [filterTopic, setFilterTopic] = React.useState(true);
  const usedIds = new Set(state.posts.filter(p => p.assetId && p.id !== post.id).map(p => p.assetId));

  let candidates = state.assets;
  if (post.type) candidates = candidates.filter(a => a.type === post.type);
  if (filterTopic) candidates = candidates.filter(a => a.topic === post.topicId);
  if (filterUnused) candidates = candidates.filter(a => !usedIds.has(a.id));
  if (q) candidates = candidates.filter(a => a.title.toLowerCase().includes(q.toLowerCase()) || a.filename.toLowerCase().includes(q.toLowerCase()));
  candidates = candidates.slice(0, 60);

  const ref = React.useRef(null);
  React.useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onClick, true);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onClick, true); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const left = Math.min((rect?.left || 200), window.innerWidth - 460);
  const top = Math.min((rect?.bottom || 200) + 4, window.innerHeight - 360);

  return ReactDOM.createPortal(
    <div ref={ref} className="pop-in" style={{
      position: 'fixed', top, left, width: 440, zIndex: 70,
      background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 8,
      boxShadow: '0 16px 40px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', maxHeight: 360,
    }}>
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="search" size={13} color={UI.muted} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search asset library…" style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13,
        }} />
      </div>
      <div style={{ padding: '6px 12px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', gap: 6, fontSize: 11, background: UI.panel2 }}>
        <button onClick={() => setFilterTopic(!filterTopic)}>
          <Pill tone={filterTopic ? 'accent' : 'ghost'} size="sm">topic: {post.topicId}</Pill>
        </button>
        <button onClick={() => setFilterUnused(!filterUnused)}>
          <Pill tone={filterUnused ? 'accent' : 'ghost'} size="sm">unused only</Pill>
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ color: UI.muted }}>{candidates.length} matches</span>
      </div>
      <div className="scroll" style={{ flex: 1, overflow: 'auto' }}>
        {candidates.map((a, i) => (
          <button key={a.id} onClick={() => onPick(a.id, { applyTopic: !filterTopic })} className="row-hover"
            style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 90px 70px',
              gap: 8, padding: '7px 12px', alignItems: 'center', width: '100%',
              borderBottom: i < candidates.length - 1 ? `1px solid ${UI.line2}` : 'none',
              textAlign: 'left', fontSize: 12,
            }}>
            <MediaThumb asset={a} size={30} />
            <div className="truncate mono" style={{ fontSize: 11 }}>{a.filename}</div>
            <TopicChip topicId={a.topic} size="sm" />
            <span style={{ fontSize: 10.5, color: usedIds.has(a.id) ? UI.muted : UI.ok, textAlign: 'right' }}>
              {usedIds.has(a.id) ? 'used' : 'available'}
            </span>
          </button>
        ))}
        {candidates.length === 0 && <Empty title="No matches" desc="Try unchecking a filter or search differently." />}
      </div>
      <div style={{ padding: '6px 12px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', gap: 10, fontSize: 11, color: UI.muted, alignItems: 'center' }}>
        <span>↑↓ navigate</span><span>↵ select</span><span>esc cancel</span>
        <div style={{ flex: 1 }} />
        <button style={{ color: UI.accent, fontWeight: 600 }}>+ Upload new</button>
      </div>
    </div>, document.body);
}

// ─── Pattern + Topic panels & helpers continue in next file ───
function addRow(state, dispatch, toast) {
  // find next date after last post
  const lastDate = state.posts.map(p => p.date).sort().pop() || window.DATA.iso(window.DATA.TODAY);
  const nextDate = window.DATA.iso(window.DATA.addDays(new Date(lastDate + 'T00:00:00'), 1));
  // pick alternating topic based on last post for the same slot
  const lastSlotPosts = state.posts.filter(p => p.slotId === state.pattern.slots[0].id);
  const prevTopic = lastSlotPosts.length ? lastSlotPosts.sort((a, b) => a.date.localeCompare(b.date)).pop().topicId : 'business';
  const nextTopic = prevTopic === 'business' ? 'meditation' : 'business';
  const slot = state.pattern.slots[0];
  const id = 'p' + (Date.now()).toString(36);
  dispatch({ type: 'addPost', post: {
    id, date: nextDate, time: slot.time, slotId: slot.id, assetId: null, type: slot.mediaType,
    topicId: nextTopic, captionStatus: 'empty', captionText: '', captionVersions: [],
    exportStatus: 'not', exportedAt: null, notes: '',
  }});
  toast(`Added row · ${fmtDate(nextDate)} · ${nextTopic}`, 'ok');
}

Object.assign(window, { Planner });
