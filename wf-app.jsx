// Main wireframe canvas — composes all screens into a DesignCanvas

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

function App() {
  return (
    <DesignCanvas minScale={0.1} maxScale={2}>
      {/* SYSTEM MAP */}
      <DCSection id="map" title="System map" subtitle="Top tabs · 4 core areas + dashboard & settings · single workspace / single client (Nikky)">
        <DCArtboard id="flow" label="Flow & navigation" width={1280} height={620}>
          <SystemMap />
        </DCArtboard>
      </DCSection>

      {/* DASHBOARD */}
      <DCSection id="dashboard" title="Dashboard" subtitle="Landing screen — at-a-glance state across the pipeline">
        <DCArtboard id="dash" label="Dashboard · Today" width={1280} height={800}>
          <Dashboard />
        </DCArtboard>
      </DCSection>

      {/* ASSETS */}
      <DCSection id="assets" title="Assets" subtitle="Upload → library table → detail. Flow #1: drop files, set defaults, push to Drive.">
        <DCArtboard id="library" label="Library (empty filters)" width={1280} height={800}>
          <AssetsLibrary />
        </DCArtboard>
        <DCArtboard id="upload" label="Upload — bulk dialog" width={1280} height={800}>
          <AssetsLibrary withModal />
        </DCArtboard>
        <DCArtboard id="drawer" label="Asset detail · right drawer" width={1280} height={800}>
          <AssetsLibrary withDrawer />
        </DCArtboard>
      </DCSection>

      {/* PLANNER */}
      <DCSection id="planner" title="Planner" subtitle="Spreadsheet-tight table. Flow #2: add row → link asset → style auto-alternates. All cells inline-editable.">
        <DCArtboard id="planner-base" label="Planner · default view" width={1280} height={800}>
          <Planner />
        </DCArtboard>
        <DCArtboard id="planner-annotated" label="Planner · with annotations" width={1280} height={800}>
          <Planner withAnnotations />
        </DCArtboard>
        <DCArtboard id="planner-asset-picker" label="Asset picker (inline cell edit)" width={1280} height={800}>
          <Planner withAssetPicker />
        </DCArtboard>
      </DCSection>

      {/* CAPTIONS */}
      <DCSection id="captions" title="Captions" subtitle="Flow #3: pick a post → preview + style → generate / edit / mark final. Plus batch action.">
        <DCArtboard id="captions-split" label="Split view · list + editor" width={1280} height={800}>
          <Captions />
        </DCArtboard>
        <DCArtboard id="captions-batch" label="Batch generate · 7 empty" width={1280} height={800}>
          <Captions withBatch />
        </DCArtboard>
      </DCSection>

      {/* EXPORT */}
      <DCSection id="export" title="Export &amp; Settings" subtitle="Flow #4: pick a range, preview the CSV, generate. Settings holds Drive paths, prompt templates, and the future rename action.">
        <DCArtboard id="export" label="Export to Planable" width={1280} height={800}>
          <ExportScreen />
        </DCArtboard>
        <DCArtboard id="settings" label="Settings · Caption prompts" width={1280} height={800}>
          <Settings />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function SystemMap() {
  // A diagram showing the 6 tabs as connected nodes + the 4 main flows
  return (
    <WFShell style={{ padding: 32, position: 'relative' }}>
      <div style={{ fontSize: 13, color: WF.muted, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>v0.1 · internal tool · single power user</div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginBottom: 20 }}>contentdesk — Nikky Kho workflow</div>

      {/* Tab strip mock */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${WF.line}`, paddingBottom: 0 }}>
        {[
          ['Dashboard', '#1'],
          ['Assets', '#2'],
          ['Planner', '#3'],
          ['Captions', '#4'],
          ['Export', '#5'],
          ['Settings', '·'],
        ].map(([t, n], i) => (
          <div key={t} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            border: `1px solid ${WF.line}`, borderBottom: 'none',
            background: WF.bg2, color: WF.ink, marginBottom: -1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t}
            <span style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono }}>{n}</span>
          </div>
        ))}
      </div>

      {/* Flow diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, position: 'relative' }}>
        {[
          {
            n: '1',
            t: 'Upload assets',
            tab: 'Assets',
            steps: [
              'Drop videos/images',
              'Pick client · type · style',
              'Push to right Drive folder',
              'Asset appears in library table',
            ],
            out: 'Drive ID, filename, type, style, client → Postgres',
          },
          {
            n: '2',
            t: 'Plan posts',
            tab: 'Planner',
            steps: [
              '+ Add row (date auto-fills)',
              'Link asset (picker)',
              'Style auto-alternates',
              'Adjust date/time inline',
            ],
            out: 'Spreadsheet-tight table → Postgres',
          },
          {
            n: '3',
            t: 'Write captions',
            tab: 'Captions',
            steps: [
              'Filter to "not final"',
              'Generate (LLM, style-aware)',
              'Edit, regenerate, finalize',
              'Or batch all empties',
            ],
            out: 'Caption text + status → Postgres',
          },
          {
            n: '4',
            t: 'Export to Planable',
            tab: 'Export',
            steps: [
              'Pick date range',
              'Preview CSV (Planable schema)',
              'Download',
              'Rows marked exported',
            ],
            out: 'planable_nikky_*.csv → drag into Planable',
          },
        ].map((f) => (
          <div key={f.n} style={{ border: `1px solid ${WF.line}`, background: WF.bg, padding: 14, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: WF.ink, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: WF.mono, fontSize: 12, fontWeight: 700,
              }}>{f.n}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{f.t}</div>
            </div>
            <Pill subtle style={{ fontSize: 10.5, marginBottom: 8 }}>tab: {f.tab}</Pill>
            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: WF.ink2, lineHeight: 1.6 }}>
              {f.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <div style={{ marginTop: 10, padding: 8, background: WF.bg2, fontSize: 10.5, color: WF.muted, fontFamily: WF.mono, lineHeight: 1.4 }}>
              {f.out}
            </div>
          </div>
        ))}
      </div>

      {/* Stack note */}
      <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stack assumption</div>
        <div style={{ flex: 1, height: 1, background: WF.line }} />
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Next.js / React (this UI)', 'FastAPI', 'Supabase / Postgres', 'Google Drive API', 'Claude (captions)'].map(s => (
          <Pill key={s} subtle style={{ fontSize: 11 }}>{s}</Pill>
        ))}
      </div>

      <DCPostIt top={28} right={32} rotate={3} width={200}>
        Top tabs — fastest for a power user who lives in this app day-to-day. Sidebar felt too "SaaS dashboard" for a personal tool.
      </DCPostIt>
    </WFShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
