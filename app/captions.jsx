// Captions — split list/editor, batch generation, deep-linkable.

function Captions() {
  const { state, dispatch, toast } = useStore();
  const { route, go } = useRoute();

  // Filters
  const statusFilter = (route.query.status || 'not-final').split(',').filter(Boolean);
  const dateFilter = route.query.date || 'all';
  const typeFilter = route.query.type || 'all';
  const focusPostId = route.query.post || null;

  const [batchOpen, setBatchOpen] = React.useState(false);
  const [q, setQ] = React.useState('');

  const assetMap = React.useMemo(() => Object.fromEntries(state.assets.map(a => [a.id, a])), [state.assets]);

  const today = window.DATA.iso(window.DATA.TODAY);
  const dateInRange = (postDate) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today') return postDate === today;
    if (dateFilter === 'next7') {
      const n = daysFromToday(postDate);
      return n >= 0 && n <= 7;
    }
    if (dateFilter === 'next30') {
      const n = daysFromToday(postDate);
      return n >= 0 && n <= 30;
    }
    return true;
  };

  const rows = state.posts.filter(p => {
    // Status: support 'not-final' shorthand
    if (statusFilter.includes('not-final')) {
      if (p.captionStatus === 'final') return false;
    } else if (statusFilter.length && !statusFilter.includes('all')) {
      if (!statusFilter.includes(p.captionStatus)) return false;
    }
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (!dateInRange(p.date)) return false;
    if (q) {
      const asset = p.assetId ? assetMap[p.assetId] : null;
      const hay = ((asset?.title || '') + ' ' + (asset?.filename || '') + ' ' + (p.captionText || '')).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Default focused post = first row or query param
  const selected = focusPostId
    ? state.posts.find(p => p.id === focusPostId)
    : rows[0] || state.posts.find(p => p.captionStatus !== 'final');

  const emptyCount = state.posts.filter(p => p.captionStatus === 'empty' && daysFromToday(p.date) >= 0).length;

  return (
    <>
      <ScreenHeader title="Captions" sub={`${state.posts.length} posts · ${state.posts.filter(p => p.captionStatus === 'empty').length} empty · ${state.posts.filter(p => p.captionStatus === 'draft').length} draft · ${state.posts.filter(p => p.captionStatus === 'final').length} final`}>
        <Btn kind="ghost" icon={<Icon name="settings" size={13} />}
          onClick={() => go({ tab: 'settings', sub: ['prompts'] })}>Edit prompts</Btn>
        <Btn kind="accent" icon={<Icon name="sparkles" size={13} />} onClick={() => setBatchOpen(true)} disabled={emptyCount === 0}>
          Generate all empty ({emptyCount})
        </Btn>
      </ScreenHeader>

      <Toolbar>
        <Field placeholder="Search…" w={200} sm value={q} onChange={setQ}
          prefix={<Icon name="search" size={13} color={UI.muted} />} />
        <Select label="Status" value={statusFilter.join(',') || 'all'} sm
          onChange={(v) => go({ tab: 'captions', query: { ...route.query, status: v } })}
          options={[['all', 'All'], ['not-final', 'Not final'], ['empty', 'Empty only'], ['draft', 'Draft only'], ['final', 'Final only'], ['empty,draft', 'Empty + draft']]} />
        <Select label="Date" value={dateFilter} sm
          onChange={(v) => go({ tab: 'captions', query: { ...route.query, date: v } })}
          options={[['all', 'All dates'], ['today', 'Today'], ['next7', 'Next 7 days'], ['next30', 'Next 30 days']]} />
        <Select label="Type" value={typeFilter} sm
          onChange={(v) => go({ tab: 'captions', query: { ...route.query, type: v } })}
          options={[['all', 'All'], ['video', 'Video'], ['image', 'Image']]} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: UI.muted }}>{rows.length} of {state.posts.length}</span>
      </Toolbar>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) 1.4fr' }}>
        <CaptionsList rows={rows} selectedId={selected?.id} assetMap={assetMap}
          onSelect={(id) => go({ tab: 'captions', query: { ...route.query, post: id } })} />
        <CaptionEditor post={selected} asset={selected?.assetId ? assetMap[selected.assetId] : null}
          rows={rows} onNav={(dir) => {
            if (!selected) return;
            const idx = rows.findIndex(r => r.id === selected.id);
            const next = rows[idx + dir];
            if (next) go({ tab: 'captions', query: { ...route.query, post: next.id } });
          }} />
      </div>

      {batchOpen && <BatchGenerateModal onClose={() => setBatchOpen(false)} />}
    </>
  );
}

function CaptionsList({ rows, selectedId, assetMap, onSelect }) {
  return (
    <div className="scroll" style={{ overflow: 'auto', borderRight: `1px solid ${UI.line}`, background: UI.panel }}>
      {rows.length === 0 && (
        <Empty title="No posts match filters" desc="Try removing filters above." />
      )}
      {rows.map((p, i) => {
        const asset = p.assetId ? assetMap[p.assetId] : null;
        const isSel = selectedId === p.id;
        return (
          <button key={p.id} onClick={() => onSelect(p.id)} className="row-hover"
            style={{
              display: 'grid', gridTemplateColumns: '54px 36px 1fr 90px 70px',
              gap: 10, padding: '10px 16px', alignItems: 'center', width: '100%',
              background: isSel ? UI.accentBg : 'transparent',
              borderBottom: `1px solid ${UI.line2}`,
              borderLeft: `3px solid ${isSel ? UI.accent : 'transparent'}`,
              textAlign: 'left',
            }}>
            <div className="mono" style={{ fontSize: 11, color: UI.muted, lineHeight: 1.2 }}>
              <div>{p.date.slice(5)}</div>
              <div style={{ color: UI.faint, fontSize: 10 }}>{p.time}</div>
            </div>
            {asset ? <MediaThumb asset={asset} size={32} /> : (
              <div style={{ width: 32, height: 32, borderRadius: 4, background: UI.accentBg, color: UI.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${UI.accent}` }}>
                <Icon name="warning" size={13} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>
                {asset?.title || <span style={{ color: UI.accent }}>— no asset linked —</span>}
              </div>
              {p.captionText && <div className="truncate" style={{ fontSize: 11, color: UI.muted, marginTop: 2 }}>{p.captionText.split('\n')[0]}</div>}
            </div>
            <TopicChip topicId={p.topicId} size="sm" />
            <CaptionPill status={p.captionStatus} size="sm" />
          </button>
        );
      })}
    </div>
  );
}

function CaptionEditor({ post, asset, rows, onNav }) {
  const { state, dispatch, toast } = useStore();
  const { go } = useRoute();
  const [draft, setDraft] = React.useState(post?.captionText || '');
  const [generating, setGenerating] = React.useState(false);

  // Sync draft when post changes (without losing in-progress edits to current post)
  const lastPostId = React.useRef(post?.id);
  React.useEffect(() => {
    if (post?.id !== lastPostId.current) {
      setDraft(post?.captionText || '');
      lastPostId.current = post?.id;
    }
  }, [post?.id, post?.captionText]);

  if (!post) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: UI.panel2 }}>
        <Empty title="Pick a post from the list" desc="Or use the buttons in the header to bulk-generate captions." />
      </div>
    );
  }

  const topic = state.topics.find(t => t.id === post.topicId);
  const charCount = draft.length;
  const idx = rows.findIndex(r => r.id === post.id);

  const updateDraft = (v) => {
    setDraft(v);
    const newStatus = v.trim() ? (post.captionStatus === 'final' ? 'final' : 'draft') : 'empty';
    dispatch({ type: 'updatePost', id: post.id, patch: { captionText: v, captionStatus: newStatus } });
  };

  const generate = (replace = true) => {
    setGenerating(true);
    setTimeout(() => {
      const pool = window.DATA.captionsByTopic[post.topicId] || window.DATA.captionsByTopic.business;
      const base = pool[Math.floor(Math.random() * pool.length)];
      const tags = window.DATA.hashtagsByTopic[post.topicId] || '#mindset #focus';
      const newText = base + '\n\n' + tags;
      if (replace) {
        const versions = [...(post.captionVersions || []), { v: (post.captionVersions?.length || 0) + 1, at: new Date().toISOString().slice(0, 16), text: newText, by: 'llm' }];
        dispatch({ type: 'updatePost', id: post.id, patch: { captionText: newText, captionStatus: post.captionStatus === 'final' ? 'final' : 'draft', captionVersions: versions } });
        setDraft(newText);
      }
      setGenerating(false);
      toast('Caption generated', 'ok');
    }, 950);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: UI.panel, minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11.5, color: UI.muted }}>
            <span className="mono">{fmtDate(post.date)} · {post.time}</span>
            <Sep />
            <span>{relativeDay(post.date)}</span>
          </div>
          <div className="truncate" style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>
            {asset?.title || <span style={{ color: UI.accent }}>No asset linked</span>}
          </div>
        </div>
        <TopicChip topicId={post.topicId} />
        <CaptionPill status={post.captionStatus} />
      </div>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Asset preview */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          {asset ? (
            <div style={{ width: 130, aspectRatio: '9/16', flexShrink: 0, position: 'relative' }}>
              <MediaThumb asset={asset} size={130} withIcon={false} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={asset.type === 'video' ? 'video' : 'image'} size={18} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: 130, aspectRatio: '9/16', background: UI.accentBg, border: `1.5px dashed ${UI.accent}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: UI.accentInk, fontSize: 12, padding: 10, textAlign: 'center' }}>
              <Icon name="warning" size={20} />
              <div style={{ marginTop: 6, fontWeight: 600 }}>Asset missing</div>
              <button onClick={() => go({ tab: 'planner', query: { highlight: post.id, filter: 'missing-asset' } })}
                style={{ color: UI.accent, fontWeight: 600, marginTop: 4 }}>Link in Planner →</button>
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1, fontSize: 12.5, color: UI.ink2 }}>
            <div style={{ color: UI.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Asset title</div>
            <div className="mono" style={{ fontSize: 11.5 }}>{asset?.filename || '—'}</div>

            <div style={{ color: UI.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 }}>Voice guidance · {topic?.name}</div>
            <div style={{ lineHeight: 1.5 }}>{topic?.desc}</div>

            {asset && (
              <button onClick={() => go({ tab: 'assets', sub: [asset.id] })} style={{
                marginTop: 12, fontSize: 11.5, color: UI.muted, display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                Open asset detail <Icon name="external" size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Caption box */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Caption</div>
          <span className="mono" style={{ fontSize: 11, color: UI.muted }}>{charCount} / 2200</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: UI.muted }}>auto-saved</span>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea value={draft} onChange={(e) => updateDraft(e.target.value)}
            placeholder={post.captionStatus === 'empty' ? 'Click "Generate" or write the caption manually…' : ''}
            style={{
              width: '100%', minHeight: 160, padding: 14, fontSize: 13.5, lineHeight: 1.55,
              border: `1px solid ${UI.line}`, borderRadius: 6, background: UI.panel,
              fontFamily: UI.font, color: UI.ink, resize: 'vertical', outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = UI.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = UI.line} />
          {generating && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', borderRadius: 6,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <Icon name="sparkles" size={22} className="pulse" color={UI.accent} />
              <div style={{ fontSize: 12, color: UI.ink2 }}>Generating caption…</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn kind="accent" icon={<Icon name="sparkles" size={13} />} onClick={() => generate(true)} disabled={generating}>
            {draft.trim() ? 'Regenerate' : 'Generate'}
          </Btn>
          <Btn kind="ghost" size="sm" onClick={() => generate(true)}>+ longer</Btn>
          <Btn kind="ghost" size="sm" onClick={() => generate(true)}>+ shorter</Btn>
          <Btn kind="ghost" size="sm" onClick={() => generate(true)}>+ hashtags</Btn>
          <div style={{ flex: 1 }} />
          <Btn kind="default" onClick={() => dispatch({ type: 'updatePost', id: post.id, patch: { captionStatus: 'draft' } })}>Mark draft</Btn>
          <Btn kind="primary" icon={<Icon name="check" size={13} />}
            onClick={() => { dispatch({ type: 'updatePost', id: post.id, patch: { captionStatus: 'final' } }); toast('Marked final', 'ok'); }}
            disabled={!draft.trim()}>
            Mark final
          </Btn>
        </div>

        {/* History */}
        {post.captionVersions && post.captionVersions.length > 0 && (
          <div style={{ marginTop: 22, borderTop: `1px dashed ${UI.line}`, paddingTop: 12 }}>
            <div style={{ fontSize: 11.5, color: UI.muted, marginBottom: 6 }}>{post.captionVersions.length} previous generation{post.captionVersions.length === 1 ? '' : 's'}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill tone="contrast" size="sm">current</Pill>
              {post.captionVersions.slice().reverse().map(v => (
                <Pill key={v.v} tone="soft" size="sm">v{v.v} · {v.at.slice(11)}</Pill>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ padding: '10px 20px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Btn size="sm" kind="ghost" icon={<Icon name="arrowleft" size={12} />} onClick={() => onNav(-1)} disabled={idx <= 0}>Prev</Btn>
        <Btn size="sm" kind="ghost" suffix={<Icon name="arrowright" size={12} />} onClick={() => onNav(1)} disabled={idx >= rows.length - 1}>Next</Btn>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: UI.muted }}>{idx + 1} of {rows.length}</span>
      </div>
    </div>
  );
}

// ─── Batch generation modal ───────────────────────────────────
function BatchGenerateModal({ onClose }) {
  const { state, dispatch, toast } = useStore();
  const empties = React.useMemo(() => state.posts.filter(p => p.captionStatus === 'empty' && daysFromToday(p.date) >= 0).slice(0, 20), []);
  const [doneIds, setDoneIds] = React.useState(new Set());
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (paused || done || currentIdx >= empties.length) {
      if (currentIdx >= empties.length && !done) {
        setDone(true);
        dispatch({ type: 'logActivity', text: `Generated ${empties.length} captions (batch)` });
      }
      return;
    }
    const t = setTimeout(() => {
      const p = empties[currentIdx];
      const pool = window.DATA.captionsByTopic[p.topicId] || window.DATA.captionsByTopic.business;
      const text = pool[(currentIdx + 3) % pool.length] + '\n\n' + (window.DATA.hashtagsByTopic[p.topicId] || '');
      dispatch({ type: 'updatePost', id: p.id, patch: { captionText: text, captionStatus: 'draft', captionVersions: [{ v: 1, at: new Date().toISOString().slice(0, 16), text, by: 'llm' }] } });
      setDoneIds(prev => new Set([...prev, p.id]));
      setCurrentIdx(currentIdx + 1);
    }, 580);
    return () => clearTimeout(t);
  }, [currentIdx, paused, done, empties]); // eslint-disable-line

  const pct = empties.length ? (doneIds.size / empties.length) * 100 : 0;

  return (
    <Modal open onClose={onClose} width={560}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={15} color={UI.accent} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>{done ? 'Batch complete' : 'Generating captions'}</div>
        <div style={{ flex: 1 }} />
        <Pill tone={done ? 'ok' : 'accent'} size="sm">{doneIds.size} of {empties.length}</Pill>
      </div>

      <div style={{ padding: 18, maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ height: 8, background: UI.panel2, borderRadius: 999, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: done ? UI.ok : UI.accent, borderRadius: 999, transition: 'width .3s' }} />
        </div>

        <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden' }}>
          {empties.map((p, i) => {
            const isDone = doneIds.has(p.id);
            const isCurrent = i === currentIdx && !done && !paused;
            const asset = p.assetId ? state.assets.find(a => a.id === p.assetId) : null;
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '24px 60px 28px 1fr 90px 90px', gap: 10,
                padding: '7px 12px', alignItems: 'center', fontSize: 12,
                borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none',
                background: isCurrent ? UI.accentBg : 'transparent',
                opacity: isDone ? 0.65 : 1,
              }}>
                <div>
                  {isDone ? <Icon name="check" size={14} color={UI.ok} /> :
                    isCurrent ? <Icon name="sparkles" size={13} color={UI.accent} className="pulse" /> :
                    <span style={{ width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${UI.line}`, display: 'inline-block' }} />}
                </div>
                <div className="mono" style={{ fontSize: 11, color: UI.muted }}>{p.date.slice(5)}</div>
                {asset ? <MediaThumb asset={asset} size={22} /> : <div style={{ width: 22, height: 22, background: UI.panel3, borderRadius: 4 }} />}
                <div className="truncate mono" style={{ fontSize: 11 }}>{asset?.filename || '—'}</div>
                <TopicChip topicId={p.topicId} size="sm" />
                <div style={{ fontSize: 11, color: isCurrent ? UI.accent : isDone ? UI.ok : UI.muted, textAlign: 'right' }}>
                  {isDone ? 'as draft' : isCurrent ? 'generating…' : 'queued'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, padding: 12, background: UI.panel2, borderRadius: 6, fontSize: 11.5, color: UI.muted }}>
          Each result is marked <b style={{ color: UI.warn }}>draft</b> for your review. Use the editor to refine or mark final.
        </div>
      </div>

      <div style={{ padding: '12px 18px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', gap: 8 }}>
        {!done && <Btn kind="ghost" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</Btn>}
        {!done && <Btn kind="danger" onClick={() => { setDone(true); toast(`Stopped — kept ${doneIds.size} done`, 'warn'); }}>Stop &amp; keep done</Btn>}
        <div style={{ flex: 1 }} />
        <Btn kind="primary" onClick={onClose}>{done ? 'Done' : 'Run in background'}</Btn>
      </div>
    </Modal>
  );
}

Object.assign(window, { Captions });
