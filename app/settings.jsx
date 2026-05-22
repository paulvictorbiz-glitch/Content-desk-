// Settings — left sub-nav with sections.

function SettingsScreen() {
  const { route, go } = useRoute();
  const sub = route.sub[0] || 'prompts';
  const sections = [
    { id: 'prompts',   label: 'Caption prompts', icon: 'sparkles' },
    { id: 'topics',    label: 'Topics',          icon: 'dot' },
    { id: 'pattern',   label: 'Daily pattern',   icon: 'calendar' },
    { id: 'drive',     label: 'Drive folders',   icon: 'drive' },
    { id: 'rename',    label: 'File renaming',   icon: 'edit' },
    { id: 'planable',  label: 'Planable export', icon: 'exporticon' },
    { id: 'danger',    label: 'Danger zone',     icon: 'warning' },
  ];

  return (
    <>
      <ScreenHeader title="Settings" sub="Client-specific configuration · Nikky Kho" />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        <div style={{ borderRight: `1px solid ${UI.line}`, background: UI.panel2, padding: '14px 0' }}>
          {sections.map(s => {
            const active = sub === s.id;
            return (
              <button key={s.id} onClick={() => go({ tab: 'settings', sub: [s.id] })} className="clickable"
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 18px', width: '100%',
                  fontSize: 12.5, fontWeight: active ? 600 : 500,
                  color: active ? UI.ink : UI.ink2,
                  background: active ? UI.panel : 'transparent',
                  borderLeft: `2px solid ${active ? UI.accent : 'transparent'}`,
                  textAlign: 'left',
                }}>
                <Icon name={s.icon} size={13} color={active ? UI.accent : UI.muted} />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="scroll" style={{ overflow: 'auto', padding: 24, background: UI.panel }}>
          {sub === 'prompts'  && <PromptsSection />}
          {sub === 'topics'   && <TopicsSection />}
          {sub === 'pattern'  && <PatternSection />}
          {sub === 'drive'    && <DriveSection />}
          {sub === 'rename'   && <RenameSection />}
          {sub === 'planable' && <PlanableSection />}
          {sub === 'danger'   && <DangerSection />}
        </div>
      </div>
    </>
  );
}

// ─── Prompts ──────────────────────────────────────────────────
function PromptsSection() {
  const { state, dispatch, toast } = useStore();
  return (
    <div>
      <SectionTitle title="Caption prompts" desc={
        <>The LLM uses these when you click Generate. Available variables: <code className="mono">{'{{title}}'}</code>, <code className="mono">{'{{topic}}'}</code>, <code className="mono">{'{{type}}'}</code>.</>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}>
        {state.topics.map(t => (
          <PromptCard key={t.id} topic={t} prompt={state.settings.prompts[t.id]} />
        ))}
      </div>
    </div>
  );
}

function PromptCard({ topic, prompt }) {
  const { dispatch, toast } = useStore();
  const [draft, setDraft] = React.useState(prompt?.system || '');
  const [maxT, setMaxT] = React.useState(prompt?.maxTokens || 512);
  const [temp, setTemp] = React.useState(prompt?.temperature || 0.7);
  const save = () => {
    dispatch({ type: 'updateSettingsPath', path: ['prompts'], patch: { [topic.id]: { ...prompt, system: draft, maxTokens: maxT, temperature: temp } } });
    toast(`${topic.name} prompt saved`, 'ok');
  };
  if (!prompt) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <TopicChip topicId={topic.id} />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: UI.muted }}>No prompt yet</span>
        </div>
        <Btn size="sm" kind="primary" onClick={() => dispatch({ type: 'updateSettingsPath', path: ['prompts'], patch: { [topic.id]: { model: 'claude-haiku-4-5', maxTokens: 512, temperature: 0.7, system: 'You are writing a caption for "{{title}}" ({{topic}}). Voice: ' + topic.desc + '. 3-5 short sentences. Include 3 hashtags.' } } })}>
          Create prompt
        </Btn>
      </Card>
    );
  }
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TopicChip topicId={topic.id} />
        <div style={{ flex: 1 }} />
        <Pill tone="soft" size="sm" icon={<Icon name="sparkles" size={10} />}>{prompt.model}</Pill>
      </div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={6}
        style={{
          width: '100%', padding: 10, fontSize: 12, lineHeight: 1.5,
          border: `1px solid ${UI.line}`, borderRadius: 6, background: UI.panel2,
          fontFamily: UI.mono, color: UI.ink2, resize: 'vertical', outline: 'none',
        }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11.5 }}>
        <span style={{ color: UI.muted }}>tokens</span>
        <Field value={maxT} sm onChange={(v) => setMaxT(+v)} w={60} />
        <span style={{ color: UI.muted }}>temp</span>
        <Field value={temp} sm onChange={(v) => setTemp(+v)} w={50} />
        <div style={{ flex: 1 }} />
        <Btn size="sm" kind="ghost" icon={<Icon name="sparkles" size={11} />}>Test</Btn>
        <Btn size="sm" kind="primary" onClick={save}>Save</Btn>
      </div>
    </Card>
  );
}

// ─── Topics ───────────────────────────────────────────────────
function TopicsSection() {
  const { state, dispatch, toast } = useStore();
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

  const commit = () => {
    if (!draft.name.trim()) return;
    const id = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    dispatch({ type: 'addTopic', topic: { id, name: draft.name, desc: draft.desc, color: '#8a6c4e', emoji: '◇', promptKey: id } });
    toast(`Added topic "${draft.name}"`, 'ok');
    setAdding(false); setDraft({ name: '', desc: '' });
  };
  return (
    <div>
      <SectionTitle title="Topics &amp; categories" desc="Define style/voice categories. Each topic gets its own LLM prompt template and color.">
        <Btn size="sm" kind="primary" icon={<Icon name="plus" size={12} />} onClick={() => setAdding(true)}>New topic</Btn>
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {state.topics.map(t => (
          <Card key={t.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <TopicChip topicId={t.id} />
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: UI.muted }}>{counts[t.id] || 0} assets · {postCounts[t.id] || 0} posts</span>
            </div>
            <div style={{ fontSize: 12.5, color: UI.ink2, marginBottom: 10 }}>{t.desc}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" kind="ghost" icon={<Icon name="edit" size={11} />}>Rename</Btn>
              <div style={{ flex: 1 }} />
              <Btn size="sm" kind="ghost" style={{ color: UI.accent }}
                onClick={() => { if (confirm(`Delete "${t.name}"?`)) dispatch({ type: 'deleteTopic', id: t.id }); }}>Delete</Btn>
            </div>
          </Card>
        ))}
        {adding && (
          <Card style={{ borderColor: UI.accent, borderWidth: 1.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Name (e.g. Travel)" autoFocus />
              <Field value={draft.desc} onChange={(v) => setDraft({ ...draft, desc: v })} placeholder="Voice guidance" />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Btn size="sm" kind="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
                <Btn size="sm" kind="primary" onClick={commit}>Add</Btn>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Pattern summary ──────────────────────────────────────────
function PatternSection() {
  const { state } = useStore();
  return (
    <div>
      <SectionTitle title="Daily pattern" desc="Summary of how posts are scheduled. Edit in Planner → Pattern.">
        <Btn size="sm" kind="ghost" suffix={<Icon name="arrowright" size={11} />} onClick={() => window.location.hash = '#/planner'}>
          Edit in Planner
        </Btn>
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Slots per day</div>
            <span className="mono" style={{ fontSize: 16, fontWeight: 600 }}>{state.pattern.slots.length}</span>
          </div>
          {state.pattern.slots.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '24px 60px 60px 1fr', gap: 8, padding: '6px 0', alignItems: 'center', borderTop: i > 0 ? `1px solid ${UI.line2}` : 'none', fontSize: 12.5 }}>
              <span className="mono" style={{ color: UI.muted }}>{i + 1}</span>
              <span className="mono">{s.time}</span>
              <Pill tone="soft" size="sm" icon={<Icon name={s.mediaType === 'video' ? 'video' : 'image'} size={10} />}>{s.mediaType}</Pill>
              <TopicChip topicId={s.defaultTopic} size="sm" />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <SectionLabel>Rotation</SectionLabel>
              <Pill tone="contrast" size="sm">{state.pattern.rotation === 'alternate-by-day' ? 'Alternate by day' : 'Fixed per slot'}</Pill>
            </div>
            <div>
              <SectionLabel>Active days</SectionLabel>
              <div style={{ display: 'flex', gap: 3 }}>
                {['S','M','T','W','T','F','S'].map((l, d) => (
                  <div key={d} style={{
                    width: 28, height: 28, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: state.pattern.daysOfWeek.includes(d) ? UI.ink : UI.panel2,
                    color: state.pattern.daysOfWeek.includes(d) ? '#fff' : UI.muted,
                    fontSize: 11, fontWeight: 600, border: `1px solid ${state.pattern.daysOfWeek.includes(d) ? UI.ink : UI.line}`,
                  }}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionLabel>Live preview — next 5 active days</SectionLabel>
        <PatternPreview pattern={state.pattern} topics={state.topics} />
      </div>
    </div>
  );
}

// ─── Drive ────────────────────────────────────────────────────
function DriveSection() {
  const { state, dispatch, toast } = useStore();
  return (
    <div>
      <SectionTitle title="Google Drive folders" desc="Where uploaded files land. Subfolders are created per topic.">
        <Btn size="sm" kind="ghost" icon={<Icon name="external" size={12} />}>Reconnect Google</Btn>
      </SectionTitle>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: UI.muted }}>Videos root</div>
          <Field value={state.settings.drive.videosRoot} onChange={(v) => dispatch({ type: 'updateSettingsPath', path: ['drive'], patch: { videosRoot: v } })} prefix={<Icon name="drive" size={13} color={UI.muted} />} />
          <div style={{ fontSize: 12, color: UI.muted }}>Pictures root</div>
          <Field value={state.settings.drive.picturesRoot} onChange={(v) => dispatch({ type: 'updateSettingsPath', path: ['drive'], patch: { picturesRoot: v } })} prefix={<Icon name="drive" size={13} color={UI.muted} />} />
          <div style={{ fontSize: 12, color: UI.muted }}>Organize by</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['topic', 'Topic subfolders'], ['flat', 'Flat']].map(([v, l]) => (
              <button key={v} onClick={() => dispatch({ type: 'updateSettingsPath', path: ['drive'], patch: { organizeBy: v } })} style={{
                padding: '5px 10px', fontSize: 12, borderRadius: 4,
                background: state.settings.drive.organizeBy === v ? UI.ink : UI.panel,
                color: state.settings.drive.organizeBy === v ? '#fff' : UI.ink2,
                border: `1px solid ${state.settings.drive.organizeBy === v ? UI.ink : UI.line}`,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </Card>
      <SectionLabel>Resulting paths</SectionLabel>
      <div style={{ background: UI.panel2, borderRadius: 6, padding: 14, fontFamily: UI.mono, fontSize: 11.5, color: UI.ink2, lineHeight: 1.7 }}>
        {state.topics.map(t => (
          <div key={t.id} style={{ display: 'flex', gap: 8 }}>
            <Icon name="drive" size={12} color={UI.muted} />
            <span>{state.settings.drive.videosRoot}/<b style={{ color: UI.ink }}>{state.settings.drive.organizeBy === 'topic' ? t.id : ''}</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rename ───────────────────────────────────────────────────
function RenameSection() {
  const { state, dispatch, toast } = useStore();
  const [testResults, setTestResults] = React.useState(null);
  const cfg = state.settings.renaming;

  const runTest = () => {
    // Build before/after pairs from a sample of scheduled posts with assets
    const sample = state.posts.filter(p => p.assetId && p.captionStatus === 'final')
      .slice(0, 6).map((p, i) => {
        const a = state.assets.find(x => x.id === p.assetId);
        const topic = state.topics.find(t => t.id === p.topicId);
        const ext = a.filename.split('.').pop();
        const newName = cfg.template
          .replace('{{date}}', p.date)
          .replace('{{topic}}', topic?.id || 'business')
          .replace('{{seq}}', '-' + String(i + 1).padStart(2, '0'))
          .replace('{{ext}}', ext);
        return { before: a.filename, after: newName, date: p.date, status: 'preview' };
      });
    setTestResults(sample);
    toast('Dry run — nothing changed in Drive', 'warn');
  };

  return (
    <div>
      <SectionTitle title="File renaming"
        desc="Future automation: rename Drive files to a date-based format once their post is scheduled or posted." />

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Enable automatic renaming</div>
            <div style={{ fontSize: 11.5, color: UI.muted }}>When a post's date passes, Drive file is renamed using the template below.</div>
          </div>
          <Toggle checked={cfg.enabled} onChange={(v) => dispatch({ type: 'updateSettingsPath', path: ['renaming'], patch: { enabled: v } })} />
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionLabel>Template</SectionLabel>
        <Field value={cfg.template} onChange={(v) => dispatch({ type: 'updateSettingsPath', path: ['renaming'], patch: { template: v } })} prefix={<Icon name="edit" size={13} color={UI.muted} />} />
        <div style={{ marginTop: 10, fontSize: 11.5, color: UI.muted, lineHeight: 1.6 }}>
          Variables: <code className="mono">{'{{date}}'}</code>, <code className="mono">{'{{topic}}'}</code>, <code className="mono">{'{{seq}}'}</code>, <code className="mono">{'{{ext}}'}</code>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: UI.muted }}>Apply on:</span>
          {[['after-scheduled', 'After scheduled date'], ['after-exported', 'After exported'], ['manual', 'Manual only']].map(([v, l]) => (
            <button key={v} onClick={() => dispatch({ type: 'updateSettingsPath', path: ['renaming'], patch: { applyOn: v } })} style={{
              padding: '4px 9px', fontSize: 11.5, borderRadius: 4,
              background: cfg.applyOn === v ? UI.ink : UI.panel,
              color: cfg.applyOn === v ? '#fff' : UI.ink2,
              border: `1px solid ${cfg.applyOn === v ? UI.ink : UI.line}`,
            }}>{l}</button>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Dry run</div>
          <span style={{ fontSize: 11, color: UI.muted }}>Preview example renames using the current template. No files in Drive are touched.</span>
          <div style={{ flex: 1 }} />
          <Btn size="sm" kind="primary" icon={<Icon name="sparkles" size={12} />} onClick={runTest}>Run test</Btn>
        </div>
        {testResults ? (
          <div style={{ border: `1px solid ${UI.line}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 16px 1fr 80px', gap: 8, padding: '8px 12px', background: UI.panel2, fontSize: 10.5, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <div>Date</div><div>Before</div><div></div><div>After</div><div>Status</div>
            </div>
            {testResults.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 16px 1fr 80px', gap: 8, padding: '8px 12px', alignItems: 'center', fontSize: 11.5, borderTop: `1px solid ${UI.line2}` }}>
                <span className="mono" style={{ color: UI.muted }}>{r.date}</span>
                <span className="mono truncate">{r.before}</span>
                <Icon name="arrowright" size={11} color={UI.muted} />
                <span className="mono truncate" style={{ color: UI.ok, fontWeight: 500 }}>{r.after}</span>
                <Pill tone="warn" size="sm">preview</Pill>
              </div>
            ))}
            <div style={{ padding: '10px 12px', background: UI.panel2, borderTop: `1px solid ${UI.line2}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="info" size={12} color={UI.muted} />
              <span style={{ fontSize: 11.5, color: UI.muted }}>Looks good? Enable automatic renaming above to apply this to future posts.</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: 22, background: UI.panel2, borderRadius: 6, textAlign: 'center', fontSize: 12, color: UI.muted }}>
            Click "Run test" to preview renames against 6 sample posts.
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Planable export config ───────────────────────────────────
function PlanableSection() {
  const { state, dispatch } = useStore();
  return (
    <div>
      <SectionTitle title="Planable export defaults" desc="Default columns and behavior when generating a CSV. You can still override per-export." />
      <Card>
        <SectionLabel>Default columns</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['date','time','caption','media_url','type','topic','status'].map(c => {
            const on = state.settings.planable.columns.includes(c) || (c === 'status' && state.settings.planable.includeStatusColumn);
            return (
              <button key={c} onClick={() => {
                if (c === 'status') {
                  dispatch({ type: 'updateSettingsPath', path: ['planable'], patch: { includeStatusColumn: !state.settings.planable.includeStatusColumn } });
                } else {
                  const cols = on ? state.settings.planable.columns.filter(x => x !== c) : [...state.settings.planable.columns, c];
                  dispatch({ type: 'updateSettingsPath', path: ['planable'], patch: { columns: cols } });
                }
              }}>
                <Pill tone={on ? 'contrast' : 'ghost'} size="sm" icon={on ? <Icon name="check" size={10} /> : null}>{c}</Pill>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Danger zone ──────────────────────────────────────────────
function DangerSection() {
  return (
    <div>
      <SectionTitle title="Danger zone" />
      <Card style={{ borderColor: UI.accent, background: UI.accentBg + '40' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: UI.accentInk, marginBottom: 4 }}>Reset prototype state</div>
        <div style={{ fontSize: 12, color: UI.ink2, marginBottom: 10 }}>Clears all changes in this session and reloads with the default sample data.</div>
        <Btn kind="danger" onClick={() => window.location.reload()}>Reset</Btn>
      </Card>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────
function SectionTitle({ title, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3, marginBottom: 4 }}>{title}</div>
        {desc && <div style={{ fontSize: 12.5, color: UI.muted, maxWidth: 640, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 36, height: 22, borderRadius: 999, background: checked ? UI.ink : UI.line,
      position: 'relative', border: 'none', cursor: 'pointer', transition: 'background .15s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 16 : 2, width: 18, height: 18,
        background: '#fff', borderRadius: 999, transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  );
}

Object.assign(window, { SettingsScreen });
