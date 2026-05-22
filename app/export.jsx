// Export — turns the planner into a real Planable CSV download.
// Column layout matches the reference sheet's "Planable CSV Output" tab.

const PLANABLE_HEADERS = ['TITLE- Videos', 'Text', 'DateAndTime', '', 'PICTURES',
  '', 'Description ', 'Quote', 'DateAndTime', 'Attachment '];

function plannerRowCells(r) {
  const v = r.video || {}, p = r.picture || {};
  return [v.title || '', v.text || '', v.dateTime || '', r.postedRaw || '',
    '', '', p.description || '', p.quote || '', p.dateTime || '', p.attachment || ''];
}
function csvEscape(s) {
  s = String(s == null ? '' : s);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function buildCsv(rows) {
  const lines = [PLANABLE_HEADERS.map(csvEscape).join(',')];
  rows.forEach(r => lines.push(plannerRowCells(r).map(csvEscape).join(',')));
  return lines.join('\r\n');
}
function downloadCsv(filename, text) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ExportScreen() {
  const { state, dispatch, toast } = useStore();
  const rows = state.planner;

  const [scope, setScope] = React.useState('pending');
  const [markPosted, setMarkPosted] = React.useState(true);
  const today = window.DATA.iso(window.DATA.TODAY);
  const [filename, setFilename] = React.useState(`planable_nikky_${today}.csv`);
  const [done, setDone] = React.useState(0);

  const isPending = (r) => !r.posted && (r.postedRaw || '').toLowerCase() !== 'na';
  const filtered = rows.filter(r => {
    if (scope === 'pending') return isPending(r);
    if (scope === 'posted') return r.posted;
    return true;
  });
  const csv = React.useMemo(() => buildCsv(filtered), [filtered]);

  const counts = {
    all: rows.length,
    pending: rows.filter(isPending).length,
    posted: rows.filter(r => r.posted).length,
  };

  const doExport = () => {
    if (filtered.length === 0) { toast('Nothing to export in this scope', 'warn'); return; }
    downloadCsv(filename, csv);
    if (markPosted) {
      dispatch({ type: 'markPlannerPosted', ids: filtered.map(r => r.id) });
      dispatch({ type: 'logActivity', text: `Exported ${filtered.length} rows → ${filename}` });
    }
    setDone(filtered.length);
    toast(`Downloaded ${filename} · ${filtered.length} rows`, 'ok');
  };

  const copyCsv = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(csv);
    toast('CSV copied to clipboard', 'ok');
  };

  const scopes = [
    ['pending', 'Pending', 'Rows not yet on Planable', counts.pending],
    ['posted', 'On Planable', 'Already-posted rows', counts.posted],
    ['all', 'Everything', 'Every planner row', counts.all],
  ];

  return (
    <>
      <ScreenHeader title="Export to Planable" sub="Generates a CSV matching Planable's import schema">
        <Btn size="sm" kind="ghost" icon={<Icon name="copy" size={12} />} onClick={copyCsv}
          disabled={filtered.length === 0}>Copy CSV</Btn>
      </ScreenHeader>

      {rows.length === 0 ? (
        <Empty icon={<Icon name="exporticon" size={28} color={UI.faint} />}
          title="Nothing to export yet"
          desc="Build the schedule on the Planner screen first." />
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '340px 1fr' }}>
          {/* Left: form */}
          <div className="scroll" style={{ overflow: 'auto', padding: 22, borderRight: `1px solid ${UI.line}`,
            background: UI.panel2, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <Step n={1} label="What to export" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {scopes.map(([id, label, desc, count]) => (
                  <button key={id} onClick={() => setScope(id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', textAlign: 'left',
                    borderRadius: 6, border: `1px solid ${scope === id ? UI.accent : UI.line}`,
                    background: scope === id ? UI.accentBg : UI.panel, cursor: 'pointer',
                  }}>
                    <span style={{ width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                      border: `4px solid ${scope === id ? UI.accent : UI.line}`, background: UI.panel }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 11, color: UI.muted }}>{desc}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600,
                      color: scope === id ? UI.accentInk : UI.muted }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Step n={2} label="After download" />
              <label className="clickable" style={{ display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '6px 8px', marginLeft: -8, borderRadius: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={markPosted} onChange={(e) => setMarkPosted(e.target.checked)} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Mark exported rows as "on Planable"</div>
                  <div style={{ fontSize: 11, color: UI.muted, marginTop: 1 }}>Sets column D = 1 so they drop out of "Pending".</div>
                </div>
              </label>
            </div>

            <div>
              <Step n={3} label="Filename" />
              <Field value={filename} sm onChange={setFilename} w="100%" />
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, color: UI.ink }}>{filtered.length}</span>
                  <span style={{ fontSize: 12, color: UI.muted }}>rows in this CSV</span>
                </div>
              </div>
              <Btn kind="accent" style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14 }}
                icon={<Icon name="download" size={14} />} onClick={doExport} disabled={filtered.length === 0}>
                Download CSV ({filtered.length} rows)
              </Btn>
              {done > 0 && (
                <div style={{ marginTop: 10, padding: 10, background: UI.okBg, borderRadius: 6, fontSize: 12, color: UI.ok,
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={12} /> Downloaded {done} rows{markPosted ? ' · marked on Planable' : ''}.
                </div>
              )}
            </div>
          </div>

          {/* Right: preview */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: UI.panel }}>
            <div style={{ padding: '10px 20px', borderBottom: `1px solid ${UI.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Preview</div>
              <Pill tone="soft" size="sm">Planable CSV Output schema</Pill>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11.5, color: UI.muted }}>Showing {Math.min(40, filtered.length)} of {filtered.length}</span>
            </div>
            <div className="scroll" style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'grid',
                gridTemplateColumns: EXPORT_COLS, background: UI.panel2, borderBottom: `1px solid ${UI.line}`,
                fontSize: 10, color: UI.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {['Title', 'Text', 'Date', 'D', 'Description', 'Quote', 'Date', 'Attachment'].map((h, i) => (
                  <div key={i} style={{ padding: '7px 10px', borderRight: i < 7 ? `1px solid ${UI.line2}` : 'none' }}>{h}</div>
                ))}
              </div>
              {filtered.length === 0
                ? <Empty title="No rows in this scope" desc="Pick a different option on the left." />
                : filtered.slice(0, 40).map((r, i) => {
                    const v = r.video || {}, p = r.picture || {};
                    const cell = (txt, mono) => (
                      <div className="truncate" style={{ padding: '7px 10px', borderRight: `1px solid ${UI.line2}`,
                        fontSize: 11, fontFamily: mono ? UI.mono : UI.font, color: UI.ink2 }} title={txt}>{txt}</div>
                    );
                    return (
                      <div key={r.id} style={{ display: 'grid', gridTemplateColumns: EXPORT_COLS,
                        borderBottom: `1px solid ${UI.line2}`, background: r.posted ? UI.panel2 : UI.panel }}>
                        {cell(v.title || '')}
                        {cell(v.text || '')}
                        {cell(v.dateTime || '', true)}
                        <div style={{ padding: '7px 10px', borderRight: `1px solid ${UI.line2}`, fontSize: 11 }}>
                          {r.postedRaw || <span style={{ color: UI.faint }}>—</span>}
                        </div>
                        {cell(p.description || '')}
                        {cell(p.quote || '', true)}
                        {cell(p.dateTime || '', true)}
                        {cell(p.attachment || '', true)}
                      </div>
                    );
                  })}
              {filtered.length > 40 && (
                <div style={{ padding: '10px 20px', fontSize: 11.5, color: UI.muted, textAlign: 'center', background: UI.panel2 }}>
                  + {filtered.length - 40} more rows in the file…
                </div>
              )}
            </div>
            <div style={{ padding: '8px 20px', borderTop: `1px solid ${UI.line}`, background: UI.panel2,
              fontSize: 11.5, color: UI.muted }}>
              UTF-8 · comma-delimited · 10-column Planable layout (Title, Text, DateAndTime, D, PICTURES, ·, Description, Quote, DateAndTime, Attachment)
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const EXPORT_COLS = 'minmax(110px,1.1fr) minmax(150px,1.7fr) 92px 40px minmax(150px,1.6fr) minmax(140px,1.5fr) 92px minmax(90px,1fr)';

function Step({ n, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, background: UI.ink, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{n}</span>
      <span style={{ fontSize: 11, color: UI.muted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

Object.assign(window, { ExportScreen });
