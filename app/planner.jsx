// Planner — mirrors the reference sheet's "Planable CSV Output" tab:
// VIDEOS on the left, PICTURES on the right, one row per scheduled day.
// Editable; edits persist to localStorage (see state.jsx). "Sync from Sheet"
// pulls a fresh copy via drive-sync/sheet-sync.py.

const PCOLS = '34px minmax(140px,1.2fr) minmax(185px,2fr) 100px 96px ' +
              'minmax(116px,1fr) minmax(175px,1.8fr) minmax(175px,1.8fr) 100px 32px';

function Planner() {
  const { state, dispatch, toast } = useStore();
  const { go } = useRoute();
  const [syncing, setSyncing] = React.useState(false);
  const rows = state.planner;

  // Drive-link lookup — match a sheet title/attachment to a Drive asset's link.
  const driveLink = React.useMemo(() => {
    const norm = (s) => (s || '').toLowerCase().replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[^a-z0-9]+/g, '');
    const map = {};
    state.assets.forEach(a => {
      if (!a.webViewLink) return;
      [a.title, a.filename].forEach(k => {
        const n = norm(k);
        if (n && !map[n]) map[n] = a.webViewLink;
      });
    });
    return (name) => map[norm(name)] || null;
  }, [state.assets]);

  const syncSheet = async () => {
    setSyncing(true);
    toast('Syncing planner from the reference sheet…', 'accent');
    try {
      const res = await fetch('/api/sync-sheet', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        // Drop the local working copy so the fresh sheet data loads.
        try { localStorage.removeItem('cd_planner'); } catch (e) {}
        toast(`Synced ${data.count != null ? data.count + ' ' : ''}planner rows — reloading…`, 'ok');
        setTimeout(() => window.location.reload(), 1100);
      } else {
        setSyncing(false);
        console.error('Sheet sync failed:', data.error);
        toast('Sheet sync failed — check the server window', 'accent');
      }
    } catch (e) {
      setSyncing(false);
      toast('Sheet sync failed: ' + e.message, 'accent');
    }
  };

  const videoCount = rows.filter(r => r.video && (r.video.title || '').trim()).length;
  const picCount = rows.filter(r => r.picture && ((r.picture.description || '').trim() || (r.picture.attachment || '').trim())).length;
  const postedCount = rows.filter(r => r.posted).length;

  return (
    <>
      <ScreenHeader title="Planner"
        sub={rows.length
          ? `${rows.length} rows · ${videoCount} videos · ${picCount} pictures · ${postedCount} on Planable`
          : 'Mirrors the reference sheet — Planable CSV Output'}>
        <Btn kind="ghost" disabled={syncing} onClick={syncing ? undefined : syncSheet}
          icon={<span className={syncing ? 'spin' : ''} style={{ display: 'inline-flex' }}><Icon name="refresh" size={13} /></span>}>
          {syncing ? 'Syncing…' : 'Sync from Sheet'}
        </Btn>
        <Btn kind="ghost" icon={<Icon name="download" size={13} />} onClick={() => go({ tab: 'export' })}>Export</Btn>
        <Btn kind="primary" icon={<Icon name="plus" size={13} />} onClick={() => dispatch({ type: 'addPlannerRow' })}>Add row</Btn>
      </ScreenHeader>

      {rows.length === 0 ? (
        <Empty icon={<Icon name="planner" size={28} color={UI.faint} />}
          title="No planner rows yet"
          desc="Pull the schedule from the reference sheet's 'Planable CSV Output' tab, or add a row manually."
          action={<Btn kind="primary" onClick={syncSheet} icon={<Icon name="refresh" size={13} />}>Sync from Sheet</Btn>} />
      ) : (
        <PlannerTable rows={rows} driveLink={driveLink} dispatch={dispatch} />
      )}
    </>
  );
}

function PlannerTable({ rows, driveLink, dispatch }) {
  const colHead = ['#', 'Title', 'Caption', 'Date · Time', 'Planable',
    'Picture', 'Description', 'Quote', 'Date · Time', ''];
  return (
    <div className="scroll" style={{ flex: 1, overflow: 'auto', background: UI.panel }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 4 }}>
        {/* group header — VIDEOS | PICTURES, divider aligned to the column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: PCOLS, borderBottom: `1px solid ${UI.line2}` }}>
          <div style={{ gridColumn: '1 / 6', padding: '7px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.7,
            textTransform: 'uppercase', color: UI.topic.business.c, background: UI.topic.business.bg,
            display: 'flex', alignItems: 'center', gap: 6, borderRight: `2px solid ${UI.lineStrong}` }}>
            <Icon name="video" size={12} /> Videos — left
          </div>
          <div style={{ gridColumn: '6 / 11', padding: '7px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.7,
            textTransform: 'uppercase', color: UI.topic.meditation.c, background: UI.topic.meditation.bg,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="image" size={12} /> Pictures — right
          </div>
        </div>
        {/* column header */}
        <div style={{ display: 'grid', gridTemplateColumns: PCOLS, background: UI.panel2,
          borderBottom: `1px solid ${UI.line}`, fontSize: 10.5, color: UI.muted,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {colHead.map((h, i) => (
            <div key={i} style={{ padding: '7px 12px',
              borderRight: i === 4 ? `2px solid ${UI.lineStrong}` : (i < 9 ? `1px solid ${UI.line2}` : 'none') }}>{h}</div>
          ))}
        </div>
      </div>

      {rows.map(r => <PlannerRow key={r.id} row={r} driveLink={driveLink} dispatch={dispatch} />)}

      <button onClick={() => dispatch({ type: 'addPlannerRow' })} className="row-hover" style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', width: '100%',
        fontSize: 12.5, color: UI.muted, textAlign: 'left', borderBottom: `1px solid ${UI.line2}`,
      }}>
        <Icon name="plus" size={14} /> Add a planner row
      </button>
    </div>
  );
}

function PlannerRow({ row, driveLink, dispatch }) {
  const v = row.video || {};
  const p = row.picture || {};
  const vlink = driveLink(v.title);
  const plink = p.attachment ? driveLink(p.attachment) : null;
  const base = { padding: '7px 10px', borderRight: `1px solid ${UI.line2}`, minWidth: 0 };
  const set = (side, field, value) => dispatch({ type: 'updatePlannerCell', id: row.id, side, field, value });

  return (
    <div className="row-hover" style={{
      display: 'grid', gridTemplateColumns: PCOLS, alignItems: 'stretch',
      borderBottom: `1px solid ${UI.line2}`,
      background: row.posted ? UI.panel2 : UI.panel,
    }}>
      {/* # */}
      <div className="mono" style={{ ...base, fontSize: 11, color: UI.faint, display: 'flex', alignItems: 'center' }}>{row.n}</div>

      {/* video title + Drive link */}
      <div style={{ ...base, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableText value={v.title} placeholder="video title…"
            onCommit={(val) => set('video', 'title', val)} />
        </div>
        {(v.title || '').trim() && (vlink
          ? <a href={vlink} target="_blank" rel="noreferrer" title="Open video in Google Drive"
              style={{ flexShrink: 0, display: 'inline-flex', color: UI.info }}><Icon name="external" size={13} /></a>
          : <span title="No matching Drive file" style={{ flexShrink: 0, display: 'inline-flex', color: UI.faint }}><Icon name="drive" size={12} /></span>)}
      </div>

      {/* video caption */}
      <CaptionCell row={row} side="video" field="text" kind="video-text" dispatch={dispatch} />

      {/* video date/time */}
      <div style={{ ...base, display: 'flex', alignItems: 'center' }}>
        <DateCell value={v.dateTime} onCommit={(val) => set('video', 'dateTime', val)} />
      </div>

      {/* Planable flag (sheet column D) */}
      <div style={{ ...base, borderRight: `2px solid ${UI.lineStrong}`, display: 'flex', alignItems: 'center' }}>
        <PlanableFlag row={row} dispatch={dispatch} />
      </div>

      {/* picture attachment */}
      <div style={{ ...base, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableText value={p.attachment} placeholder="attachment…" mono
            onCommit={(val) => set('picture', 'attachment', val)} />
        </div>
        {plink && <a href={plink} target="_blank" rel="noreferrer" title="Open picture in Google Drive"
          style={{ flexShrink: 0, display: 'inline-flex', color: UI.info }}><Icon name="external" size={12} /></a>}
      </div>

      {/* picture description */}
      <CaptionCell row={row} side="picture" field="description" kind="pic-description" dispatch={dispatch} />

      {/* picture quote */}
      <CaptionCell row={row} side="picture" field="quote" kind="pic-quote" dispatch={dispatch} mono />

      {/* picture date/time */}
      <div style={{ ...base, display: 'flex', alignItems: 'center' }}>
        <DateCell value={p.dateTime} onCommit={(val) => set('picture', 'dateTime', val)} />
      </div>

      {/* delete */}
      <div style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => dispatch({ type: 'deletePlannerRow', id: row.id })}
          className="clickable" title="Delete row"
          style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="trash" size={12} color={UI.faint} />
        </button>
      </div>
    </div>
  );
}

// A caption / description / quote cell — always editable; shows a Generate
// button (an LLM target) while it is empty.
function CaptionCell({ row, side, field, kind, mono, dispatch }) {
  const value = ((row[side] || {})[field]) || '';
  const has = value.trim();
  return (
    <div style={{ padding: '7px 10px', borderRight: `1px solid ${UI.line2}`, minWidth: 0 }}>
      <EditableText value={value} multiline mono={mono} placeholder="empty"
        onCommit={(val) => dispatch({ type: 'updatePlannerCell', id: row.id, side, field, value: val })} />
      {!has && <GenerateButton kind={kind} row={row} side={side} field={field} dispatch={dispatch} />}
    </div>
  );
}

const KIND_LABEL = { 'video-text': 'caption', 'pic-description': 'description', 'pic-quote': 'quote' };

// LLM affordance for an empty cell. Calls /api/generate-caption, writes the
// result straight into the planner row.
function GenerateButton({ kind, row, side, field, dispatch }) {
  const { state, toast } = useStore();
  const [busy, setBusy] = React.useState(false);

  const gen = async () => {
    setBusy(true);
    try {
      const rows = state.planner || [];
      const pick = (sel) => rows.map(sel).filter(t => t && String(t).trim()).slice(0, 6);
      let samples = [];
      if (kind === 'video-text') samples = pick(r => r.video && r.video.text);
      else if (kind === 'pic-description') samples = pick(r => r.picture && r.picture.description);
      else samples = pick(r => r.picture && r.picture.quote);
      const res = await fetch('/api/generate-caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title: (row.video && row.video.title) || (row.picture && row.picture.attachment) || '',
          samples,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        dispatch({ type: 'updatePlannerCell', id: row.id, side, field, value: data.text });
        toast('Caption generated', 'ok');
      } else {
        setBusy(false);
        toast(data.error || 'Generation unavailable', 'accent');
      }
    } catch (e) { setBusy(false); toast('Generation failed: ' + e.message, 'accent'); }
  };

  return (
    <button onClick={gen} disabled={busy} className="focus-ring" style={{
      marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 4, fontSize: 10.5, fontWeight: 500,
      background: busy ? UI.panel3 : UI.accentBg, color: UI.accentInk,
      border: 'none', cursor: busy ? 'default' : 'pointer',
    }} title={`Generate a ${KIND_LABEL[kind] || 'caption'} with the LLM`}>
      <span className={busy ? 'spin' : ''} style={{ display: 'inline-flex' }}><Icon name="sparkles" size={10} /></span>
      {busy ? 'Generating…' : 'Generate'}
    </button>
  );
}

// Click-to-edit text cell — single line by default, multiline for captions.
function EditableText({ value, onCommit, multiline, mono, placeholder, clamp = 3 }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value || '');
  React.useEffect(() => { if (!editing) setDraft(value || ''); }, [value, editing]);

  const commit = () => { setEditing(false); if (draft !== (value || '')) onCommit(draft); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  if (editing) {
    const sharedStyle = {
      width: '100%', border: `1.5px solid ${UI.accent}`, borderRadius: 4, outline: 'none',
      padding: '5px 7px', fontSize: 11.5, lineHeight: 1.42,
      fontFamily: mono ? UI.mono : UI.font, color: UI.ink, background: UI.panel,
    };
    if (multiline) {
      return <textarea autoFocus value={draft} rows={5}
        onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
        style={{ ...sharedStyle, resize: 'vertical' }} />;
    }
    return <input autoFocus value={draft}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      style={sharedStyle} />;
  }

  const has = value && String(value).trim();
  return (
    <div onClick={() => setEditing(true)} style={{
      cursor: 'text', minHeight: 18, fontSize: 11.5, lineHeight: 1.42,
      fontFamily: mono ? UI.mono : UI.font, color: has ? UI.ink : UI.faint,
      ...(multiline
        ? { display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
        : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
    }} title={has ? value : ''}>
      {has ? value : <span style={{ fontStyle: 'italic' }}>{placeholder || '—'}</span>}
    </div>
  );
}

function DateCell({ value, onCommit }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value || '');
  React.useEffect(() => { if (!editing) setDraft(value || ''); }, [value, editing]);
  const commit = () => { setEditing(false); if (draft !== (value || '')) onCommit(draft); };

  if (editing) {
    return <input autoFocus value={draft} placeholder="YYYY-MM-DD HH:MM"
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); } }}
      style={{ width: '100%', border: `1.5px solid ${UI.accent}`, borderRadius: 4, outline: 'none',
        padding: '4px 6px', fontSize: 10.5, fontFamily: UI.mono, color: UI.ink, background: UI.panel }} />;
  }
  const parts = String(value || '').split(' ');
  const d = parts[0], t = parts[1];
  return (
    <div onClick={() => setEditing(true)} className="mono" style={{ cursor: 'text', fontSize: 11, lineHeight: 1.3, width: '100%' }}>
      <div style={{ color: d ? UI.ink : UI.faint }}>{d || '—'}</div>
      {t && <div style={{ color: UI.muted, fontSize: 10.5 }}>{t.slice(0, 5)}</div>}
    </div>
  );
}

function PlanableFlag({ row, dispatch }) {
  const onClick = () => dispatch({ type: 'cyclePosted', id: row.id });
  let pill;
  if (row.posted) pill = <Pill tone="ok" size="sm" icon={<Icon name="check" size={10} />}>on Planable</Pill>;
  else if ((row.postedRaw || '').toLowerCase() === 'na') pill = <Pill tone="ghost" size="sm">n/a</Pill>;
  else pill = <Pill tone="warn" size="sm">pending</Pill>;
  return <button onClick={onClick} title="Click to change Planable status" style={{ cursor: 'pointer' }}>{pill}</button>;
}

Object.assign(window, { Planner });
