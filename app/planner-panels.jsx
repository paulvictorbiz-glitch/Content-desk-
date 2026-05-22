// Pattern + Topic management panels for the Planner.

function PatternPanel({ onClose }) {
  const { state, dispatch, toast } = useStore();
  const [pattern, setPattern] = React.useState(state.pattern);
  const [genRange, setGenRange] = React.useState({ from: window.DATA.iso(window.DATA.TODAY), to: window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, 30)) });

  const save = () => {
    dispatch({ type: 'updatePattern', patch: pattern });
    toast('Pattern updated', 'ok');
  };

  const addSlot = () => {
    const id = 's' + (pattern.slots.length + 1);
    setPattern({ ...pattern, slots: [...pattern.slots, { id, time: '12:00', mediaType: 'image', defaultTopic: 'business', label: 'Midday · business image' }] });
  };
  const updateSlot = (idx, patch) => {
    setPattern({ ...pattern, slots: pattern.slots.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  };
  const deleteSlot = (idx) => {
    setPattern({ ...pattern, slots: pattern.slots.filter((_, i) => i !== idx) });
  };
  const toggleDay = (d) => {
    const set = new Set(pattern.daysOfWeek);
    if (set.has(d)) set.delete(d); else set.add(d);
    setPattern({ ...pattern, daysOfWeek: [...set] });
  };

  const generate = () => {
    const from = new Date(genRange.from + 'T00:00:00');
    const to = new Date(genRange.to + 'T00:00:00');
    const newPosts = [];
    const existingByKey = new Set(state.posts.map(p => p.date + '@' + p.slotId));
    let dayIdx = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1), dayIdx++) {
      if (!pattern.daysOfWeek.includes(d.getDay())) continue;
      const dateStr = window.DATA.iso(d);
      pattern.slots.forEach((slot, slotIdx) => {
        if (existingByKey.has(dateStr + '@' + slot.id)) return;
        let topicId = slot.defaultTopic;
        if (pattern.rotation === 'alternate-by-day') {
          const base = dayIdx % 2;
          topicId = (base ^ slotIdx) ? otherTopic(slot.defaultTopic, state.topics) : slot.defaultTopic;
        }
        newPosts.push({
          id: 'p' + (Date.now() + dayIdx * 10 + slotIdx).toString(36),
          date: dateStr, time: slot.time, slotId: slot.id, assetId: null, type: slot.mediaType,
          topicId, captionStatus: 'empty', captionText: '', captionVersions: [],
          exportStatus: 'not', exportedAt: null, notes: '',
        });
      });
    }
    if (newPosts.length === 0) { toast('No new slots to generate (all already exist)', 'warn'); return; }
    dispatch({ type: 'addPosts', posts: newPosts });
    dispatch({ type: 'updatePattern', patch: pattern });
    dispatch({ type: 'logActivity', text: `Auto-generated ${newPosts.length} planner rows from pattern` });
    toast(`Generated ${newPosts.length} rows`, 'ok');
  };

  return (
    <Drawer open onClose={onClose} width={560}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="calendar" size={15} color={UI.muted} />
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Posting pattern</div>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} className="clickable" style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={14} color={UI.muted} />
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 18 }}>
        <div style={{ fontSize: 12, color: UI.muted, marginBottom: 14 }}>
          Define the daily rhythm for Nikky's feed. The Planner uses this to auto-generate rows and suggest topic rotation.
        </div>

        {/* Daily slots */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Daily slots <span style={{ color: UI.muted, fontWeight: 400 }}>· {pattern.slots.length}</span></SectionLabel>
          <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 80px 90px 1fr 32px', gap: 8, padding: '8px 12px', background: UI.panel2, fontSize: 10.5, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <div>#</div><div>Time</div><div>Type</div><div>Default topic</div><div></div>
            </div>
            {pattern.slots.map((slot, i) => (
              <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: '36px 80px 90px 1fr 32px', gap: 8, padding: '7px 12px', alignItems: 'center', borderTop: `1px solid ${UI.line2}` }}>
                <div className="mono" style={{ color: UI.muted, fontSize: 11 }}>{i + 1}</div>
                <Field value={slot.time} sm onChange={(v) => updateSlot(i, { time: v })} w={70} />
                <Select value={slot.mediaType} sm options={[['video', 'video'], ['image', 'image']]} onChange={(v) => updateSlot(i, { mediaType: v })} />
                <Select value={slot.defaultTopic} sm options={state.topics.map(t => [t.id, t.name])} onChange={(v) => updateSlot(i, { defaultTopic: v })} />
                <button onClick={() => deleteSlot(i)} className="clickable" style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trash" size={12} color={UI.muted} />
                </button>
              </div>
            ))}
            <button onClick={addSlot} className="row-hover" style={{ padding: '8px 12px', width: '100%', fontSize: 12, color: UI.accent, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${UI.line2}` }}>
              <Icon name="plus" size={12} /> Add slot
            </button>
          </div>
        </div>

        {/* Rotation */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Topic rotation</SectionLabel>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['alternate-by-day', 'Alternate by day', 'Topics flip each day'],
              ['fixed-per-slot', 'Fixed per slot', 'Each slot keeps its default topic'],
            ].map(([v, l, d]) => (
              <button key={v} onClick={() => setPattern({ ...pattern, rotation: v })}
                className="clickable" style={{
                  flex: 1, padding: '10px 12px', border: `1.5px solid ${pattern.rotation === v ? UI.accent : UI.line}`,
                  borderRadius: 6, background: pattern.rotation === v ? UI.accentBg : UI.panel,
                  textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: pattern.rotation === v ? UI.accentInk : UI.ink }}>{l}</div>
                <div style={{ fontSize: 11, color: UI.muted }}>{d}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Days of week */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Active days</SectionLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            {['S','M','T','W','T','F','S'].map((l, d) => {
              const active = pattern.daysOfWeek.includes(d);
              return (
                <button key={d} onClick={() => toggleDay(d)} style={{
                  width: 38, height: 38, borderRadius: 6,
                  background: active ? UI.ink : UI.panel,
                  color: active ? '#fff' : UI.muted,
                  border: `1px solid ${active ? UI.ink : UI.line}`,
                  fontSize: 12.5, fontWeight: 600,
                }}>{l}</button>
              );
            })}
          </div>
        </div>

        {/* Live pattern preview */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>Pattern preview</SectionLabel>
          <div style={{ fontSize: 11.5, color: UI.muted, marginBottom: 8 }}>Next 5 active days using this pattern:</div>
          <PatternPreview pattern={pattern} topics={state.topics} />
        </div>

        {/* Auto-generate */}
        <div style={{ borderTop: `1px solid ${UI.line2}`, paddingTop: 16 }}>
          <SectionLabel>Auto-generate rows</SectionLabel>
          <div style={{ fontSize: 12, color: UI.muted, marginBottom: 8 }}>Create planner rows for every active day in the range. Existing rows are skipped.</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
            <Field value={genRange.from} sm onChange={(v) => setGenRange({ ...genRange, from: v })} w={130}
              prefix={<Icon name="calendar" size={12} color={UI.muted} />} />
            <Icon name="arrowright" size={12} color={UI.muted} />
            <Field value={genRange.to} sm onChange={(v) => setGenRange({ ...genRange, to: v })} w={130}
              prefix={<Icon name="calendar" size={12} color={UI.muted} />} />
            <div style={{ flex: 1 }} />
            <Btn size="sm" kind="accent" icon={<Icon name="sparkles" size={12} />} onClick={generate}>Generate</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 18px', borderTop: `1px solid ${UI.line2}`, background: UI.panel2, display: 'flex', gap: 8 }}>
        <Btn kind="ghost" onClick={onClose}>Cancel</Btn>
        <div style={{ flex: 1 }} />
        <Btn kind="primary" onClick={() => { save(); onClose(); }}>Save pattern</Btn>
      </div>
    </Drawer>
  );
}

function PatternPreview({ pattern, topics }) {
  const days = [];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let dayIdx = 0;
  let collected = 0;
  for (let i = 0; collected < 5 && i < 14; i++) {
    const d = window.DATA.addDays(window.DATA.TODAY, i);
    if (!pattern.daysOfWeek.includes(d.getDay())) continue;
    const slots = pattern.slots.map((slot, slotIdx) => {
      let topicId = slot.defaultTopic;
      if (pattern.rotation === 'alternate-by-day') {
        const base = dayIdx % 2;
        topicId = (base ^ slotIdx) ? otherTopic(slot.defaultTopic, topics) : slot.defaultTopic;
      }
      return { ...slot, topicId };
    });
    days.push({ date: window.DATA.iso(d), label: dayNames[d.getDay()] + ' ' + d.getDate(), slots });
    dayIdx++; collected++;
  }
  return (
    <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden', background: UI.panel }}>
      {days.map((day, i) => (
        <div key={day.date} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none' }}>
          <div style={{ padding: '8px 10px', background: UI.panel2, borderRight: `1px solid ${UI.line2}`, fontSize: 11, color: UI.muted, fontWeight: 600 }}>{day.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {day.slots.map((s, j) => (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '60px 70px 1fr', gap: 8, padding: '7px 10px', alignItems: 'center',
                borderTop: j > 0 ? `1px solid ${UI.line2}` : 'none', fontSize: 12,
              }}>
                <span className="mono" style={{ color: UI.muted }}>{s.time}</span>
                <Pill tone="soft" size="sm" icon={<Icon name={s.mediaType === 'video' ? 'video' : 'image'} size={10} />}>{s.mediaType}</Pill>
                <TopicChip topicId={s.topicId} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function otherTopic(current, topics) {
  // pick another topic id (cycle through)
  const idx = topics.findIndex(t => t.id === current);
  return topics[(idx + 1) % topics.length].id;
}

// ─── Topic management panel ───────────────────────────────────
function TopicPanel({ onClose }) {
  const { state, dispatch, toast } = useStore();
  const [editing, setEditing] = React.useState(null); // topic id
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: '', desc: '' });

  const counts = React.useMemo(() => {
    const m = {};
    state.assets.forEach(a => { m[a.topic] = (m[a.topic] || 0) + 1; });
    return m;
  }, [state.assets]);
  const postCounts = React.useMemo(() => {
    const m = {};
    state.posts.forEach(p => { m[p.topicId] = (m[p.topicId] || 0) + 1; });
    return m;
  }, [state.posts]);

  const commitNew = () => {
    if (!draft.name.trim()) return;
    const id = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    dispatch({ type: 'addTopic', topic: {
      id, name: draft.name, desc: draft.desc, color: '#8a6c4e', accent: 'custom', emoji: '◇',
      promptKey: id,
    }});
    toast(`Added topic "${draft.name}"`, 'ok');
    setAdding(false); setDraft({ name: '', desc: '' });
  };

  return (
    <Drawer open onClose={onClose} width={520}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="dot" size={15} color={UI.muted} />
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Topics &amp; categories</div>
        <div style={{ flex: 1 }} />
        <Btn size="sm" kind="ghost" icon={<Icon name="plus" size={12} />} onClick={() => setAdding(true)}>New topic</Btn>
        <button onClick={onClose} className="clickable" style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={14} color={UI.muted} />
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 18 }}>
        <div style={{ fontSize: 12, color: UI.muted, marginBottom: 14 }}>
          Topics define style/voice and drive the LLM prompt used for caption generation.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.topics.map(t => (
            <div key={t.id} style={{
              border: `1px solid ${UI.line}`, borderRadius: 8, padding: 14,
              background: UI.panel, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TopicChip topicId={t.id} />
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: UI.muted }}>{counts[t.id] || 0} assets · {postCounts[t.id] || 0} posts</span>
                <button onClick={() => setEditing(editing === t.id ? null : t.id)} className="clickable" style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="edit" size={12} color={UI.muted} />
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: UI.ink2 }}>{t.desc}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: UI.muted }}>
                <Icon name="sparkles" size={11} />
                <span>Uses prompt: <code className="mono">{t.promptKey}</code></span>
                <div style={{ flex: 1 }} />
                <button style={{ color: UI.accent, fontWeight: 600 }} onClick={() => { onClose(); window.location.hash = `#/settings/prompts/${t.id}`; }}>
                  Edit prompt →
                </button>
              </div>
            </div>
          ))}

          {adding && (
            <div style={{ border: `1.5px solid ${UI.accent}`, borderRadius: 8, padding: 14, background: UI.panel, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Topic name (e.g. Travel)" autoFocus />
              <Field value={draft.desc} onChange={(v) => setDraft({ ...draft, desc: v })} placeholder="Short description / voice guidance" />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Btn size="sm" kind="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
                <Btn size="sm" kind="primary" onClick={commitNew}>Add topic</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, marginBottom: 8 }}>{children}</div>;
}

Object.assign(window, { PatternPanel, TopicPanel, otherTopic, PatternPreview, SectionLabel });
