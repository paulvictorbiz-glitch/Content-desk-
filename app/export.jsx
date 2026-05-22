// Export — pick a range, preview CSV, generate.

function ExportScreen() {
  const { state, dispatch, toast } = useStore();
  const { route, go } = useRoute();

  const today = window.DATA.iso(window.DATA.TODAY);
  const next30 = window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, 30));

  const [from, setFrom] = React.useState(route.query.from || today);
  const [to, setTo] = React.useState(route.query.to || next30);
  const [finalOnly, setFinalOnly] = React.useState(true);
  const [skipExported, setSkipExported] = React.useState(true);
  const [includeDriveUrl, setIncludeDriveUrl] = React.useState(true);
  const [includeStatusColumn, setIncludeStatusColumn] = React.useState(state.settings.planable.includeStatusColumn);
  const [filename, setFilename] = React.useState(`planable_nikky_${from.slice(5)}-${to.slice(5)}.csv`);
  const [exported, setExported] = React.useState(false);

  React.useEffect(() => {
    setFilename(`planable_nikky_${from.slice(5)}-${to.slice(5)}.csv`);
  }, [from, to]);

  // Eligible rows
  const allRows = state.posts.filter(p => p.date >= from && p.date <= to)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const filteredRows = allRows.filter(p => {
    if (finalOnly && p.captionStatus !== 'final') return false;
    if (skipExported && p.exportStatus === 'exported') return false;
    return true;
  });
  const excluded = allRows.length - filteredRows.length;
  const excludedReasons = [];
  if (finalOnly) {
    const n = allRows.filter(p => p.captionStatus !== 'final').length;
    if (n) excludedReasons.push(`${n} not final`);
  }
  if (skipExported) {
    const n = allRows.filter(p => p.exportStatus === 'exported').length;
    if (n) excludedReasons.push(`${n} already exported`);
  }

  // CSV columns
  const columns = ['date', 'time', 'caption', includeDriveUrl ? 'media_url' : null, 'type', 'topic',
    includeStatusColumn ? 'status' : null].filter(Boolean);

  const assetMap = React.useMemo(() => Object.fromEntries(state.assets.map(a => [a.id, a])), [state.assets]);

  const cellFor = (p, col) => {
    if (col === 'date') return p.date;
    if (col === 'time') return p.time;
    if (col === 'caption') return p.captionText;
    if (col === 'media_url') {
      const a = p.assetId ? assetMap[p.assetId] : null;
      return a ? `drive.google.com/file/d/${a.driveId}` : '';
    }
    if (col === 'type') return p.type;
    if (col === 'topic') return state.topics.find(t => t.id === p.topicId)?.name || p.topicId;
    if (col === 'status') return p.captionStatus === 'final' ? 'final' : 'needs-review';
    return '';
  };

  const generate = () => {
    if (filteredRows.length === 0) { toast('Nothing to export', 'warn'); return; }
    dispatch({ type: 'markExported', postIds: filteredRows.map(p => p.id), filename });
    setExported(true);
    toast(`Exported ${filteredRows.length} rows — ${filename}`, 'ok');
  };

  const presets = [
    ['this-week', 'This week', 0, 6],
    ['next-7', 'Next 7', 0, 7],
    ['next-30', 'Next 30', 0, 30],
    ['this-month', 'This month', -window.DATA.TODAY.getDate() + 1, 31 - window.DATA.TODAY.getDate()],
  ];
  const setPreset = (off, len) => {
    const f = window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, off));
    const t = window.DATA.iso(window.DATA.addDays(window.DATA.TODAY, off + len));
    setFrom(f); setTo(t);
  };

  return (
    <>
      <ScreenHeader title="Export to Planable" sub="Generate a CSV matching Planable's import schema">
        <Btn kind="ghost" icon={<Icon name="clock" size={13} />}>Recent exports</Btn>
      </ScreenHeader>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '360px 1fr' }}>
        {/* Left panel: form */}
        <div className="scroll" style={{
          overflow: 'auto', padding: 22, borderRight: `1px solid ${UI.line}`, background: UI.panel2,
          display: 'flex', flexDirection: 'column', gap: 22,
        }}>
          <div>
            <Step n={1} label="Date range" />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
              <Field value={from} sm onChange={setFrom} w={130} type="date" prefix={<Icon name="calendar" size={12} color={UI.muted} />} />
              <Icon name="arrowright" size={12} color={UI.muted} />
              <Field value={to} sm onChange={setTo} w={130} type="date" prefix={<Icon name="calendar" size={12} color={UI.muted} />} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {presets.map(([id, l, off, len]) => (
                <button key={id} onClick={() => setPreset(off, len)} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 999, background: UI.panel, border: `1px solid ${UI.line}`, color: UI.ink2,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <Step n={2} label="Include" />
            <CheckBox checked={finalOnly} onChange={setFinalOnly} label="Final captions only" desc="Skip drafts and empty" />
            <CheckBox checked={skipExported} onChange={setSkipExported} label="Skip already-exported rows" />
            <CheckBox checked={includeDriveUrl} onChange={setIncludeDriveUrl} label="Include Drive share URL" />
          </div>

          <div>
            <Step n={3} label="Columns" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {columns.map(c => <Pill key={c} tone="soft" size="sm" icon={<Icon name="check" size={10} color={UI.ok} />}>{c}</Pill>)}
            </div>
            <CheckBox checked={includeStatusColumn} onChange={(v) => {
              setIncludeStatusColumn(v);
              dispatch({ type: 'updateSettingsPath', path: ['planable'], patch: { includeStatusColumn: v } });
            }} label="Include status column" desc={`Adds "status" with values "final" / "needs-review"`} accent />
          </div>

          <div>
            <Step n={4} label="Filename" />
            <Field value={filename} sm onChange={setFilename} w="100%" />
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1, color: UI.ink }}>{filteredRows.length}</span>
                <span style={{ fontSize: 12, color: UI.muted }}>rows to export</span>
              </div>
              {excluded > 0 && (
                <div style={{ fontSize: 11.5, color: UI.muted, lineHeight: 1.5 }}>
                  <span style={{ color: UI.accent }}>{excluded} excluded</span>
                  {excludedReasons.length ? ' · ' + excludedReasons.join(' · ') : ''}
                </div>
              )}
              {filteredRows.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: UI.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={11} color={UI.ok} /> All {filteredRows.length} have final captions
                </div>
              )}
            </div>
            <Btn kind="accent" style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14 }}
              icon={<Icon name="download" size={14} />} onClick={generate} disabled={filteredRows.length === 0}>
              Generate CSV ({filteredRows.length} rows)
            </Btn>
            {exported && (
              <div style={{ marginTop: 10, padding: 10, background: UI.okBg, border: `1px solid ${UI.ok}33`, borderRadius: 6, fontSize: 12, color: UI.ok }}>
                <Icon name="check" size={12} /> Downloaded. Rows are now marked exported in Planner.
              </div>
            )}
          </div>
        </div>

        {/* Right: CSV preview */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: UI.panel }}>
          <div style={{
            padding: '10px 20px', borderBottom: `1px solid ${UI.line}`,
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Preview</div>
            <Pill tone="soft" size="sm">matches Planable import schema</Pill>
            <div style={{ flex: 1 }} />
            <Btn size="sm" kind="ghost" icon={<Icon name="copy" size={12} />}>Copy</Btn>
            <Btn size="sm" kind="ghost">View raw CSV</Btn>
          </div>

          <div className="scroll" style={{ flex: 1, overflow: 'auto', background: UI.panel }}>
            <div style={{
              position: 'sticky', top: 0, zIndex: 2,
              display: 'grid', gridTemplateColumns: gridCols(columns),
              background: UI.panel2, borderBottom: `1px solid ${UI.line}`,
              fontSize: 10.5, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {columns.map((c, i) => (
                <div key={c} style={{ padding: '8px 12px', borderRight: i < columns.length - 1 ? `1px solid ${UI.line2}` : 'none' }}>{c}</div>
              ))}
            </div>
            {filteredRows.length === 0 ? (
              <Empty title="No rows in this range" desc="Try expanding the date range or turning off 'Final only'." />
            ) : filteredRows.slice(0, 30).map((p, i) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: gridCols(columns),
                borderBottom: `1px solid ${UI.line2}`, fontSize: 11.5, fontFamily: UI.mono,
              }}>
                {columns.map((c, j) => (
                  <div key={c} style={{ padding: '8px 12px', borderRight: j < columns.length - 1 ? `1px solid ${UI.line2}` : 'none' }}
                    className={c === 'caption' || c === 'media_url' ? 'truncate' : ''}>
                    {c === 'status' ? (
                      cellFor(p, c) === 'final'
                        ? <Pill tone="ok" size="sm">final</Pill>
                        : <Pill tone="warn" size="sm">needs-review</Pill>
                    ) : (
                      <span style={{ color: c === 'media_url' ? UI.muted : UI.ink2 }}>{cellFor(p, c)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {filteredRows.length > 30 && (
              <div style={{ padding: '10px 20px', fontSize: 11.5, color: UI.muted, textAlign: 'center', background: UI.panel2 }}>
                + {filteredRows.length - 30} more rows in the CSV…
              </div>
            )}
          </div>

          <div style={{ padding: '8px 20px', borderTop: `1px solid ${UI.line}`, background: UI.panel2, fontSize: 11.5, color: UI.muted, display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            <span>UTF-8 · comma-delimited · double-quoted</span>
            <Sep />
            <span>Showing {Math.min(30, filteredRows.length)} of {filteredRows.length}</span>
            <div style={{ flex: 1 }} />
            <span>After export, these rows will be marked <Pill tone="ok" size="sm">exported</Pill> in Planner.</span>
          </div>
        </div>
      </div>
    </>
  );
}

function gridCols(columns) {
  // tune relative widths
  const map = {
    date:       '90px', time: '60px', caption: 'minmax(220px, 2fr)',
    media_url:  'minmax(160px, 1.2fr)', type: '60px', topic: '110px', status: '110px',
  };
  return columns.map(c => map[c] || '1fr').join(' ');
}

function Step({ n, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999, background: UI.ink, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
      }}>{n}</span>
      <span style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function CheckBox({ checked, onChange, label, desc, accent }) {
  return (
    <label className="clickable" style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 8px', marginLeft: -8,
      borderRadius: 4, cursor: 'pointer',
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: accent && checked ? UI.accentInk : UI.ink }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: UI.muted, marginTop: 1 }}>{desc}</div>}
      </div>
    </label>
  );
}

Object.assign(window, { ExportScreen });
