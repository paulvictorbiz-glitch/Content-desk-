// Captions — a focused workspace for the planner's caption cells.
// Each planner row contributes a video caption, a picture description and a
// picture quote. Edit them here, or batch-generate every empty one.

function Captions() {
  const { state, dispatch, toast } = useStore();
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [batch, setBatch] = React.useState(null);

  const items = React.useMemo(() => {
    const out = [];
    state.planner.forEach(r => {
      const v = r.video || {}, p = r.picture || {};
      if ((v.title || '').trim() || (v.text || '').trim()) {
        out.push({ key: r.id + '-vt', rowId: r.id, side: 'video', field: 'text', kind: 'video-text',
          label: v.title || 'Untitled video', date: v.dateTime, value: v.text || '' });
      }
      const hasPic = (p.description || '').trim() || (p.quote || '').trim() || (p.attachment || '').trim();
      if (hasPic) {
        out.push({ key: r.id + '-pd', rowId: r.id, side: 'picture', field: 'description', kind: 'pic-description',
          label: p.attachment || 'Picture post', date: p.dateTime, value: p.description || '' });
        out.push({ key: r.id + '-pq', rowId: r.id, side: 'picture', field: 'quote', kind: 'pic-quote',
          label: p.attachment || 'Picture post', date: p.dateTime, value: p.quote || '' });
      }
    });
    return out;
  }, [state.planner]);

  const rows = items.filter(it => {
    if (filter === 'empty' && it.value.trim()) return false;
    if (filter === 'filled' && !it.value.trim()) return false;
    if (q && !((it.label + ' ' + it.value).toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const emptyCount = items.filter(it => !it.value.trim()).length;

  const generateAllEmpty = async () => {
    const empties = items.filter(it => !it.value.trim());
    if (!empties.length) { toast('No empty captions to generate', 'warn'); return; }
    setBatch({ done: 0, total: empties.length });
    for (let i = 0; i < empties.length; i++) {
      const it = empties[i];
      try {
        const samples = items.filter(x => x.kind === it.kind && x.value.trim()).slice(0, 6).map(x => x.value);
        const res = await fetch('/api/generate-caption', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: it.kind, title: it.label, samples }),
        });
        const data = await res.json();
        if (data.ok) dispatch({ type: 'updatePlannerCell', id: it.rowId, side: it.side, field: it.field, value: data.text });
        else { toast(data.error || 'Generation unavailable', 'accent'); break; }
      } catch (e) { toast('Generation failed: ' + e.message, 'accent'); break; }
      setBatch({ done: i + 1, total: empties.length });
    }
    setBatch(null);
    toast('Batch generation complete', 'ok');
  };

  return (
    <>
      <ScreenHeader title="Captions"
        sub={`${items.length} caption cells · ${emptyCount} empty · ${items.length - emptyCount} written`}>
        <Btn kind="accent" disabled={!!batch || emptyCount === 0} onClick={generateAllEmpty}
          icon={<span className={batch ? 'spin' : ''} style={{ display: 'inline-flex' }}><Icon name="sparkles" size={13} /></span>}>
          {batch ? `Generating ${batch.done}/${batch.total}…` : `Generate all empty (${emptyCount})`}
        </Btn>
      </ScreenHeader>

      <Toolbar>
        <Field placeholder="Search captions…" w={260} sm value={q} onChange={setQ}
          prefix={<Icon name="search" size={13} color={UI.muted} />} />
        <div style={{ display: 'flex', gap: 4 }}>
          {[['all', 'All'], ['empty', 'Empty'], ['filled', 'Written']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: filter === id ? UI.ink : UI.panel, color: filter === id ? '#fff' : UI.ink2,
              border: `1px solid ${filter === id ? UI.ink : UI.line}`,
            }}>{label}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: UI.muted }}>{rows.length} shown</span>
      </Toolbar>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', background: UI.bg, padding: 16 }}>
        {rows.length === 0
          ? <Empty icon={<Icon name="captions" size={26} color={UI.faint} />} title="Nothing here"
              desc={state.planner.length ? 'No caption cells match this filter.' : 'Sync the planner from the reference sheet first.'} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 920, margin: '0 auto' }}>
              {rows.map(it => <CaptionItem key={it.key} item={it} items={items} dispatch={dispatch} toast={toast} />)}
            </div>
          )}
      </div>
    </>
  );
}

const KIND_META = {
  'video-text': { label: 'Video caption', icon: 'video', tone: 'business' },
  'pic-description': { label: 'Picture description', icon: 'image', tone: 'meditation' },
  'pic-quote': { label: 'Picture quote', icon: 'sparkles', tone: 'meditation' },
};

function CaptionItem({ item, items, dispatch, toast }) {
  const [draft, setDraft] = React.useState(item.value);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { setDraft(item.value); }, [item.value]);
  const meta = KIND_META[item.kind] || KIND_META['video-text'];
  const pal = UI.topic[meta.tone] || { c: UI.ink2, bg: UI.panel3 };

  const commit = () => {
    if (draft !== item.value) dispatch({ type: 'updatePlannerCell', id: item.rowId, side: item.side, field: item.field, value: draft });
  };
  const generate = async () => {
    setBusy(true);
    try {
      const samples = items.filter(x => x.kind === item.kind && x.value.trim()).slice(0, 6).map(x => x.value);
      const res = await fetch('/api/generate-caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: item.kind, title: item.label, samples }),
      });
      const data = await res.json();
      if (data.ok) {
        setDraft(data.text);
        dispatch({ type: 'updatePlannerCell', id: item.rowId, side: item.side, field: item.field, value: data.text });
        toast('Caption generated', 'ok');
      } else { toast(data.error || 'Generation unavailable', 'accent'); }
    } catch (e) { toast('Generation failed: ' + e.message, 'accent'); }
    setBusy(false);
  };

  const empty = !item.value.trim();
  return (
    <Card padding={0} style={{ borderColor: empty ? UI.accentBg : UI.line }}>
      <div style={{ padding: '9px 14px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4,
          background: pal.bg, color: pal.c, fontSize: 11, fontWeight: 600 }}>
          <Icon name={meta.icon} size={11} /> {meta.label}
        </span>
        <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500, flex: 1, minWidth: 0 }}>{item.label}</span>
        {item.date && <span className="mono" style={{ fontSize: 11, color: UI.muted }}>{String(item.date).slice(0, 16)}</span>}
        {empty ? <Pill tone="accent" size="sm">empty</Pill> : <Pill tone="ok" size="sm" icon={<Icon name="check" size={10} />}>written</Pill>}
      </div>
      <div style={{ padding: 12 }}>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          placeholder="Write a caption, or use Generate…" rows={3}
          style={{ width: '100%', border: `1px solid ${UI.line}`, borderRadius: 6, padding: '8px 10px',
            fontSize: 12.5, lineHeight: 1.5, fontFamily: item.kind === 'pic-quote' ? UI.mono : UI.font,
            color: UI.ink, background: UI.panel2, resize: 'vertical', outline: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: UI.muted }}>{draft.length} chars</span>
          <div style={{ flex: 1 }} />
          {draft !== item.value && <Btn size="sm" kind="primary" onClick={commit}>Save</Btn>}
          <Btn size="sm" kind={empty ? 'accent' : 'ghost'} onClick={generate} disabled={busy}
            icon={<span className={busy ? 'spin' : ''} style={{ display: 'inline-flex' }}><Icon name="sparkles" size={12} /></span>}>
            {busy ? 'Generating…' : (empty ? 'Generate' : 'Regenerate')}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, { Captions });
